import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { OpenMicsService } from '../../services/openmics.service';
import { BehaviorSubject } from 'rxjs';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'app-openmics',
  imports: [
    CommonModule,
    MatExpansionModule,
    MatCard
  ],
  providers: [OpenMicsService],
  templateUrl: './openmics.component.html',
  styleUrl: './openmics.component.css',
})
export class OpenMicsComponent {
  daysOfWeek: string[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  opneMicList$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]); // Initialize with an empty array
  openMicList: any[] = [];
  constructor(
    private openMicsService: OpenMicsService,
  ) {
    // You can initialize any properties or services here if needed
  }

  ngOnInit() {
    // This method is called when the component is initialized
    // You can perform any setup or data fetching here
    this.openMicsService.openMicList();
    this.getOpenMicList();
  }
  getOpenMicList(): void {
    this.openMicsService.openMicListBehaviorSubject.subscribe((data: any[]) => {
      console.log(data, 'open mic data in open mic component');
      if (data && data.length > 0) {
        console.log(data, 'open mic data in open mic component after if');
        this.opneMicList$.next(data);
        this.openMicList = this.opneMicList$.value;
      }
    });
  }
}
