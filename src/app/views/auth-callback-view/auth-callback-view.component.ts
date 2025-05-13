import { Component } from '@angular/core';
// import { OAuthService } from 'angular-oauth2-oidc';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth-callback-view',
  standalone: true,
  imports: [],
  templateUrl: './auth-callback-view.component.html',
  styleUrl: './auth-callback-view.component.scss'
})
export class AuthCallbackViewComponent {



  constructor(
    // private oauthService: OAuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

//   ngOnInit() {
//   this.oauthService.loadDiscoveryDocumentAndTryLogin().then(_ => {
//     if (this.oauthService.hasValidAccessToken()) {
//       // Redirect to home or dashboard page upon successful authentication
//       // You can use Angular Router for this
//       this.router.navigate(['/home']);
//     } else {
//       // Handle login failure
//       // Redirect to login page or show an error message
//       this.router.navigate(['']);
//       }
//     });
//   } 
}