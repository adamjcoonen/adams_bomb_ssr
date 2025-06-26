import {
  Component,
  OnInit,
  OnDestroy,
  QueryList,
  ElementRef,
  ViewChildren,
  ChangeDetectorRef,
  AfterViewInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { FeaturedMediaService } from '../../services/featured-media.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { SafePipe } from '../../pipes/safe.pipe'; // Assuming you have a SafePipe for YouTube URLs
import { BehaviorSubject } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

// Declare the global YT object for the YouTube IFrame Player API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

@Component({
  standalone: true,
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  animations: [
    trigger('carouselAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('500ms ease-in-out', style({ opacity: 0 }))
      ]),
    ])
  ],
  imports: [
    CommonModule,
    SafePipe,
    // MatIcon
    RouterModule, 
  ]
})


export class CarouselComponent implements OnInit, AfterViewInit {
  slides$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]); 
  slides: any[] = []
  
  currentSlide = 0; // Index of the currently visible slide
  private intervalId: any; // Stores the interval ID for the auto-slide functionality
  private ytPlayers: any[] = []; // Array to store the YouTube player instances for each slide
  isBrowser: boolean = false; // Flag to check if the code is running in the browser
  private destroy$ = new Subject<void>()
  private SafePipe: any; // Placeholder for the SafePipe instance, if needed

  @ViewChildren('youtubeIframe') youtubeIframes!: QueryList<ElementRef>; // Reference to the YouTube iframe elements

  constructor(
    private featuredMediaService: FeaturedMediaService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID to check the environment
  ) {
    this.isBrowser = isPlatformBrowser(platformId); // Set isBrowser based on the platform
  }
  
  ngOnInit(): void {
    this.getCarouselData();
    // Fetch carousel data when the component initializes
    // Initialize YouTube API and auto-slide only in the browser
  }
  
  ngAfterViewInit(): void {
    if (this.isBrowser && this.slides.length > 0) {
      this.loadYouTubeIframeAPI();
      // this.startAutoSlide();
    }
    // After the view is initialized, especially the YouTube iframes, initialize the players
    if (this.isBrowser) {
      this.youtubeIframes.changes.subscribe(() => {
        this.initYouTubePlayers();
      });
      this.initYouTubePlayers(); // Initial call in case iframes are immediately present
    }
  }

  ngOnDestroy(): void {
    // Clear the auto-slide interval when the component is destroyed in the browser
    if (this.isBrowser && this.intervalId) {
      this.stopAutoSlide();
    }
    // Clean up YouTube players (optional, but good practice)
    if (this.isBrowser && this.ytPlayers.length > 0) {
      this.ytPlayers.forEach(player => {
        if (player && player.destroy) {
          player.destroy();
        }
      });
      this.ytPlayers = [];
    }
    
    this.destroy$.next
    this.destroy$.complete();

  }

  getCarouselData(): void {
    this.featuredMediaService.featuredMedia().subscribe((data: any) => {
      // Check if the data is valid and contains slides
      if (data && data.data && data.data.allCarousels && data.data.allCarousels.length > 0) {
        
        this.slides = data.data.allCarousels[0].featuredContentBlock || [];
      } else {
        console.error('Invalid carousel data received:', data);
      }
    })
  }

  startAutoSlide(): void {
    // Start the automatic sliding of the carousel at a defined interval
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000); // Adjust the interval as needed
  }

  stopAutoSlide(): void {
    // Stop the automatic sliding of the carousel by clearing the interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  previousSlide(): void {
    // Go to the previous slide in the carousel
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  nextSlide(): void {
    // Go to the next slide in the carousel
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  goToSlide(index: number): void {
    // Go to a specific slide in the carousel
    this.currentSlide = index % this.slides.length;
  }

  loadYouTubeIframeAPI(): void {
    // Asynchronously load the YouTube IFrame Player API code
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
    // Assign the onYouTubeIframeAPIReady function to the window object
    window.onYouTubeIframeAPIReady = () => this.initYouTubePlayers();
  }

  initYouTubePlayers(): void {
    // Initialize YouTube players for each iframe in the carousel
    this.youtubeIframes.forEach((iframe: ElementRef, index: number) => {
      const iframeElement = iframe.nativeElement;
      // Ensure it's an iframe and has a YouTube URL
      if (iframeElement.tagName === 'IFRAME' && this.slides$.value[index]?.mediaLink?.youtubeurl) {
        // Create a new YouTube player instance
        this.ytPlayers[index] = new window.YT.Player(iframeElement, {
          events: {
            'onReady': (event: any) => {
              // Player is ready
            },
            'onStateChange': (event: any) => this.onPlayerStateChange(event, index)
          }
        });
      }
    });
  }

  onPlayerStateChange(event: any, index: number): void {
    // Handle changes in the YouTube player's state
    const playerState = event.data;
    if (playerState === window.YT.PlayerState.PLAYING) {
      // If the video starts playing, stop the carousel auto-slide
      this.stopAutoSlide();
    } else if (playerState === window.YT.PlayerState.PAUSED || playerState === window.YT.PlayerState.ENDED) {
      // If the video is paused or ended, resume the carousel auto-slide
      this.startAutoSlide();
    }
  }

  getYoutubeEmbedUrl(url: string, index: number | null): string {
    // Extract the video ID from a YouTube URL and create an embed URL
    const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|v\/))([a-zA-Z0-9_-]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?enablejsapi=1&playerapiid=ytplayer${index}`;
    }
    return ''; // Return an empty string if the URL is invalid
  }
}