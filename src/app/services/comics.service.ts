import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';
import { CommonModule } from '@angular/common';
import { response } from 'express';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})


export class ComicsService {
  // public comicListBehaviorSubject: BehaviorSubject<[]> = new BehaviorSubject<any>([]);
  config: any;

  private readonly API_ENDPOINT = '/api/datocms'
  public comicQuery = `{
    allFeaturedComicLists {
      id
      firstName
      headshot {
        id
        url
      }
      lastName
      position
      role
      bio
      tictoclink {
        value
      }
      socialMediaLinks {
        value
      }
      instalink {
        value
      }
      clips {
        youtubeurl
        name
      }
      credits {
        value
      }
    }
  }
`;
  
  constructor( private http: HttpClient) { 
    this.comicsList()
    this.config = 'featuredComicList'
  };
  
  
  comicsList(): Observable<any> {
     const headers = new HttpHeaders({
       'Content-Type': 'application/json',
     })
     const body = {
      query: this.comicQuery,
    };

    const url = `${this.API_ENDPOINT}`
    return this.http.post(url, body, { headers }).pipe(
      tap((response: any) => {
        console.log('response', response)
        // this.comicListBehaviorSubject.next(response.data[this.config])
      }),
    )
   }
}
