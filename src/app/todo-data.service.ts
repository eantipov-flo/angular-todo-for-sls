import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Todo } from './todo';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TodoDataService {

  public todoArr: Todo[];

  public subjectArr = new Subject<Todo[]>();
  public subjectArr$ = new Observable<Todo[]>();

  public subjectPagination = new Subject<number[]>();
  public subjectPagination$ = new Observable<number[]>();
  private todosOnPage = 10;
  private urlHost = 'http://localhost:3000';

  constructor(private http: HttpClient) {


    this.subjectArr$ = this.subjectArr.asObservable();
    this.subjectPagination$ = this.subjectPagination.asObservable();
  }

  public createTodo(task: string): Observable<string> {
    return this.http.post<string>(`${this.urlHost}/todos/create`, { task: task });
  }

  public getTodo(): void {
    this.http.get<Todo[]>(`${this.urlHost}/todos/get`)
      .subscribe(data => {
        this.todoArr = data;
        this.subjectArr.next(this.todoArr);
      });
  }

  public editTodo(todoEmit: Todo): Observable<string> {
    return this.http.put<string>(`${this.urlHost}/todos/update`, todoEmit);
  }

  public changeStatus(): Observable<string> {
    const arrFilter = this.todoArr.filter(item => item.status === true);
    const requestArray = this.todoArr;
    if (arrFilter.length === this.todoArr.length) {
      requestArray.forEach(item => item.status = false);
      console.log(requestArray);
      return this.http.put<any>(`${this.urlHost}/todos/updateStatus`, requestArray);
    } else {
      requestArray.forEach(item => item.status = true);
      console.log(requestArray);
      return this.http.put<any>(`${this.urlHost}/todos/updateStatus`, requestArray);
    }
  }

  public deleteSingle(idTodo: number): Observable<string> {
    return this.http.delete<string>(`${this.urlHost}/todos/delete/${idTodo}`);
  }

  public deleteAll(): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }), body: this.todoArr,
    };
    return this.http.delete<string>(`${this.urlHost}/todos/delete/all`, httpOptions);
  }

  public deleteCompleted(): Observable<string> {
    const requestArray = this.todoArr.filter(item => item.status === true);
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }), body: requestArray,
    };
    return this.http.delete<string>(`${this.urlHost}/todos/delete/completed`, httpOptions);
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

}

