import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { environment } from 'src/app/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class googleOAuthService {


  // authConfig: AuthConfig = {
  //   issuer: 'https://accounts.google.com',
  //   responseType: 'code',
  //   clientId: environment.clientId,
  //   redirectUri: window.location.origin + '/auth/callback',
  //   scope: 'openid profile email',
  //   strictDiscoveryDocumentValidation: false,
  //   showDebugInformation: true,
  //   disablePKCE: false,
  // };

  constructor(private oauthService: OAuthService) {
    // console.log(window.location.origin + '/auth/callback', 'window.location.origin')
    // this.oauthService.configure(this.authConfig);
    // this.oauthService.loadDiscoveryDocumentAndTryLogin().then(_ => {
    //   if (this.oauthService.hasValidAccessToken()) {
    //     this.oauthService.initCodeFlow();
    //     console.log('Logged in');
    //   } else {
    //     console.log('Logged out');
    //   }
    // })
  }

  public login(): void {
    this.oauthService.initCodeFlow();
  }

  // public logOut(): void {
  //   this.oauthService.initCodeFlow();
  // }
}