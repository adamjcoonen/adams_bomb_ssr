import { Component } from '@angular/core';
import { ComicsService } from '../../services/comics.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { ContentPieceComponent } from '../../common/content-piece/content-piece.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-comics',
  templateUrl: './comics.component.html',
  imports: [
    MatCardModule,
    ContentPieceComponent,
    MatDividerModule,
    MatListModule,
    CommonModule],
  styleUrls: ['./comics.component.scss']
})
export class ComicsComponent {
  comics: BehaviorSubject<any> = new BehaviorSubject<any>(undefined)
  comicsList: [] = []
  producersList: [] | any = []
  foundersList: [] | any = []


  constructor(
    private comicsService: ComicsService
  ) { }

  ngOnInit(): void {
    this.comicsService.comicsList().subscribe((list) => {
      this.comics.next(list)
      this.comicsList = this.comics.value.data.allFeaturedComicLists.filter((comic: any) => comic.role != 'Founder')
      this.foundersList = this.comics.value.data.allFeaturedComicLists.filter((comic: any) => comic.role === 'Founder')
      this.producersList = this.comics.value.data.allFeaturedComicLists.filter((comic: any) => comic.role === 'Producing Partner')
      // this.producersList = this.comicsList.filter((comic: any) => comic.role = 'Producing Partner')
      // this.foundersList = this.comicsList.filter((comic: any) => comic.role = 'Founder')
    })
  }
}