import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { withFetch } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()), // Uncomment if you need to use HttpClient with fetch
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ]
};

/*
import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient, withFetch } from '@angular/common/http'; // Import provideHttpClient and withFetch
import { GoogleMapsModule, GoogleMapsConfig } from '@angular/google-maps'; // Import GoogleMapsConfig

// --- Function to fetch Google Maps API Key ---
async function initializeGoogleMaps(): Promise<GoogleMapsConfig> {
  if (typeof window === 'undefined') {
    // We are on the server, no need to load Google Maps config
    return { apiKey: '' }; // Return an empty config or handle appropriately for SSR
  }

  // Fetch the API key from your backend
  try {
    const response = await fetch('/api/google-maps-api-key');
    if (!response.ok) {
      console.error('Failed to fetch Google Maps API key:', response.statusText);
      throw new Error('Failed to fetch Google Maps API key');
    }
    const data = await response.json();
    if (!data.apiKey) {
      console.error('API Key not found in response:', data);
      throw new Error('API Key not found in response');
    }
    console.log('Google Maps API key fetched successfully.');
    return { apiKey: data.apiKey };
  } catch (error) {
    console.error('Error during Google Maps API key initialization:', error);
    // Fallback or error handling for when the key cannot be fetched
    return { apiKey: '' }; // Provide an empty key or a dummy key if you want to avoid crashes
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()), // Ensure HttpClient is provided
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    // Provide GoogleMapsModule with the dynamically fetched API key
    {
      provide: GoogleMapsConfig,
      useFactory: initializeGoogleMaps,
      // You can also add `deps: [HttpClient]` if you were injecting HttpClient directly,
      // but `fetch` is global and doesn't require injection.
      // This `useFactory` will make `initializeGoogleMaps` run once during app bootstrap.
      multi: false, // Ensures only one GoogleMapsConfig is provided
    },
    importProvidersFrom(GoogleMapsModule), // Import the module after providing its config
  ]
};
*/