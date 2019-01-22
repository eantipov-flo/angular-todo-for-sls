import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { defer, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Todo } from './todo';
import { TodoDataService } from './todo-data.service';

function asyncData(data: any): Observable<any> {
  return defer(() => Promise.resolve(data));
}

describe('TodoDataService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let todoService: TodoDataService;
  let testArray: Todo[];
  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TodoDataService],
    });
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    todoService = TestBed.get(TodoDataService);
    testArray = [
      {
        id: '1',
        task: 'Something for todo #1',
        status: false,
        createdAt: new Date().getTime().toString(),
      },
      {
        id: '2',
        task: 'Something for todo#2',
        status: false,
        createdAt: new Date().getTime().toString(),
      },
      {
        id: '3',
        task: 'Something for todo #3',
        status: false,
        createdAt: new Date().getTime().toString(),
      },
    ];
    todoService.todoArray = testArray;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('#GetTodo test GET request', () => {
    it('Get todos list', () => {
      todoService.todoArray = [];
      expect(todoService.todoArray).toEqual([], 'todoArray must be empty');
      todoService.getTodo().subscribe();
      const req = httpTestingController.expectOne(`${todoService.reqUrl}/todos/get`);
      expect(req.request.method).toEqual('GET', 'Request method');
      req.flush({ data: testArray });
      expect(todoService.todoArray).toEqual(testArray, 'Compare local array with test array');
    });

    it('Test with empty todo array', () => {
      todoService.getTodo().subscribe();
      const req = httpTestingController.expectOne(`${todoService.reqUrl}/todos/get`);
      req.flush({ data: [] });
      expect(todoService.todoArray).toEqual([], 'Length empty array');
    });

    it('Test with spyOn', async () => {
      todoService.todoArray = [];
      await spyOn(httpClient, 'get').and.returnValue(asyncData({ data: testArray }));
      await todoService.getTodo().subscribe();
      expect(todoService.todoArray).toEqual(testArray, 'Compare local array with test array');
    });
  });

  describe('#CreateTodo test POST request', () => {
    it('Create todo', () => {
      const newTodo: Todo = {
        id: '123',
        task: 'Something for todo AGAIN',
        status: false,
        createdAt: new Date().getTime().toString(),
      };
      const expectedLength = todoService.todoArray.length + 1;
      todoService.createTodo(newTodo.task).subscribe();
      const req = httpTestingController.expectOne(`${todoService.reqUrl}/todos/create`);
      expect(req.request.method).toEqual('POST', 'Request method');
      req.flush({ todo: newTodo });
      expect(todoService.todoArray.length).toEqual(expectedLength, 'Compare arrays length');
      expect(todoService.todoArray[expectedLength - 1]).toEqual(newTodo, 'Compare expected Todo with added Todo');
    });
  });

  describe('#editTodo PUT request', () => {
    it('Edit todo request', () => {
      const updateTodo: Todo = {
        id: '1',
        task: 'Updated Task',
        status: true,
        createdAt: new Date().getTime().toString(),
      };
      const expectedLength = todoService.todoArray.length;
      todoService.editTodo(updateTodo).subscribe();
      const req = httpTestingController.expectOne(`${todoService.reqUrl}/todos/update`);
      expect(req.request.method).toEqual('PUT', 'Request method');
      req.flush({ data: updateTodo });
      expect(todoService.todoArray[0]).toEqual(updateTodo, 'Compare updated Todo with Todo update data');
      expect(todoService.todoArray.length).toEqual(expectedLength, 'Check length has not changed');
    });
  });

  describe('#changeStatus All todos PUT request', () => {
    it('Change status all todos test on true', () => {
      const expectedList = JSON.parse(JSON.stringify(testArray));
      expectedList.map(item => item.status = true);
      todoService.changeStatus().subscribe();
      const req = httpTestingController.expectOne(`${todoService.reqUrl}/todos/updateStatus`);
      expect(req.request.method).toEqual('PUT', 'Request method');
      req.flush({ data: expectedList });
      expect(todoService.todoArray).toEqual(expectedList, 'Compare arrays after request(must be all TRUE)');
    });
    it('Change status all todos test on false', () => {
      const expectedList = JSON.parse(JSON.stringify(testArray));
      expectedList.map(item => item.status = false);
      todoService.todoArray.map(item => item.status = true);
      todoService.changeStatus().subscribe();
      const req = httpTestingController.expectOne(`${todoService.reqUrl}/todos/updateStatus`);
      expect(req.request.method).toEqual('PUT', 'Request method');
      req.flush({ data: expectedList });
      expect(todoService.todoArray).toEqual(expectedList, 'Compare arrays after request(must be all FALSE)');
    });
  });
  describe('#DeleteSingle Todo', () => {
    it('Request for delete todo by ID', () => {
      const deletedTodo = todoService.todoArray[0];
      const expectedLength = todoService.todoArray.length;
      todoService.deleteSingle('1').subscribe();
      const req = httpTestingController.expectOne(`${todoService.reqUrl}/todos/delete/1`);
      expect(req.request.method).toEqual('DELETE');
      req.flush({});
      expect(todoService.todoArray[0]).not.toEqual(deletedTodo, 'Compare array elements with 0 index');
      expect(todoService.todoArray.length).not.toBe(expectedLength, 'Compare lengths array');
    });
  });

  describe('#DeleteCompleted', () => {
    it('Request delete completed todo', async () => {
      const arrayTestTrue: Todo[] = [
        {
          id: '4',
          task: 'Something for todo #1',
          status: true,
          createdAt: new Date().getTime().toString(),
        },
        {
          id: '5',
          task: 'Something for todo #2',
          status: true,
          createdAt: new Date().getTime().toString(),
        },
        {
          id: '6',
          task: 'Something for todo #3',
          status: true,
          createdAt: new Date().getTime().toString(),
        },
      ];
      const expectedList = JSON.parse(JSON.stringify(testArray));
      todoService.todoArray.push(arrayTestTrue[0], arrayTestTrue[1], arrayTestTrue[2]);
      expect(todoService.todoArray.length).toEqual(6, 'Length todo array');
      todoService.deleteCompleted().subscribe();
      const reqFalse = httpTestingController.expectOne(`${todoService.reqUrl}/todos/delete/completed`);
      expect(reqFalse.request.method).toEqual('DELETE');
      reqFalse.flush({});
      expect(todoService.todoArray).toEqual(expectedList, 'Compare arr length');
    });
  });

  describe('#DeleteAll', () => {
    it('Request delete completed todo', () => {
      expect(todoService.todoArray.length).toBe(3, 'Length');
      todoService.deleteAll().subscribe();
      const reqFalse = httpTestingController.expectOne(`${todoService.reqUrl}/todos/delete/all`);
      expect(reqFalse.request.method).toEqual('DELETE');
      reqFalse.flush({});
      expect(todoService.todoArray).toEqual([], 'Compare arr length');
    });
  });
  describe('#ShowList Tests', () => {
    beforeEach(() => {
      todoService.todoArray.push({
          id: '4',
          task: 'Something for todo #1',
          status: true,
          createdAt: new Date().getTime().toString(),
        },
        {
          id: '5',
          task: 'Something for todo #2',
          status: true,
          createdAt: new Date().getTime().toString(),
        },
        {
          id: '6',
          task: 'Something for todo #3',
          status: true,
          createdAt: new Date().getTime().toString(),
        },
        {
          id: '7',
          task: 'Something for todo #1',
          status: true,
          createdAt: new Date().getTime().toString(),
        },
        {
          id: '8',
          task: 'Something for todo #2',
          status: true,
          createdAt: new Date().getTime().toString(),
        },
        {
          id: '9',
          task: 'Something for todo #3',
          status: true,
          createdAt: new Date().getTime().toString(),
        });
    });
    it('Show All list', () => {
      const arrayExp: Todo[] = todoService.todoArray.slice(0, 5);
      todoService.todoList.subscribe(data => expect(data).toEqual(arrayExp, 'ARRAYS'));
      todoService.showList(1, 1);
    });
    it('Show Active list', () => {
      const arrayExp: Todo[] = todoService.todoArray.filter(item => item.status === false).slice(0, 5);
      todoService.todoList.subscribe(data => expect(data).toEqual(arrayExp, 'ARRAYS'));
      todoService.showList(2, 1);
    });
    it('Show Completed list', () => {
      const arrayExp: Todo[] = todoService.todoArray.filter(item => item.status === true).slice(0, 5);
      todoService.todoList.subscribe(data => expect(data).toEqual(arrayExp, 'ARRAYS'));
      todoService.showList(3, 1);
    });
  });
});


