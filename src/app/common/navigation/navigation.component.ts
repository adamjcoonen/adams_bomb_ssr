import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, MatIconModule, RouterModule],

})
export class NavigationComponent {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
    ) { }

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      if(isPlatformBrowser(this.platformId)) { 
        window.scrollTo(0, 0)
      }
    });
  }
}
