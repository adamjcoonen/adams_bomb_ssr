import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
// import { ShowRecord } from 'src/generated/graphql';

@Injectable({
  providedIn: 'root'
})
export class OpenMicsService {
  public openMicListBehaviorSubject: BehaviorSubject<any[]> = new BehaviorSubject<any>({});
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
    // this.showsList()
  }

  
  openMicList(): void {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
      })
      const body = {
       query: this.openMicQuery,
     };

      const url = `${this.API_ENDPOINT}`
      this.http.post(url, body, { headers }).pipe(
        tap((response: any) => {console.log(response, 'response')}),
        catchError(this.handleError)
      ).subscribe((data: any) => {
        console.log(data.data, 'openMic data in the service')
        this.openMicListBehaviorSubject.next(data.data.allOpenmics);
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
