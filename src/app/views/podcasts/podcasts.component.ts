import { Component } from '@angular/core';
import { PodcastsService, PodcastEpisode } from '../../services/podcast.service';

@Component({
  selector: 'app-podcasts',
  standalone: true,
  imports: [],
  templateUrl: './podcasts.component.html',
  styleUrl: './podcasts.component.scss',
  providers: [
    PodcastsService// PodcastsService will be provided in root, no need to add here
  ]
})
export class PodcastsComponent {

  constructor(
    private podcastsService: PodcastsService
    ) { }

    episodes: PodcastEpisode[] = [];
    loading = true;
    error: string | null = null;
  
    ngOnInit(): void {
      this.podcastsService.getPodcastEpisodes().subscribe({
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

}
