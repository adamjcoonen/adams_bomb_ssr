import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { ClipRecord } from 'src/generated/graphql';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { MatCard } from '@angular/material/card';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-comic-details',
  templateUrl: './comic-details.component.html',
  imports: [MatCardModule, MatExpansionModule, CommonModule, MatDividerModule],
  styleUrl: './comic-details.component.scss'
})
export class ComicDetailsComponent {
  comic: any
  safeClipList: SafeResourceUrl[] = []

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.comic = navigation?.extras.state;
    console.log(this.comic, "see the comic data")
  }

  ngOnInit() {
    console.log(this.comic, "see the comic data")
    this.comic.clips.forEach((clip: any) => {
      this.safeClipList.push(this.getSafeClipUrl(clip.youtubeurl!))
    })
  }

  getSafeClipUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

