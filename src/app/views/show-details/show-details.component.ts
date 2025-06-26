import { Component, OnInit, PLATFORM_ID, Inject, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { render } from 'datocms-structured-text-to-html-string';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, Subject } from 'rxjs'; // For managing subscriptions

// Declare google on the window object to avoid TypeScript errors
// This is necessary because the Google Maps script adds 'google' globally.
declare const google: any;

@Component({
  selector: 'app-show-details',
  templateUrl: './show-details.component.html',
  imports: [MatCardModule, CommonModule], // Ensure GoogleMapsModule is NOT here
  styleUrl: './show-details.component.scss'
})
export class ShowDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  show: any;
  center: { lat: number, lng: number } = { lat: 32.678418, lng: -81.809007 };
  zoom = 13;
  map: google.maps.Map | undefined;
  showDescription: any;
  mapId: string | undefined; // Store the mapId if needed later

  private destroy$ = new Subject<void>(); // For managing subscriptions

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient // Inject HttpClient
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.show = navigation?.extras.state;
    console.log(this.show, "see the show data");
  }

  ngOnInit() {
    if (!this.show) {
      this.router.navigate(['/']);
      return; // Exit if no show data
    } else {
      console.log(this.show, 'show');
      this.center = { lat: +this.show.showLocation.latitude, lng: +this.show.showLocation.longitude };
    }

    // IMPORTANT: Only initialize Google Maps if running in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleMapsScriptAndInitializeMap();
    } else {
      console.log('Google Maps initialization skipped on server-side rendering.');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Optional: Clean up global initMap if it was exclusively for this component
    if ((window as any).initMap === this.onGoogleMapsLoaded) {
      delete (window as any).initMap;
    }
  }

  // This is the global callback function that Google Maps API will call
  // once its script is fully loaded and parsed.
  // We need to ensure `this` context is maintained.
  // Use an arrow function or bind `this`.
  onGoogleMapsLoaded = () => {
    console.log('Google Maps API script loaded and initMap callback called.');
    // Now that 'google' object is guaranteed to be available, proceed with map initialization.
    this.initializeMapCore();
  };

  private async loadGoogleMapsScriptAndInitializeMap(): Promise<void> {
    let googleConfig: { apiKey: string, mapId: string } | undefined;
    try {
      // Fetch the API key and Map ID securely from your server endpoint
      const response = await lastValueFrom(this.http.get<{ apiKey: string, mapId: string }>('/api/google-maps-config'));
      googleConfig = response;
      if (!googleConfig?.apiKey || !googleConfig?.mapId) {
        console.error('Google Maps API key or Map ID not fetched from server.');
        return; // Stop here if key/ID are missing
      }
    } catch (error) {
      console.error('Error fetching Google Maps API config:', error);
      return; // Stop here if there's an error fetching config
    }

    // Check if the google maps API is ALREADY loaded.
    // This is crucial for avoiding multiple script loads on subsequent page visits
    // or if the component is re-rendered (though Angular usually prevents this for singletons).
    if (typeof google === 'undefined' || !google.maps) {
      console.log('Google Maps script not yet loaded. Dynamically loading...');

      // Assign the global callback *before* creating the script,
      // so it's ready when the script finishes loading.
      (window as any).initMap = this.onGoogleMapsLoaded;

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleConfig.apiKey}&callback=initMap&libraries=marker&map_id=${googleConfig.mapId}`;
      script.async = true; // Load script asynchronously
      script.defer = true; // Defer script execution until HTML parsing is complete
      this.mapId = googleConfig.mapId; // Store mapId for later use if needed
      document.head.appendChild(script);
    } else {
      console.log('Google Maps API already loaded, initializing map directly.');
      // If already loaded (e.g., user navigated back), directly initialize the map
      this.initializeMapCore();
    }
  }

  private initializeMapCore(): void {
    // Crucial safety check: Ensure 'google' and its necessary sub-objects exist
    // before attempting to use them. This covers cases where initMap might be called
    // but something else went wrong, or for robustness.
    if (typeof google === 'undefined' || !google.maps || !google.maps.Map || !google.maps.marker || !google.maps.marker.AdvancedMarkerElement || !google.maps.InfoWindow) {
        console.error('Google Maps API or required libraries (Map, Marker, InfoWindow) are not fully loaded yet.');
        // You might want to display a message to the user or retry after a delay
        return;
    }

    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.warn('Map element with ID "map" not found. Google Map will not be displayed.');
      return;
    }

    this.map = new google.maps.Map(mapElement as HTMLElement, {
      center: this.center,
      zoom: 18, // Adjust zoom as needed
      mapId: this.mapId, // Use the mapId you got from your data if available, or from fetched config
      streetViewControl: false,
    });
    console.log(this.map, 'map initialized');

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position: this.center,
      title: this.show.showLocation.name,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="color: black;">
                  <h3>${this.show.venueName}</h3>
                  <p style="color: black;">Click the links below:</p>
                  <a href="http://maps.google.com/maps?q=${this.center.lat},${this.center.lng}" target="_blank" style="color: black;">View on Google Maps</a><br>
                  <a href="#" id="get-directions" style="color: black;">Get Directions</a>
                </div>`,
    });

    marker.addListener('click', () => {
      infoWindow.open(this.map, marker);

      setTimeout(() => {
        const directionsLink = document.getElementById('get-directions');
        if (directionsLink) {
          directionsLink.addEventListener('click', (event) => {
            event.preventDefault();
            this.openDirections(this.center.lat, this.center.lng);
          });
        }
      }, 0);
    });
  }

  ngAfterViewInit() {
    this.handleDatoCMSstructuredText();
  }

  openDirections(lat: number, lng: number): void {
    if (isPlatformBrowser(this.platformId)) {
      // Use the Google Maps directions URL for broad compatibility
      const directionsUrl = `http://maps.google.com/maps?daddr=${lat},${lng}&dirflg=d`;
      window.open(directionsUrl, '_blank');
    }
  }

  handleDatoCMSstructuredText(): void {
    if (this.show.showDescription?.value?.document) {
      this.showDescription = render(this.show.showDescription.value.document);
    }
  }

  redirectToCheckout(): void {
    const ticketLink = this.show?.ticketLink?.value?.document?.children?.[0]?.children?.[0]?.url;
    if (ticketLink) {
      if (isPlatformBrowser(this.platformId)) {
        window.location.href = ticketLink;
      }
    } else {
      console.error('No ticket link available');
    }
  }
}