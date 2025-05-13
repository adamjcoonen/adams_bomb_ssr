import { Component } from '@angular/core';
// import { loadStripe, Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
// import { ShowRecord } from 'src/generated/graphql';
import { ShowsService } from '../../services/shows.service';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  imports: [MatCardModule, CommonModule],
  styleUrl: './payments.component.scss'
})
export class PaymentsComponent {
  cardCaptureReady = false
  show: any | undefined;

  // stripe!: Stripe | null;
  // elements!: StripeElements;
  // card!: StripeCardElement;
  // address!: StripeCardElement;

  constructor(
    private showsService: ShowsService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // this.initializeStripe();

    this.showsService.showListBehaviorSubject.subscribe((data: any[]) => {
      if(data) {
        this.show = data.find((show: any) => show.id === this.route.snapshot.params['id']);
      }
    });
  }

  // async initializeStripe() {
  //   this.stripe = await loadStripe('pk_test_51OqM50IPzMhyw9y2XnZ2w7jorAvxFVIiDgvd2g4RYXAOt0lmnIdClgct8qtuPChrGpQxWjkzrZqGdBBqSXr9plQH00YjMUGFyP');
  //   if(this.stripe)
  //   this.elements = this.stripe.elements();

  //   this.card = this.elements.create('card');
  //   // this.address = this.elements.create()
  //   this.card.mount('#card-element');
  // }

  // async handlePayment() {
  //   if (this.stripe) {
  //     const {token, error} = await this.stripe.createToken(this.card);

  //     if (error) {
  //       console.error(error);
  //     } else {
  //       console.log(token);
  //       // Send the token to your server to process the payment
  //     }
  //   }
  // }

  onCardCaptureReady() {
    this.cardCaptureReady = true;
  }
  changeTicketNumber() {
    console.log('changing ticket number');
  }
  
}
