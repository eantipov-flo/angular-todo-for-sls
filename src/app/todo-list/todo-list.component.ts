import { Component, OnInit } from '@angular/core';

import { TodoDataService } from '../todo-data.service';
import { Todo } from '../todo';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';


@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
})
export class TodoListComponent implements OnInit {

  addForm = new FormGroup({
    task: new FormControl(''),
  });

  private resMessage = new Subject<string>();
  private resMessage$: Observable<string>;
  private todoList$: Observable<Todo[]>;
  private pagination$: Observable<number[]>;

  constructor(private dataService: TodoDataService) {
    this.todoList$ = this.dataService.todoList.asObservable();
    this.pagination$ = this.dataService.pagination.asObservable();
    this.resMessage$ = this.resMessage.asObservable();
  }

  ngOnInit() {
    this.getTodo();
  }

  public getTodo(): void {
    this.dataService.getTodo().subscribe(
      data => this.resMessage.next(data['message']),
      error => this.resMessage.next(error.error.errorMessage),
    );
  }

  public createTodo(): void {
    if (!this.addForm.value.task.trim()) {
      this.resMessage.next('Please write your task');
      return;
    }
    this.dataService.createTodo(this.addForm.value.task).subscribe(
      data => this.resMessage.next(data['message']),
      error => this.resMessage.next(error.error.errorMessage),
    );
    this.addForm.patchValue({ task: '' });
  }

  public editTodo(todo: Todo): void {
    this.dataService.editTodo(todo).subscribe(
      data => this.resMessage.next(data['message']),
      error => this.resMessage.next(error.error.errorMessage),
    );
  }

  public changeStatus(): void {
    this.dataService.changeStatus().subscribe(
      data => this.resMessage.next(data['message']),
      error => this.resMessage.next(error.error.errorMessage),
    )
    ;
  }

  public deleteTodo(id: string): void {
    this.dataService.deleteSingle(id).subscribe(
      data => this.resMessage.next(data['message']),
      error => this.resMessage.next(error.error.errorMessage),
    );
  }

  public deleteCompleted(): void {
    this.dataService.deleteCompleted().subscribe(
      data => this.resMessage.next(data['message']),
      error => this.resMessage.next(error.error.errorMessage),
    );
  }

  public deleteAll(): void {
    this.dataService.deleteAll().subscribe(
      data => this.resMessage.next(data['message']),
      error => this.resMessage.next(error.error.errorMessage),
    );
  }

  public showList(currentList?: number, currentPage?: number): void {
    this.dataService.showList(currentList, currentPage);
  }
}
