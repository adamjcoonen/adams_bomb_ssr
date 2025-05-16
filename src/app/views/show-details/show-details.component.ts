import { Component, OnInit, PLATFORM_ID, Inject, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { loadStripe } from '@stripe/stripe-js';
import { CheckoutService } from '../../services/checkout.service';
import { MatCardModule } from '@angular/material/card';
import { GoogleMapsModule } from '@angular/google-maps';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { render } from 'datocms-structured-text-to-html-string';



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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private router: Router,
    private checkoutService: CheckoutService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.show = navigation?.extras.state;
    console.log(this.show, "see the show data")
  }

  ngOnInit() {
    if (!this.show) {
      this.router.navigate(['/']);
    }
    else {
      console.log(this.show, 'show');
    }
    this.center = { lat: +this.show.showLocation.latitude, lng: +this.show.showLocation.longitude };
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: this.center,
      zoom: 18,
      mapId: process.env['GOOGLE_MAPS_API_KEY'],
      streetViewControl: false,
    });
    console.log(this.map, 'map');
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position: this.center,
      title: this.show.showLocation.name,

    });
    console.log(this.show, "show details")

    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="color: black;">
                  <h3>${this.show.venueName}</h3>
                  <p style="color: black;">Click the links below:</p>
                  <a href="https://www.google.com/maps?q=${this.center}" target="_blank" style="color: black;">View on Google Maps</a><br>
                  <a href="http:" id="get-directions" style="color: black;">Get Directions</a>
                </div>`,
    });

    marker.addListener('click', () => {
      infoWindow.open(this.map, marker);

      // Add event listener for "Get Directions" link
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

