import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Todo } from './todo';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TodoDataService {

  public todoArr: Todo[] = [];

  public subjectArr = new Subject<Todo[]>();
  public subjectArr$: Observable<Todo[]>;

  public subjectPagination = new Subject<number[]>();
  public subjectPagination$: Observable<number[]>;

  public subjectMessage = new Subject<string>();
  public subjectMessage$: Observable<string>;

  private todosOnPage = 7;
  private urlHost = 'http://localhost:3000';

  constructor(private http: HttpClient) {

    this.subjectArr$ = this.subjectArr.asObservable();
    this.subjectPagination$ = this.subjectPagination.asObservable();
    this.subjectMessage$ = this.subjectMessage.asObservable();
  }

  public createTodo(task: string): void {
    this.http.post<Todo>(`${this.urlHost}/todos/create`, { task: task }).subscribe(
      data => {
        this.subjectMessage.next(data['message']);
        this.todoArr.push(data['todo']);
        this.subjectArr.next(this.todoArr);
      },

      error => this.subjectMessage.next(error.error.errorMessage),
    );
  }

  public getTodo(): void {
    this.http.get<Todo[]>(`${this.urlHost}/todos/get`).subscribe(data => {
      this.subjectMessage.next(data['message']);
      this.todoArr = data['data'];
      console.log(data['data']);
      this.todoArr.sort((a, b) => {
        const millisecondsA = Date.parse(a.createdAt);
        const millisecondsB = Date.parse(b.createdAt);
        if (millisecondsA > millisecondsB) {
          return 1;
        }
        if (millisecondsA < millisecondsB) {
          return -1;
        }
        return 0;
      });
      this.subjectArr.next(this.todoArr);
    },
      error => this.subjectMessage.next(error.error.errorMessage)
    );
  }

  public editTodo(todoEmit: Todo): void {
    this.http.put<any>(`${this.urlHost}/todos/update`, todoEmit).subscribe(
      data => {
        this.subjectMessage.next(data['message']);
        const indexTodo = this.todoArr.findIndex(item => item.id === todoEmit.id);
        this.todoArr[indexTodo] = todoEmit;
        this.subjectArr.next(this.todoArr);
      },
      error => this.subjectMessage.next(error.error.errorMessage),
    );
  }

  public changeStatus(): void {
    this.http.put<any>(`${this.urlHost}/todos/updateStatus`, this.filterArr()).subscribe(
      data => {
        this.subjectMessage.next(data['message']);
        this.todoArr = data['data'];
        this.subjectArr.next(this.todoArr);
      },
      error => this.subjectMessage.next(error.error.errorMessage),
    );
  }

  public deleteSingle(idTodo: number): void {
    this.http.delete<any>(`${this.urlHost}/todos/delete/${idTodo}`).subscribe(
      data => {
        this.subjectMessage.next(data['message']);
        const indexTodo = this.todoArr.findIndex(item => item.id === idTodo);
        this.todoArr.splice(indexTodo, 1);
        this.subjectArr.next(this.todoArr);
      },
      error => this.subjectMessage.next(error.error.errorMessage),
    );;
  }

  public deleteAll(): void {
    this.http.request<any>('delete', `${this.urlHost}/todos/delete/completed`, { body: this.todoArr }).subscribe(
      data => {
        this.subjectMessage.next(data['message']);
        this.todoArr = [];
        this.subjectArr.next(this.todoArr);
      },
      error => this.subjectMessage.next(error.error.errorMessage),
    );
  }

  public deleteCompleted(): void {
    const requestArray = this.todoArr.filter(item => item.status === true);
    this.http.request<any>('delete', `${this.urlHost}/todos/delete/completed`, { body: requestArray }).subscribe(
      data => {
        this.subjectMessage.next(data['message']);
        this.todoArr = this.todoArr.filter(item => item.status === false);
        this.subjectArr.next(this.todoArr);
      },
      error => this.subjectMessage.next(error.error.errorMessage),
    );
  }

  public showList(currentList: number, currentPage: number): void {
    switch (currentList) {

      case 1: {
        this.sendTodosList(this.todoArr, currentPage);
        break;
      }

      case 2: {
        this.sendTodosList(this.todoArr.filter(item => item.status === false), currentPage);
        break;
      }

      case 3: {
        this.sendTodosList(this.todoArr.filter(item => item.status === true), currentPage);
      }
    }
  }

  private sendTodosList(arr: Todo[], currentPage: number): void {
    const pagination: number[] = new Array(Math.ceil(arr.length / this.todosOnPage));
    let subArr: Todo[];
    subArr = this.filterSub(arr, currentPage);
    if (subArr.length === 0) {
      currentPage = pagination.length;
      subArr = this.filterSub(arr, currentPage);
    }
    this.subjectPagination.next(pagination);
    this.subjectArr.next(subArr);
  }

  private filterSub(arr: Todo[], currentPage: number): Todo[] {
    return arr.filter((todo, i) => {
        if (i >= (currentPage - 1) * this.todosOnPage && i <= (currentPage - 1) * this.todosOnPage + this.todosOnPage - 1) {
          return todo;
        }
      },
    );
  }

  private filterArr(): Todo[] {
    const arrFilter = this.todoArr.filter(item => item.status === true);
    const requestArray = this.todoArr;
    if (arrFilter.length === this.todoArr.length) {
      requestArray.forEach(item => item.status = false);
    } else {
      requestArray.forEach(item => item.status = true);
    }
    return requestArray;
  }

}

