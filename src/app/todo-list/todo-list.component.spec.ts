import { DebugElement } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatButtonToggleModule } from '@angular/material';
import { By } from '@angular/platform-browser';
import { of, throwError, Observable } from 'rxjs';
import { Todo } from '../todo';

import { TodoDataService } from '../todo-data.service';
import { TodoListComponent } from './todo-list.component';
import { TodoComponent } from './todo/todo.component';
import { MockTodoDataService } from './mock-todo-data-service';


describe('TodoListComponent', () => {
  let listComponent: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  let todoService: TodoDataService;
  let listDe: DebugElement;
  let listEl: HTMLElement;
  const testMessage = 'Success execution method:';
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TodoListComponent,
        TodoComponent,
      ],
      imports: [
        MatButtonModule,
        MatButtonToggleModule,
        ReactiveFormsModule],
      providers: [
        TodoListComponent,
        { provide: TodoDataService, useClass: MockTodoDataService },
      ],
    })
      .compileComponents();
    todoService = TestBed.get(TodoDataService);
    listComponent = TestBed.get(TodoListComponent);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoListComponent);
    listComponent = fixture.componentInstance;
    listDe = fixture.debugElement;
    listEl = listDe.nativeElement;
    fixture.detectChanges();
  });

  describe('Created, fill list todos, show message about successful get request', () => {
    beforeEach(() => {
      listComponent.getTodo();
      fixture.detectChanges();
    });
    it('Created component', () => {
      expect(listComponent).toBeTruthy();
    });
    it('Fill list todos', () => {
      expect(listEl.querySelectorAll('app-todo').length).toBe(3, 'QuerySelector');
    });
    it('Request report message', () => {
      expect(listEl.querySelector('.message-async').textContent).toBe(`${testMessage} getTodo()`, 'Message for getTodo');
    });
    it('Create pagination', () => {
      expect(listEl.querySelectorAll('.show-page').length).toBe(4, 'Pagination');
    });
  });
  describe('Test add new todo', () => {
    it('#createTodo method', () => {
      listComponent.addForm.value.task = 'New Task';
      listComponent.createTodo();
      fixture.detectChanges();
      expect(listEl.querySelectorAll('app-todo').length).toBe(4, 'QuerySelector');
      expect(listEl.querySelector('.message-async').textContent).toBe(`${testMessage} createTodo()`, 'Message for getTodo');
    });
    it('Test try with empty task', () => {
      listComponent.addForm.value.task = '';
      listComponent.getTodo();
      listComponent.createTodo();
      fixture.detectChanges();
      expect(listEl.querySelectorAll('app-todo').length).toBe(3, 'QuerySelector');
      expect(listEl.querySelector('.message-async').textContent).toBe('Please write your task', 'Message for getTodo');
    });
  });

  describe('Edit todo', () => {
    it('Test update checkbox', () => {
      const updatedTodo = {
        id: '1',
        task: 'Something for todo #1',
        status: true,
        createdAt: new Date().getTime().toString(),
      };
      listComponent.editTodo(updatedTodo);
      fixture.detectChanges();
      const todoDe: DebugElement[] = listDe.queryAll(By.css('app-todo'));
      const checkboxDe: HTMLInputElement = todoDe[0].query(By.css('input[type=checkbox]')).nativeElement;
      expect(checkboxDe.checked).toBe(updatedTodo.status, 'Checkbox must be checked');
      expect(listEl.querySelector('.message-async').textContent).toBe(`${testMessage} editTodo()`);
    });
    it('Test update task', () => {
      const updatedTodo = {
        id: '3',
        task: 'New task',
        status: true,
        createdAt: new Date().getTime().toString(),
      };
      listComponent.editTodo(updatedTodo);
      fixture.detectChanges();
      const todoDe: DebugElement[] = listDe.queryAll(By.css('app-todo'));
      const taskEl: HTMLElement = todoDe[2].query(By.css('label')).nativeElement;
      expect(taskEl.textContent).toBe(updatedTodo.task, 'Checkbox must be checked');
      expect(listEl.querySelector('.message-async').textContent).toBe(`${testMessage} editTodo()`);
    });
  });
  describe('Change status', () => {
    it('On true', () => {
      listComponent.changeStatus();
      fixture.detectChanges();
      const todoDe: DebugElement[] = listDe.queryAll(By.css('app-todo input[type=checkbox]'));
      expect(todoDe[0].nativeElement.checked).toBeTruthy('First');
      expect(todoDe[1].nativeElement.checked).toBeTruthy('Second');
      expect(todoDe[2].nativeElement.checked).toBeTruthy('Third');
      expect(listEl.querySelector('.message-async').textContent).toBe(`${testMessage} changeStatus()`);
    });
    it('On false', () => {
      todoService.todoArray.forEach(item => item.status = true);
      listComponent.changeStatus();
      fixture.detectChanges();
      const todoDe: DebugElement[] = listDe.queryAll(By.css('app-todo input[type=checkbox]'));
      expect(todoDe[0].nativeElement.checked).toBeFalsy('First');
      expect(todoDe[1].nativeElement.checked).toBeFalsy('Second');
      expect(todoDe[2].nativeElement.checked).toBeFalsy('Third');
      expect(listEl.querySelector('.message-async').textContent).toBe(`${testMessage} changeStatus()`);
    });
  });

  describe('Test delete methods', () => {
    it('#deleteSingle: Delete todo by id', () => {
      listComponent.deleteTodo('1');
      fixture.detectChanges();
      expect(listEl.querySelectorAll('app-todo').length).toBe(2, 'QuerySelector');
      expect(listEl.querySelector('.message-async').textContent).toBe(`${testMessage} deleteSingle()`);
    });
    it('#deleteCompleted: Delete todos this status:true', () => {
      listComponent.deleteCompleted();
      fixture.detectChanges();
      expect(listEl.querySelectorAll('app-todo').length).toBe(2, 'QuerySelector');
      expect(listEl.querySelector('.message-async').textContent).toBe(`${testMessage} deleteCompleted()`);
    });
    it('#deleteAll: Delete all todos', () => {
      listComponent.deleteAll();
      fixture.detectChanges();
      expect(listEl.querySelectorAll('app-todo').length).toBe(0, 'QuerySelector');
      expect(listEl.querySelector('.message-async').textContent).toBe(`${testMessage} deleteAll()`);
    });
  });
  describe('#ChangeList Buttons group', () => {
    it('#ShowList test', () => {
      todoService.todoList.subscribe(data => expect(data).toEqual(todoService.todoArray));
      todoService.pagination.subscribe(data => expect(data.length).toBe(4));
      listComponent.showList(3);
    });
    it('#ShowPage test', () => {
      todoService.todoList.subscribe(data => expect(data).toEqual(todoService.todoArray));
      todoService.pagination.subscribe(data => expect(data.length).toBe(4));
      listComponent.showList(undefined, 2);
    });
  });

  describe('Error test', () => {
    let errorMessage: string;
    it('Error handler getTodo method', () => {
      errorMessage = 'Error on getTodo';
      spyOn(todoService, 'getTodo').and.returnValue(errorThrower(errorMessage));
      listComponent.getTodo();
      fixture.detectChanges();
      expect(listEl.querySelector('.message-async').textContent).toBe(errorMessage);
    });
    it('Error handler createTodo method', () => {
      errorMessage = 'Error on createTodo';
      spyOn(todoService, 'createTodo').and.returnValue(errorThrower(errorMessage));
      listComponent.addForm.value.task = 'Eqs';
      listComponent.createTodo();
      fixture.detectChanges();
      expect(listEl.querySelector('.message-async').textContent).toBe(errorMessage);
    });
    it('Error handler editTodo method', () => {
      errorMessage = 'Error on editTodo';
      spyOn(todoService, 'editTodo').and.returnValue(errorThrower(errorMessage));
      listComponent.editTodo(todoService.todoArray[0]);
      fixture.detectChanges();
      expect(listEl.querySelector('.message-async').textContent).toBe(errorMessage);
    });
    it('Error handler changeStatus method', () => {
      errorMessage = 'Error on changeStatus';
      spyOn(todoService, 'changeStatus').and.returnValue(errorThrower(errorMessage));
      listComponent.changeStatus();
      fixture.detectChanges();
      expect(listEl.querySelector('.message-async').textContent).toBe(errorMessage);
    });
    it('Error handler deleteSingle method', () => {
      errorMessage = 'Error on deleteSingle';
      spyOn(todoService, 'deleteSingle').and.returnValue(errorThrower(errorMessage));
      listComponent.deleteTodo('1');
      fixture.detectChanges();
      expect(listEl.querySelector('.message-async').textContent).toBe(errorMessage);
    });
    it('Error handler deleteCompleted method', () => {
      errorMessage = 'Error on deleteCompleted';
      spyOn(todoService, 'deleteCompleted').and.returnValue(errorThrower(errorMessage));
      listComponent.deleteCompleted();
      fixture.detectChanges();
      expect(listEl.querySelector('.message-async').textContent).toBe(errorMessage);
    });
    it('Error handler deleteAll method', () => {
      errorMessage = 'Error on deleteAll';
      spyOn(todoService, 'deleteAll').and.returnValue(errorThrower(errorMessage));
      listComponent.deleteAll();
      fixture.detectChanges();
      expect(listEl.querySelector('.message-async').textContent).toBe(errorMessage);
    });
  });
});

function errorThrower(message: string): Observable<any> {
  return throwError({ error: { errorMessage: message } });
}
