import { Todo } from '../todo';
import { defer, Observable, Subject, of } from 'rxjs';

export class MockTodoDataService {

  public todoArray: Todo[] = [
    {
      id: '1',
      task: 'Something for todo #1',
      status: false,
      createdAt: new Date().getTime().toString(),
    },
    {
      id: '2',
      task: 'Something for todo#2',
      status: false,
      createdAt: new Date().getTime().toString(),
    },
    {
      id: '3',
      task: 'Something for todo #3',
      status: true,
      createdAt: new Date().getTime().toString(),
    },
  ];
  public todoList = new Subject<Todo[]>();
  public pagination = new Subject<number[]>();

  public currentList = 1;
  public currentPage = 1;
  // private todosOnPage = 6;

  public message = 'Success execution method:';

  constructor() {
  }

  public getTodo(): Observable<any> {
    this.showList();
    return of({ message: `${this.message} getTodo()` });
  }

  public createTodo(task: string): Observable<any> {
    const newTodo: Todo = {
      id: '4',
      task: task,
      status: false,
      createdAt: new Date().getTime().toString(),
    };
    this.todoArray.push(newTodo);
    this.showList();
    return of({message: `${this.message} createTodo()`});
  }

  public editTodo(todo: Todo): Observable<any> {
    const indexTodo = this.todoArray.findIndex(item => item.id === todo.id);
    this.todoArray[indexTodo] = todo;
    this.showList();
    return of({ message: `${this.message} editTodo()` });
  }

  public changeStatus(): Observable<any> {
    const arrFilter = this.todoArray.filter(item => item.status === true);
    if (arrFilter.length === this.todoArray.length) {
      this.todoArray.forEach(item => item.status = false);
    } else {
      this.todoArray.forEach(item => item.status = true);
    }
    this.showList();
    return of({ message: `${this.message} changeStatus()` });
  }

  public deleteSingle(id: string): Observable<any> {
    const indexTodo = this.todoArray.findIndex(item => item.id === id);
    this.todoArray.splice(indexTodo, 1);
    this.showList();
    return of({ message: `${this.message} deleteSingle()`});
  }

  public deleteCompleted(): Observable<any> {
    this.todoArray = this.todoArray.filter(item => item.status === false);
    this.showList();
    return of({ message: `${this.message} deleteCompleted()`});
  }

  public deleteAll(): Observable<any> {
    this.todoArray = [];
    this.showList();
    return of({ message: `${this.message} deleteAll()`});
  }

  public showList(currentList: number = this.currentList, currentPage: number = this.currentPage): void {
    this.currentList = currentList;
    this.currentPage = currentPage;
    this.pagination.next(new Array(4));
    this.todoList.next(this.todoArray);
  }
}

