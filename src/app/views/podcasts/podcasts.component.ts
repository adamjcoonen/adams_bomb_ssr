import { Component } from '@angular/core';
import { PodcastsService, PodcastEpisode } from '../../services/podcast.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-podcasts',
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule
  ],
  templateUrl: './podcasts.component.html',
  styleUrl: './podcasts.component.scss',
  providers: [
    PodcastsService// PodcastsService will be provided in root, no need to add here
  ]
})
export class PodcastsComponent {

  constructor(
    private podcastsService: PodcastsService,
    private sanitizer: DomSanitizer // Inject DomSanitizer
    ) { }

    episodes: PodcastEpisode[] = [];
    loading = true;
    error: string | null = null;
  
    ngOnInit(): void {
      this.podcastsService.getPodcastEpisodes().pipe(
        // Optionally, you can add operators like map, catchError, etc. here
        map(data => data), // Transform the data if needed
        // catchError(err => throwError(() => new Error('Failed to fetch episodes')))
      ).subscribe({
        next: (data) => {
          console.log('Fetched podcast episodes:', data);
          this.episodes = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching podcast episodes:', err);
          this.error = 'Failed to load podcast episodes. Please try again later.';
          this.loading = false;
        }
      });
    }

    getEpisodeImage(episode: PodcastEpisode): string {
      // Assuming the image URL is stored in episode.imageUrl
      return episode.imageUrl || 'assets/default-podcast-image.png'; // Fallback image if none exists
    }

    getEpisodeAudio(episode: PodcastEpisode): SafeResourceUrl {
      // Assuming the audio URL is stored in episode.audioUrl
      console.log('Episode audio URL:', episode.audioUrl);
      const urlParts = episode.link.split('/');
      const audioId = urlParts[urlParts.length - 1];
      const embedUrl = `https://player.rss.com/laughing-historically/${audioId}?theme=color&v=2`;
      
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl)
    }

}
