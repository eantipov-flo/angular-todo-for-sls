import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatCheckboxModule, MatButtonModule, MatButtonToggleModule, MatInputModule} from '@angular/material';
import {Routes, RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';

import {AppComponent} from './app.component';
import {TodoListComponent} from './todo-list/todo-list.component';
import {TodoComponent} from './todo-list/todo/todo.component';

const todoRoutes: Routes = [
  {path: 'list', component: TodoListComponent},
  {path: '', redirectTo: 'list', pathMatch: 'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    TodoListComponent,
    TodoComponent
  ],
  imports: [
    RouterModule.forRoot(todoRoutes),
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatButtonToggleModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
