import { Injectable } from '@angular/core';
// import { loadStripe, Stripe} from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
// import { init } from '@graphql-codegen/cli';


@Injectable({
  providedIn: 'root'
})

export class CheckoutService {
  // private stripe: Stripe | null = null;

  constructor(
    private http: HttpClient,
  ) {
    this.initializeStripe();
   }

   private async initializeStripe() {
    // this.stripe =  await loadStripe('pk_test_51OqM50IPzMhyw9y2XnZ2w7jorAvxFVIiDgvd2g4RYXAOt0lmnIdClgct8qtuPChrGpQxWjkzrZqGdBBqSXr9plQH00YjMUGFyP')
   }

   createCheckoutSession(ticketLink: string): Observable<string> {
    return this.http.post('/api/create-checkout-session', ticketLink)
      .pipe(
        map(((res: any) => res['sessionId'])),
        )
    }

  //  async redirectToCheckout(sessionId: string) {
  //   if(!this.stripe) {
  //     console.error('Stripe.js has not loaded');
  //     return;
  //   }
  //   const { error } = await this.stripe.redirectToCheckout({sessionId});

  //   if(error) {
  //     console.error('error redirecting to checkout', error);
  //   }

  //   this.stripe.redirectToCheckout({
  //     sessionId
  //   });
  //  }

  

}
