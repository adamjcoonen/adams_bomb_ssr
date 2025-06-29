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
  }


  onCardCaptureReady() {
    this.cardCaptureReady = true;
  }
  changeTicketNumber() {
  }
  
}
