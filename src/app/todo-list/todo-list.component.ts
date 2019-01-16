import { Component, OnInit, DoCheck } from '@angular/core';

import { TodoDataService } from '../todo-data.service';
import { Todo } from '../todo';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
})
export class TodoListComponent implements OnInit, DoCheck {

  addForm = new FormGroup({
    task: new FormControl(''),
  });

  currentList = 1;
  currentPage = 1;


  private todoList$: Observable<Todo[]>;
  private pagination$: Observable<number[]>;
  private message$: Observable<string>;

  constructor(private dataService: TodoDataService) {
    this.todoList$ = this.dataService.subjectArr$;
    this.pagination$ = this.dataService.subjectPagination$;
    this.message$ = this.dataService.subjectMessage$;

  }

  ngOnInit() {
    this.dataService.getTodo();
    this.dataService.showList(this.currentList, this.currentPage);
  }

  ngDoCheck() {
    this.dataService.showList(this.currentList, this.currentPage);
  }

  public createTodo(): void {
    if (!this.addForm.value.task.trim()) {
      return;
    }
    this.dataService.createTodo(this.addForm.value.task);
    this.addForm.patchValue({ task: '' });
  }


  public editTodo(todo: Todo): void {
    this.dataService.editTodo(todo);
  }

  public deleteTodo(id: number): void {
    this.dataService.deleteSingle(id);
  }

  public deleteAll(): void {
    this.dataService.deleteAll();
  }

  public changeStatus(): void {
    this.dataService.changeStatus();
  }

  public deleteCompleted(): void {
    this.dataService.deleteCompleted();
  }

  public showList(currentList: number = this.currentList, currentPage: number = this.currentPage) {
    this.currentList = currentList;
    this.currentPage = currentPage;
  }
}
