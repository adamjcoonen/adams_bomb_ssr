import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OpenMicsService {
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
