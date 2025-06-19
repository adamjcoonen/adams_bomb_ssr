import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
// import { ShowRecord } from 'src/generated/graphql';

@Injectable({
  providedIn: 'root'
})
export class OpenMicsService {
  // public openMicListBehaviorSubject: BehaviorSubject<any[]> = new BehaviorSubject<any>({});
  config: any;
  openMicQuery = `{
    allOpenmics {
      dayoftheweek
      description
      flier {
        id
        url
        title
      }
      miclocation {
        latitude
        longitude
      }
      time
      signuplink
      title
      venuewebsite
      venueName
      onlinesignup
    }
  }
  `;

  private readonly API_ENDPOINT = '/api/datocms/';

  constructor(private http: HttpClient) {
    // this.openMicList()
  }

  
  openMicList(): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const body = {
      query: this.openMicQuery
    };
    return this.http.post<any>(this.API_ENDPOINT, body, { headers }).pipe(
      map((response: any) => {
        console.log(response, 'response from open mic query');
        return response.data.allOpenmics;
      }),
      catchError(this.handleError)
    ) as any;
  }
  handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.message);
    return throwError(() => new Error('Error on http call to datoCMS.'));
  }
}
