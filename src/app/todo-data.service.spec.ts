import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Todo } from './todo';

import { TodoDataService } from './todo-data.service';
import { defer } from 'rxjs';

function asyncData<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

function asyncError<T>(errorObject: any) {
  return defer(() => Promise.reject(errorObject));
}

fdescribe('TodoDataService', () => {
  let httpClientSpy: { get: jasmine.Spy };
  // let httpTestingController: HttpTestingController;
  let todoService: TodoDataService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TodoDataService],
    });
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    todoService = new TodoDataService(<any> httpClientSpy);
  });
  it('Test Http GET request', () => {
    const expectedTodoList: Todo[] = [
      {
        id: 1,
        task: 'Something for todo #1',
        status: false,
        createdAt: new Date().getTime().toString(),
      },
      {
        id: 2,
        task: 'Something for todo#2',
        status: false,
        createdAt: new Date().getTime().toString(),
      },
      {
        id: 3,
        task: 'Something for todo #3',
        status: true,
        createdAt: new Date().getTime().toString(),
      },
    ];

    httpClientSpy.get.and.returnValue(asyncData(expectedTodoList));

    todoService.getTodo().subscribe(
      data => expect(data).toEqual(expectedTodoList, 'expected todo'),
      fail
    );
    expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
  });

  it('should return an error when the server returns a 404', () => {
    const errorResponse = new HttpErrorResponse({
      error: 'test 404 error',
      status: 404, statusText: 'Not Found'
    });

    httpClientSpy.get.and.returnValue(asyncError(errorResponse));
    todoService.getTodo().subscribe(
      todo => fail('expected an error, not heroes'),
      error  => expect(error.status).toEqual(404)
    );
  });
});
