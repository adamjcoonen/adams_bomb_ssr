import { Component } from '@angular/core';
// import { ShowRecord } from 'src/generated/graphql';
import { ShowsService } from '../../services/shows.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  
    showData: any;
    constructor(
      private showsService: ShowsService
    ) { }
  
    ngOnInit(): void {
      this.showsService.showsList().subscribe((data: any) => {
        this.showData = data;
      })
    }


}
