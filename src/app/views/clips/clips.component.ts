import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// import { ClipRecord } from 'src/generated/graphql';
import { ClipsService } from '../../services/clips.service';
import { MatCardModule } from '@angular/material/card';
import { ContentPieceComponent } from '../../common/content-piece/content-piece.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-clips',
  templateUrl: './clips.component.html',
  imports: [MatCardModule, ContentPieceComponent, CommonModule],
  styleUrls: ['./clips.component.scss']
})
export class ClipsComponent {
  behaviorSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  clipsList: any[] = [];

  constructor(
    public ClipsService: ClipsService
  ) { }

  ngOnInit(): void {
    this.ClipsService.clipListBehaviorSubject.subscribe((data: any[]) => {
      if (data.length > 0) {
        this.behaviorSubject.next(data);
        if (this.behaviorSubject.getValue() !== null && this.behaviorSubject.getValue() !== undefined) {
          this.clipsList = this.behaviorSubject.getValue();
        }
      }
    })
  }




}
