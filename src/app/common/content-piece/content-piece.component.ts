import { Component, Input } from "@angular/core";
import { RouterModule, Router } from "@angular/router";
// import { ShowRecord, FeaturedComicListRecord, ClipRecord } from "../../../generated/graphql";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { SafeResourceUrl, DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: 'app-content-piece',
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterModule],
  templateUrl: './content-piece.component.html',
  styleUrl: './content-piece.component.scss'
})
export class ContentPieceComponent {
  @Input() typeData!: any;
  @Input() data!: any;
  config: any;

  comic?: any;
  show?: any;
  clip?: any;

  safeClipUrl?: SafeResourceUrl
  safeComicUrl?: SafeResourceUrl
  safeShowUrl?: SafeResourceUrl


  constructor(
    private sanitizer: DomSanitizer,
    public router: Router,
  ) { }

  ngOnInit() {
    this.setComponentType();
    if (this.clip)
      this.safeClipUrl = this.getSafeClipUrl(this.clip?.youtubeurl!);
  }
  setComponentType() {
    // console.log(this.typeData, this.data, 'typeData')
    if (this.typeData === 'shows') {
      this.show = this.data;
    } else if (this.typeData === 'clips') {
      this.clip = this.data;
    } else if (this.typeData === 'comics') {
      this.comic = this.data;
    }
  }

  getSafeClipUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  navToShowPayments() {
    this.router.navigate(['/show-payments', this.show?.id]);
  }
}