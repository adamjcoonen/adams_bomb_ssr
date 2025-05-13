import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  providers: [MatCard],
  imports: [ MatCardModule ],
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {

}
