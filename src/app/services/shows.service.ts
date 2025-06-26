import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class ShowsService {
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
  }

  
  showsList(): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const body = {
      query: this.showQuery
    };
    return this.http.post<any>(this.API_ENDPOINT, body, { headers }).pipe(
      map((response: any) => {
        return response.data.allShows;
      }),
      catchError(this.handleError)
    ) as any;
  }
  handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.message);
    return throwError(() => new Error('Error on http call to datoCMS.'));
  }
}
