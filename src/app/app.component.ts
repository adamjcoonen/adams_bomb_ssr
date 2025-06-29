import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './common/footer/footer.component';
import { HeaderComponent } from './common/header/header.component';
import { RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { debounceTime, Subject } from 'rxjs'; // Import RxJS
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterModule],
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  showFooter: boolean = false;
  private scrollSubject = new Subject<void>(); // Subject for scroll events

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.scrollSubject.pipe(debounceTime(200)).subscribe(() => this.onWindowScroll()); // Debounce logic
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      const scrollPosition = document.documentElement.scrollTop;
      this.showFooter = scrollPosition > 100;
    }
    this.scrollSubject.next(); // Emit scroll event
  }

}
