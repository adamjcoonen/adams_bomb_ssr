// main.ts  –- the only file that still mentions providers at app-wide scope
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter }          from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { importProvidersFrom }    from '@angular/core';
import { routes } from './app/app.routes';
import { environment } from './app/environments/environment';

// 3rd-party “forRoot” / ModuleWithProviders calls
// import { OAuthModule }  from 'angular-oauth2-oidc';
// import { CalendarModule, DateAdapter } from 'angular-calendar';
// import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { GoogleMapsModule } from '@angular/google-maps';
// import { StripeModule } from 'stripe-angular';
import { FormsModule } from '@angular/forms';

// import { routes }       from './app/app.routes';
import { AppComponent } from './app/app.component';


// Expose environment variables to the global window object
(window as any).env = {
  googleMapsApiKey: environment.googleMapsApiKey,
};

console.log((window as any).env.googleMapsApiKey);
console.log((window as any).env.googleMapsApiID);

bootstrapApplication(AppComponent, {
  providers: [
    /* Angular built-ins */
    provideRouter(routes),                        // replaces RouterModule.forRoot
    provideHttpClient(withFetch()),               // replaces HttpClientModule
    provideAnimationsAsync(),                     // replaces BrowserAnimationsModule

    /* Anything that used to be `imports: [ XModule.forRoot() ]` */
    importProvidersFrom(
      // OAuthModule.forRoot(),
      // CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
      GoogleMapsModule,
      // StripeModule,
      FormsModule
    ),
  ],
});
