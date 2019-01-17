import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Todo } from './todo';
import { TodoDataService } from './todo-data.service';

describe('TodoDataService', () => {

  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let todoService: TodoDataService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TodoDataService],
    });
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    todoService = TestBed.get(TodoDataService);
    todoService.todoArr = [
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
    ] as Todo[];
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('#GetTodo test GET request', () => {

    it('Get todos list', () => {

      const expectedTodoList = todoService.todoArr;

      todoService.getTodo().subscribe(
        data => {
          expect(data['data']).toEqual(expectedTodoList, 'expected response data to equal testing array todo');
          expect(data['message']).toEqual('Success get todo list', 'Response status message');
        },
        fail,
      );

      const req = httpTestingController.expectOne(`${todoService.urlHost}/todos/get`);
      expect(req.request.method).toEqual('GET', 'Request method');
      req.flush({ message: 'Success get todo list', data: expectedTodoList });
      expect(todoService.todoArr).toEqual(expectedTodoList, 'Compare arrays');
    });

    it('Test with empty todo array', () => {

      todoService.getTodo().subscribe(
        data => expect(data['data'].length).toEqual(0, 'Empty todo list length to equal 0'),
        fail,
      );
      const req = httpTestingController.expectOne(`${todoService.urlHost}/todos/get`);
      req.flush({ data: [] });
    });

    it('Test error response', () => {
      const messageError = 'Dont found something';
      todoService.getTodo().subscribe(
        () => fail('excepted to error response'),
        (error: HttpErrorResponse) => {
          expect(error.error.status).toEqual(404, 'status');
          expect(error.error.message).toEqual(messageError, 'Message');
        },
      );

      const req = httpTestingController.expectOne(`${todoService.urlHost}/todos/get`);

      req.flush({ status: 404, statusText: 'Not Found', message: messageError });
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

      const expectedArrLength = todoService.todoArr.length + 1;

      todoService.createTodo(newTodo.task).subscribe(
        data => {
          expect(data['todo']).toEqual(newTodo, 'Response todo equal new todo');
        },
        fail,
      );

      const req = httpTestingController.expectOne(`${todoService.urlHost}/todos/create`);
      expect(req.request.method).toEqual('POST');
      req.flush({ todo: newTodo });
      expect(todoService.todoArr.length).toEqual(expectedArrLength, 'To equal length arr');
      expect(todoService.todoArr[expectedArrLength - 1]).toEqual(newTodo, 'Compare todos');
    });
  });

  describe('#editTodo PUT request', () => {

    it('Edit todo request', () => {

      const updatedTodo: Todo = {
        id: '1',
        task: 'Updated Task',
        status: true,
        createdAt: new Date().getTime().toString(),
      };

      const responseMessage = 'Success update';

      todoService.editTodo(updatedTodo).subscribe(
        data => expect(data['message']).toEqual(responseMessage),
        fail,
      );
      const req = httpTestingController.expectOne(`${todoService.urlHost}/todos/update`);
      expect(req.request.method).toEqual('PUT');
      req.flush({ message: responseMessage });

      expect(todoService.todoArr[0]).toEqual(updatedTodo, 'Equal update todo in array');
    });
  });

  describe('#changeStatus PUT request on TRUE', () => {
    it('Change status all todos test on true', () => {
      const expectedList = JSON.parse(JSON.stringify(todoService.todoArr));
      const responseMessage = 'Success update status todos';
      expectedList.map(item => item.status = true);
      todoService.changeStatus().subscribe(
        data => {
          expect(data['message']).toEqual(responseMessage);
          expect(data['data']).toEqual(expectedList);
        },
        fail,
      );
      const reqTrue = httpTestingController.expectOne(`${todoService.urlHost}/todos/updateStatus`);
      expect(reqTrue.request.method).toEqual('PUT');
      reqTrue.flush({ message: responseMessage, data: expectedList });
      expect(todoService.todoArr).toEqual(expectedList, 'Change status todos on true');
    });
  });

  describe('#changeStatus PUT request on False', () => {
    it('Change status all todos test on false', () => {
      const expectedList = JSON.parse(JSON.stringify(todoService.todoArr));
      const responseMessage = 'Success update status todos';
      expectedList.map(item => item.status = false);
      todoService.changeStatus().subscribe(
        data => {
          expect(data['message']).toEqual(responseMessage);
          expect(data['data']).toEqual(expectedList);
        },
        fail,
      );
      const reqFalse = httpTestingController.expectOne(`${todoService.urlHost}/todos/updateStatus`);
      expect(reqFalse.request.method).toEqual('PUT');
      reqFalse.flush({ message: responseMessage, data: expectedList });
      expect(todoService.todoArr).toEqual(expectedList, 'Change status todos on false');
    });
  });

  describe('#DeleteSingle Todo', () => {
    it('Request for delete todo by ID', () => {
      const responseMessage = 'Success delete todo';
      const expectedArrLength = todoService.todoArr.length - 1;
      todoService.deleteSingle('1').subscribe(
        data => expect(data.message).toEqual(responseMessage),
        fail,
      );
      const reqFalse = httpTestingController.expectOne(`${todoService.urlHost}/todos/delete/1`);
      expect(reqFalse.request.method).toEqual('DELETE');
      reqFalse.flush({ message: responseMessage });
      expect(todoService.todoArr.length).toEqual(expectedArrLength, 'Compare arr length');
    });
  });

  describe('#DeleteCompleted', () => {
    it('Request delete completed todo', () => {
      todoService.todoArr.push(
        {
          id: '4',
          task: 'Something for todo #1',
          status: true,
          createdAt: new Date().getTime().toString(),
        },
        {
          id: '5',
          task: 'Something for todo#2',
          status: true,
          createdAt: new Date().getTime().toString(),
        },
        {
          id: '6',
          task: 'Something for todo #3',
          status: true,
          createdAt: new Date().getTime().toString(),
        },
      );
      const responseMessage = 'Success delete completed todos';
      expect(todoService.todoArr.length).toEqual(6, 'Length todo array');
      todoService.deleteCompleted().subscribe(
        data => expect(data.message).toEqual(responseMessage),
        fail,
      );
      const reqFalse = httpTestingController.expectOne(`${todoService.urlHost}/todos/delete/completed`);
      expect(reqFalse.request.method).toEqual('DELETE');
      reqFalse.flush({ message: responseMessage });
      expect(todoService.todoArr.length).toEqual(3, 'Compare arr length');
    });
  });

  describe('#DeleteAll', () => {
    it('Request delete completed todo', () => {
      const responseMessage = 'Success delete all todos';
      todoService.deleteAll().subscribe(
        data => expect(data.message).toEqual(responseMessage),
        fail,
      );
      const reqFalse = httpTestingController.expectOne(`${todoService.urlHost}/todos/delete/all`);
      expect(reqFalse.request.method).toEqual('DELETE');
      reqFalse.flush({ message: responseMessage });
      expect(todoService.todoArr.length).toEqual(0, 'Compare arr length');
    });
  });
});
