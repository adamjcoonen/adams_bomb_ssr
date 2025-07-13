import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, Observable } from 'rxjs';
import { takeUntil, map, shareReplay } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

interface NavLink {
  label: string;
  routerLink: string;
}

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  standalone: true, // Make it standalone for easier integration
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule
  ]
})
export class NavigationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isHandset$: Observable<boolean>;

  navLinks: NavLink[] = [
    { label: 'Home', routerLink: '/' },
    { label: 'Shows', routerLink: '/shows' },
    { label: 'Featured Comics', routerLink: '/comics' },
    { label: 'Clips', routerLink: '/clips' },
    { label: 'Podcasts', routerLink: '/podcast' },
    { label: 'DMV Open Mics', routerLink: '/openmics' },
    { label: 'About Us', routerLink: '/about' },
  ];

  constructor(private breakpointObserver: BreakpointObserver) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay(),
        takeUntil(this.destroy$)
      );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}