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
  clipsList: any[] = [];

  constructor(
    public ClipsService: ClipsService
  ) { }

  ngOnInit(): void {
    this.ClipsService.clipsList().subscribe((data: any[]) => {
      console.log(data, 'clips data in clips component');
      if (data && data.length > 0) {
        this.clipsList = data;
      }
    })
  }




}
