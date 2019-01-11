import { Component, EventEmitter, OnInit, Output, Input, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';

import { Todo } from '../../todo';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
})
export class TodoComponent implements OnInit, AfterViewChecked {

  @Input() todo: Todo;
  @Output() editTodo = new EventEmitter<Todo>();
  @Output() deleteTodo = new EventEmitter<number>();
  @ViewChild('editInput') editInput: ElementRef;

  private displayEdit = true;

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewChecked() {
    if (!this.displayEdit) {
      this.editInput.nativeElement.focus();
    }
  }

  public changeStatusTodo(): void {
    this.todo.status = !this.todo.status;
    this.editTodo.emit(this.todo);
  }

  public delTodo(id: number): void {
    this.deleteTodo.emit(id);
  }

  showEdit(): void {
    this.displayEdit = false;
  }

  public editTaskTodo(edit: boolean, newTask?: string): void {
    if (edit && newTask !== '') {
      this.todo.task = newTask;
    }
    this.displayEdit = edit;
    this.editTodo.emit(this.todo);
  }
}
