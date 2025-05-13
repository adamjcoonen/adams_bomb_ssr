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
    // this.oauthService.loadDiscoveryDocumentAndTryLogin().then(_ => {
    //   if (this.oauthService.hasValidAccessToken()) {
    //     // Redirect to home or dashboard page upon successful authentication
    //     // You can use Angular Router for this
    //     console.log('Logged in');
    //   } else {
    //     // Handle login failure
    //     // Redirect to login page or show an error message
    //     console.log('Logged out');
    //   }
    // });
    // this.featuredMediaService.featuredMediaBehaviorSubject.subscribe((data: any) => {
    //   if (data && data.length > 0) {
    //     console.log(data, 'featured media data in main component');
    //     this.dataLoaded = true;
    //   }
    // })
  }
}
