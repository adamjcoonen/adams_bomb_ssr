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
  styleUrl: './openmics.component.scss',
})
export class OpenMicsComponent {
  daysOfWeek: string[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  openMicList: any[] = [];
  constructor(
    private openMicsService: OpenMicsService,
  ) {
    // You can initialize any properties or services here if needed
  }

  ngOnInit() {
    // This method is called when the component is initialized
    // You can perform any setup or data fetching here
    this.getOpenMicList();
  }
  getOpenMicList(): void {
    this.openMicsService.openMicList().subscribe((data: any[]) => {
      console.log(data, 'open mic data in openmics component');
      if (data && data.length > 0) {
        this.openMicList = data;
      }
    })
  }
}
