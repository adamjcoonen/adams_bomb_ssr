import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
// import { ShowRecord } from 'src/generated/graphql';

@Injectable({
  providedIn: 'root'
})
export class ShowsService {
  public showListBehaviorSubject: BehaviorSubject<any[]> = new BehaviorSubject<any>({});
  config: any;
  showQuery = `{
    allShows {
      showDate
      showName
      ticketLink {
        links
        value
      }
      updatedAt
      id
      showFlier {
        alt
        url
        smartTags
        tags
      }
      showDescription {
        value
        links
      }
      showLocation {
        latitude
        longitude
      }
      venueName
      venueAddress
    }
  }
  `;

  private readonly API_ENDPOINT = '/api/datocms/';

  constructor(private http: HttpClient) {
    // this.showsList()
  }

  
  showsList(): void {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
      })
      const body = {
       query: this.showQuery,
     };

      const url = `${this.API_ENDPOINT}`
      this.http.post(url, body, { headers }).pipe(
        // tap((response: any) => {console.log(response, 'response')}),
        catchError(this.handleError)
      ).subscribe((data: any) => {
        // console.log(data, 'shows data in the service')
        this.showListBehaviorSubject.next(data.data.allShows.sort((a: any, b: any) => {
          const dateA = new Date(a.showDate);
          const dateB = new Date(b.showDate);
          return dateA.getTime() - dateB.getTime();
        }));
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
