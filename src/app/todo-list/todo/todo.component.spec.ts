import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Todo } from '../../todo';
import { TodoComponent } from './todo.component';

describe('TodoComponent', () => {
  let todoComponent: TodoComponent;
  let fixture: ComponentFixture<TodoComponent>;
  let expectedTodo: Todo;
  let todoDe: DebugElement;
  let todoEl: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TodoComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoComponent);
    todoComponent = fixture.componentInstance;
    expectedTodo = {
      id: '1',
      task: 'Something for todo',
      status: false,
      createdAt: new Date().getTime().toString(),
    };
    todoDe = fixture.debugElement;
    todoEl = todoDe.nativeElement;
    todoComponent.todo = expectedTodo;
    fixture.detectChanges();
  });
  describe('Create TodoComponent with @Input data', () => {
    it('Component should be created', () => {
      expect(todoComponent).toBeTruthy();
    });
    it('Checkbox should be false', () => {
      const checkboxDe: HTMLInputElement = todoDe.query(By.css('input[type=checkbox]')).nativeElement;
      expect(checkboxDe.checked).toBe(expectedTodo.status, 'Checkbox must be unchecked');
    });
    it('Task should be "Something for todo"', () => {
      const taskDe: HTMLElement = todoDe.query(By.css('label')).nativeElement;
      expect(taskDe.textContent).toBe(expectedTodo.task, 'Task compare');
    });
  });
  describe('Test TodoComponent class', () => {
    it('Change todo status', () => {
      todoComponent.editTodo.subscribe(todo => expect(todo.status).toBe(expectedTodo.status, 'Emit edit todo with status TRUE'));
      todoComponent.changeStatusTodo();
      todoComponent.editTodo.subscribe(todo => expect(todo.status).toBe(expectedTodo.status, 'Emit edit todo with status FALSE'));
      todoComponent.changeStatusTodo();
    });
    it('Delete todo by id', () => {
      todoComponent.deleteTodo.subscribe(id => expect(id).toBe(expectedTodo.id, 'Todo ID'));
      todoComponent.delTodo(expectedTodo.id);
    });
    it('Edit Todo Task', () => {
      todoComponent.editTodo.subscribe(todo => expect(todo.task).toBe(expectedTodo.task, 'Tasks compare'));
      todoComponent.editTaskTodo(true, 'Some new task');
    });
    it('Edit Todo task with empty string', () => {
      todoComponent.editTodo.subscribe(todo => expect(todo.task).toBe(expectedTodo.task, 'Tasks compare with epmty string'));
      todoComponent.editTaskTodo(true, '');
    });
  });
  describe('Test edit todo input', () => {
    let editTodo: HTMLInputElement;
    beforeEach(() => {
      todoComponent.showEdit();
      fixture.detectChanges();
      editTodo = todoEl.querySelector('.edit-todo');
    });
    it('Show edit input', () => {
      expect(editTodo).toBeTruthy('Show edit input');
    });
    it('Hide edit input', () => {
      todoComponent.editTaskTodo(true, '');
      fixture.detectChanges();
      const labelTodo: HTMLElement = todoEl.querySelector('label');
      expect(labelTodo).toBeTruthy('Show task label');
    });
  });
});
