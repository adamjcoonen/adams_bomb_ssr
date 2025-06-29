import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationComponent } from '../navigation/navigation.component';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [NavigationComponent, MatToolbar],
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  constructor(
  ) { }

}
