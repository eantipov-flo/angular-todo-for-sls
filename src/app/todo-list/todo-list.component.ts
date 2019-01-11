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


  todoList$: Observable<Todo[]>;
  pagination$: Observable<number[]>;

  private message: string;

  constructor(private dataService: TodoDataService) {
    this.todoList$ = this.dataService.subjectArr$;
    this.pagination$ = this.dataService.subjectPagination$;

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
    this.dataService.createTodo(this.addForm.value.task).subscribe(
      data => {
        this.message = data['message'];
        this.dataService.todoArr.push(data['todo']);
        this.dataService.subjectArr.next(this.dataService.todoArr);
      },
      error => this.message = error,
    );
    this.addForm.patchValue({ task: '' });
  }


  public editTodo(todo: Todo): void {
    this.dataService.editTodo(todo).subscribe(data => {
      this.message = data['message'];
      const indexTodo = this.dataService.todoArr.findIndex(item => item.id === todo.id);
      this.dataService.todoArr[indexTodo] = todo;
    });
  }

  public deleteTodo(id: number): void {
    this.dataService.deleteSingle(id).subscribe(
      data => {
        this.message = data['message'];
        const indexTodo = this.dataService.todoArr.findIndex(item => item.id === id);
        this.dataService.todoArr.splice(indexTodo, 1);
        this.dataService.subjectArr.next(this.dataService.todoArr);
      },
      error => this.message = error,
    );
  }

  public deleteAll(): void {
    this.dataService.deleteAll().subscribe(
      data => {
        this.message = data['message'];
        this.dataService.todoArr = [];
        this.dataService.subjectArr.next(this.dataService.todoArr);
      },
      error => this.message = error,
    );
  }

  public changeStatus(): void {
    this.dataService.changeStatus().subscribe(
      data => {
        this.message = data['message'];
        this.dataService.todoArr = data['data'];
        this.dataService.subjectArr.next(this.dataService.todoArr);
      },
      error => this.message = error,
    );
  }

  public deleteCompleted(): void {
    this.dataService.deleteCompleted().subscribe(
      data => {
        this.message = data['message'];
        this.dataService.todoArr = this.dataService.todoArr.filter(item => item.status === false);
        this.dataService.subjectArr.next(this.dataService.todoArr);
      },
      error => this.message = error,
    );
  }

  public showList(currentList: number = this.currentList, currentPage: number = this.currentPage) {
    this.currentList = currentList;
    this.currentPage = currentPage;
  }
}
