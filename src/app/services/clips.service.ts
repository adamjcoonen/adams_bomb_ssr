import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
// import { ClipRecord } from 'src/generated/graphql';
import { catchError, map, } from 'rxjs/operators';


  @Injectable({
    providedIn: 'root'
  })
  export class ClipsService {
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
  
    private readonly API_ENDPOINT = 'api/datocms/'
  
    constructor(private http: HttpClient) {
      this.config = 'featuredComicList'
    }
  
    
    clipsList(): Observable<any[]> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
      })
      const body = {
        query: this.clipQuery
      }
      return this.http.post<any>(this.API_ENDPOINT, body, { headers }).pipe(
        map((response: any) => {
          return response.data.allClips;
        }),
        catchError(this.handleError)
      ) as any;
    }
    
    handleError(error: HttpErrorResponse) {
      console.error('An error occurred:', error.message);
      return throwError(() => new Error('Error on http call to datoCMS.'));
    }
  }