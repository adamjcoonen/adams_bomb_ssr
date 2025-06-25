import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
// import { OAuthService } from 'angular-oauth2-oidc';
import { ElementRef, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { CarouselComponent } from '../../common/carousel/carousel.component';
import { ShowsComponent } from '../shows/shows.component';
// import { FeaturedMediaService } from '../../services/featured-media.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    CarouselComponent,
    ShowsComponent,
  ],
  styleUrls: ['./main.component.scss'],
  providers: [],
})


export class MainComponent {

  // @ViewChild('rightColumn') rightColumn!: ElementRef;
  // @ViewChild('leftColumn') leftColumn!: ElementRef;
  dataLoaded: boolean = false;

  constructor(
    // private oauthService: OAuthService,
    // private el: ElementRef,
    // private featuredMediaService: FeaturedMediaService,
  ) { 
  }

  ngOnInit() {
  }
}
