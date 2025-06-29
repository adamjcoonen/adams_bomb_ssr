// src/app/services/podcasts.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PodcastEpisode {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
  audioUrl?: string;
  audioType?: string;
  audioLength?: number;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PodcastsService {
  private http = inject(HttpClient);
  private apiUrl = '/api/podcast-episodes'; // Your new backend endpoint

  getPodcastEpisodes(): Observable<PodcastEpisode[]> {
    return this.http.get<PodcastEpisode[]>(this.apiUrl);
  }
}