import { Component, Input } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { RouterModule, Route, Router } from "@angular/router";
import { CommonModule } from '@angular/common';
import { DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

@Component({
  selector: 'app-show-calendar',
  templateUrl: './show-calendar.component.html',
  imports: [CommonModule, RouterModule],
  providers: [
    {
      provide: DateAdapter,
      useFactory: adapterFactory
    }
  ],
  styleUrls: ['./show-calendar.component.scss']
})
export class ShowCalendarComponent {
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  @Input() eventsList: any[] = [];
  CalendarView = CalendarView;

  constructor() {
  }

  ngOnInit() {
    this.events = this.eventsList.map((event) => {
      return {
        title: event.showName,
        start: new Date(event.showDate),
        color: {
          primary: 'black',
          secondary: 'white'
        },
        allDay: false 
      };
    });
  }


  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    // this.activeDayIsOpen = false;
  }
}