import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

import { Todo } from './todo';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TodoDataService {

  public todoArray: Todo[];

  public todoList = new Subject<Todo[]>();
  public pagination = new Subject<number[]>();

  private currentList = 1;
  private currentPage = 1;
  public todosOnPage = 5;


  public reqUrl = 'https://cq1jfjwfae.execute-api.us-east-1.amazonaws.com/dev';

  constructor(private http: HttpClient) {
  }

  public getTodo(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.reqUrl}/todos/get`)
      .pipe(
        tap((data) => {
          this.todoArray = data['data'];
          this.sortArrByCreatedAt(this.todoArray);
          this.showList();
        }),
      );
  }

  public createTodo(task: string): Observable<Todo> {
    return this.http.post<Todo>(`${this.reqUrl}/todos/create`, { task: task })
      .pipe(
        tap((data) => {
          this.todoArray.push(data['todo']);
          this.showList();
        }),
      );
  }

  public editTodo(todo: Todo): Observable<any> {
    return this.http.put<any>(`${this.reqUrl}/todos/update`, todo)
      .pipe(
        tap(() => {
          const indexTodo = this.todoArray.findIndex(item => item.id === todo.id);
          this.todoArray[indexTodo] = todo;
          this.showList();
        }),
      );
  }

  public changeStatus(): Observable<any> {
    return this.http.put<any>(`${this.reqUrl}/todos/updateStatus`, this.filterArr())
      .pipe(
        tap((data) => {
          this.todoArray = data['data'];
          this.showList();
        }),
      );
  }

  public deleteSingle(id: string): Observable<any> {
    return this.http.delete<any>(`${this.reqUrl}/todos/delete/${id}`)
      .pipe(
        tap(() => {
          const indexTodo = this.todoArray.findIndex(item => item.id === id);
          this.todoArray.splice(indexTodo, 1);
          this.showList();
        }),
      );
  }

  public deleteCompleted(): Observable<any> {
    const requestArray = this.todoArray.filter(item => item.status === true);
    return this.http.request<any>('delete', `${this.reqUrl}/todos/delete/completed`, { body: requestArray })
      .pipe(
        tap(() => {
          this.todoArray = this.todoArray.filter(item => item.status === false);
          this.showList();
        }),
      );
  }

  public deleteAll(): Observable<any> {
    return this.http.request<any>('delete', `${this.reqUrl}/todos/delete/all`, { body: this.todoArray }).pipe(
      tap(() => {
        this.todoArray = [];
        this.showList();
      }),
    );
  }


  private sortArrByCreatedAt(arr: Todo[]): void {
    arr.sort((a, b) => {
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
  }

  public showList(currentList: number = this.currentList, currentPage: number = this.currentPage): void {
    this.currentList = currentList;
    this.currentPage = currentPage;
    switch (currentList) {

      case 1: {
        this.sendTodosList(this.todoArray, currentPage);
        break;
      }

      case 2: {
        this.sendTodosList(this.todoArray.filter(item => item.status === false), currentPage);
        break;
      }

      case 3: {
        this.sendTodosList(this.todoArray.filter(item => item.status === true), currentPage);
      }
    }
  }

  private sendTodosList(arr: Todo[], currentPage: number): void {
    const pagination: number[] = new Array(Math.ceil(arr.length / this.todosOnPage));
    let subArr: Todo[];
    subArr = arr.slice((currentPage - 1) * this.todosOnPage, (currentPage - 1) * this.todosOnPage + this.todosOnPage);
    if (subArr.length === 0) {
      currentPage = pagination.length;
      subArr = arr.slice((currentPage - 1) * this.todosOnPage, (currentPage - 1) * this.todosOnPage + this.todosOnPage);
    }
    this.pagination.next(pagination);
    this.todoList.next(subArr);
  }

  private filterArr(): Todo[] {
    const arrFilter = this.todoArray.filter(item => item.status === true);
    if (arrFilter.length === this.todoArray.length) {
      this.todoArray.forEach(item => item.status = false);
    } else {
      this.todoArray.forEach(item => item.status = true);
    }
    return this.todoArray;
  }
}

