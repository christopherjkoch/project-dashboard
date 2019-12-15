import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { IProject } from './project';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projectUrl = 'api/projects/projects.json';
  private projects;

  constructor(private http: HttpClient) { }

  getProjects(): Observable<IProject[]> {
    if (this.projects) {
      return of(this.projects);
    } else {
      return this.http.get<IProject[]>(this.projectUrl)
        .pipe(
          tap(data => {
            this.projects = data;
          }),
          catchError(this.handleError)
        );
    }
  }

  updateProjects(projects: IProject[]): Observable<IProject[]> {
    this.projects = projects;
    return of(this.projects);
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }

}
