import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, throwError } from 'rxjs';
// import { ClipRecord } from 'src/generated/graphql';
import { catchError, map, } from 'rxjs/operators';


  @Injectable({
    providedIn: 'root'
  })
  export class ClipsService {
    public clipListBehaviorSubject: BehaviorSubject<any[]> = new BehaviorSubject<any>({});
    config: any;
    clipQuery = `{
      allClips {
        youtubeurl
        name
        featuredComic {
          id
          lastName
          firstName
          role
        }
        description
      }
    }`;
  
    private readonly API_ENDPOINT = 'https://us-central1-adamsbombcomedy.cloudfunctions.net/proxyRequestToExternalAPI';
  
    constructor(private http: HttpClient) {
      this.clipsList()
    }
  
    
    clipsList(): void {

        const body = {
         query: this.clipQuery,
       };
  
        const url = `${this.API_ENDPOINT}`
        this.http.post(url, body).pipe(
          catchError(this.handleError)
        ).subscribe((data: any) => {
          console.log(data, 'data')
          this.clipListBehaviorSubject.next(data.data.allClips)
        })
    }
  
    private handleError(error: HttpErrorResponse) {
      if (error.error instanceof ErrorEvent) {
        console.error('An error occurred:', error.error.message);
      } else {
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${error.error}`);
      }
      return throwError(
        'Something bad happened; please try again later.');
    }
  
  }