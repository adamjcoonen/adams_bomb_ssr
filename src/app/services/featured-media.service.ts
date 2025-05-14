import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FeaturedMediaService {
  // public featuredMediaBehaviorSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  config: any;
  isServer: boolean;

  private readonly API_ENDPOINT = '/api/datocms/'
  query = `query MyQuery {
    allCarousels {
      id
      featuredContentBlock {
        mediaLink {
          ... on ClipRecord {
            id
            name
            youtubeurl
          }
          ... on FeaturedComicListRecord {
            id
            headshot {
              url
              title
            }
            bio
            firstName
            lastName
            role
            socialMediaLinks {
              links
            }
            tictoclink {
              links
            }
            facebooklink {
              links
            }
          }
          ... on ShowRecord {
            id
            showFlier {
              url
              title
            }
            showName
            showDate
            showDescription {
              value
              links
            }
            ticketLink {
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
          ... on ShowPhotoRecord {
            id
            photo {
              url
            }
            title
          }
        }
      }
    }
  }`
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
    ) {
    this.isServer = isPlatformServer(this.platformId);
      if(this.isServer) {
        this.featuredMedia();
      }
  }

  featuredMedia(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    const body = {
     query: this.query,
   };

   const url = `${this.API_ENDPOINT}`
   return this.http.post(url, body, { headers }).pipe(
     tap((response: any) => {
       console.log('response', response)
     }),
   )
  }
}

    
