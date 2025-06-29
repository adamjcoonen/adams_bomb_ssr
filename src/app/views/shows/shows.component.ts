import { Component, OnInit } from '@angular/core';
import { ShowsService } from '../../services/shows.service';
// import { any } from '../../../generated/graphql';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatCardModule } from '@angular/material/card';
import { ContentPieceComponent } from '../../common/content-piece/content-piece.component';
import { ShowCalendarComponent } from './show-calendar/show-calendar.component';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-shows',
  templateUrl: './shows.component.html',
  imports: [CommonModule, MatSlideToggleModule, MatCardModule, ShowCalendarComponent, FormsModule, ContentPieceComponent],
  styleUrls: ['./shows.component.scss'],
})
export class ShowsComponent implements OnInit {
  showsList: any[] = [];
  listType!: "home" | "list";
  isCalendar: boolean = false

  constructor(public showsService: ShowsService) {

  }

  ngOnInit(): void {
    this.showsService.showsList()
    this.getShows();
  }

  getShows(): void {
    this.showsService.showsList().subscribe((data: any[]) => {
      if (data && data.length > 0) {
        console.log(data, "shows data");
        this.showsList = data.sort((a, b) => new Date(a.showDate).getTime() - new Date(b.showDate).getTime());

      }
    });
  }
  onToggleChange(): void {
    if (this.isCalendar) {
      this.isCalendar = false;
      console.log('Calendar view selected');
      // Add your logic to switch to the Calendar view
    } else {
      console.log('List view selected');
      this.isCalendar = true;
      // Add your logic to switch to the List view
    }
  }
}
