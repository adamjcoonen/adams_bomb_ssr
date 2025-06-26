import { Component, OnInit, PLATFORM_ID, Inject, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { loadStripe } from '@stripe/stripe-js';
import { CheckoutService } from '../../services/checkout.service';
import { MatCardModule } from '@angular/material/card';
import { GoogleMapsModule } from '@angular/google-maps';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { render } from 'datocms-structured-text-to-html-string';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, lastValueFrom } from 'rxjs';


declare const google: any;
@Component({
  selector: 'app-show-details',
  templateUrl: './show-details.component.html',
  imports: [MatCardModule, GoogleMapsModule, CommonModule],
  styleUrl: './show-details.component.scss'
})
export class ShowDetailsComponent implements OnInit, AfterViewInit{
  show: any
  center: { lat: number, lng: number } = { lat: 32.678418, lng: -81.809007 }
  zoom = 13
  // stripePromise = loadStripe('YOUR_STRIPE_PUBLISHABLE_KEY');
  map: google.maps.Map | undefined;
  showDescription: any;

  private destroy$ = new Subject<void>(); // For managing subscriptions

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.show = navigation?.extras.state;
  }

  ngOnInit() {
    if (!this.show) {
      this.router.navigate(['/']);
      return;
    } else {
      console.log(this.show, 'show');
      this.center = { lat: +this.show.showLocation.latitude, lng: +this.show.showLocation.longitude };
    }

    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleMapsScriptAndInitializeMap();
    } else {
      console.log('Google Maps initialization skipped on server-side rendering.');
    }
  }

  private async loadGoogleMapsScriptAndInitializeMap(): Promise<void> {
    let googleApiKey: string | undefined;
    try {
      const response = await lastValueFrom(this.http.get<{ apiKey: string }>('/api/google-maps-api-key'));
      googleApiKey = response.apiKey;
      if (!googleApiKey) {
        console.error('Google Maps API key not fetched from server.');
        return;
      }
    } catch (error) {
      console.error('Error fetching Google Maps API key:', error);
      return;
    }

    // Dynamically load the Google Maps script if not already loaded
    if (typeof google === 'undefined' || !google.maps) {
      console.log('Loading Google Maps script dynamically...');
      const script = document.createElement('script');
      // Using `callback=initMap` means the `initMap` global function will be called once the script loads.
      // We need to define `initMap` globally.
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&callback=initMap&libraries=marker`; // Add libraries=marker for AdvancedMarkerElement
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      // Define the global callback function.
      // This will be called by Google Maps API once the script is loaded.
      // Make sure this is only defined once.
      if (!(window as any).initMap) {
        (window as any).initMap = () => {
          console.log('Google Maps API script loaded and initMap callback called.');
          this.initializeMapCore(); // Call the core map initialization
        };
      }
    } else {
      console.log('Google Maps API already loaded, initializing map directly.');
      this.initializeMapCore(); // If already loaded, initialize directly
    }
  }

  private initializeMapCore(): void {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.warn('Map element with ID "map" not found. Google Map will not be displayed.');
      return;
    }

    if (typeof google === 'undefined' || !google.maps || !google.maps.Map || !google.maps.marker || !google.maps.marker.AdvancedMarkerElement) {
        console.error('Google Maps API or required libraries are not fully loaded.');
        return;
    }

    this.map = new google.maps.Map(mapElement as HTMLElement, {
      center: this.center,
      zoom: 10,
      mapId: 'google', // Uncomment if you have a custom Map ID
    });

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position: this.center,
      title: this.show.showLocation.name,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="color: black;">
                  <h3>${this.show.venueName}</h3>
                  <p style="color: black;">Click the links below:</p>
                  <a href="https://www.google.com/maps/dir/?api=1&destination=${this.center.lat},${this.center.lng}" target="_blank" style="color: black;">View on Google Maps</a><br>
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
    // IMPORTANT: Only initialize Google Maps if running in the browser
  //   if (isPlatformBrowser(this.platformId)) {
  //     // console.log(process.env, process.env['googleMapsApiId'], 'googleMapsApiId');
  //     this.center = { lat: +this.show.showLocation.latitude, lng: +this.show.showLocation.longitude };

  //     // Ensure the map element exists before trying to create the map
  //     const mapElement = document.getElementById('map');
  //     if (mapElement) {
  //       this.map = new google.maps.Map(mapElement as HTMLElement, {
  //         center: this.center,
  //         zoom: 10,
  //         // mapId: process.env['googleMapsApiId'], // Ensure this API key is loaded client-side if used
  //       });
  //       console.log(this.map, 'map');

  //       const marker = new google.maps.marker.AdvancedMarkerElement({
  //         map: this.map,
  //         position: this.center,
  //         title: this.show.showLocation.name,
  //       });

  //       const infoWindow = new google.maps.InfoWindow({
  //         content: `<div style="color: black;">
  //                     <h3>${this.show.venueName}</h3>
  //                     <p style="color: black;">Click the links below:</p>
  //                     <a href="https://www.google.com/maps?q=${this.center.lat},${this.center.lng}" target="_blank" style="color: black;">View on Google Maps</a><br>
  //                     <a href="#" id="get-directions" style="color: black;">Get Directions</a>
  //                   </div>`,
  //       });

  //       marker.addListener('click', () => {
  //         infoWindow.open(this.map, marker);

  //         setTimeout(() => {
  //           const directionsLink = document.getElementById('get-directions');
  //           if (directionsLink) {
  //             directionsLink.addEventListener('click', (event) => {
  //               event.preventDefault();
  //               this.openDirections(this.center.lat, this.center.lng);
  //             });
  //           }
  //         }, 0);
  //       });
  //     } else {
  //       console.warn('Map element with ID "map" not found. Google Map will not be displayed.');
  //     }
  //   } else {
  //     console.log('Google Maps initialization skipped on server-side rendering.');
  //   }
  // }

  ngAfterViewInit() {
    this.handleDatoCMSstructuredText();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  openDirections(lat: number, lng: number): void {
    // Use the Google Maps directions URL with the user's current location
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(directionsUrl, '_blank');
  }
  handleDatoCMSstructuredText(): void {
    if(this.show.showDescription.value.document)
    this.showDescription = render(this.show.showDescription.value.document);
  }

  redirectToCheckout(): void {
    const ticketLink = this.show.ticketLink.value.document.children[0].children[0].url;

    if (ticketLink) {
      if(isPlatformBrowser(this.platformId)) {
        window.location.href = ticketLink; // Redirect to the Stripe Checkout URL
      }
    } else {
      console.error('No ticket link available');
    }
  }
}

