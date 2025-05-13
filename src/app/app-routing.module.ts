import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComicsComponent } from './views/comics/comics.component';
import { ShowsComponent } from './views/shows/shows.component';
import { AboutComponent } from './views/about/about.component';
import { ClipsComponent } from './views/clips/clips.component';
import { MainComponent } from './views/main/main.component';
import { ShowDetailsComponent } from './views/show-details/show-details.component';
import { ComicDetailsComponent } from './views/comic-details/comic-details.component';
import { AuthCallbackViewComponent } from './views/auth-callback-view/auth-callback-view.component';
import { PaymentsComponent } from './views/payments/payments.component';


const routes: Routes = [
  {path: 'comics', component: ComicsComponent },
  {path: 'comic/:id', component: ComicDetailsComponent },
  {path: 'shows', component: ShowsComponent },
  {path: 'show/:id', component: ShowDetailsComponent},
  {path: 'about', component: AboutComponent },
  {path: 'clips', component: ClipsComponent },
  {path: 'home', component: MainComponent },
  {path: 'auth/callback', component: AuthCallbackViewComponent },
  {path: 'payment/:id', component: PaymentsComponent },
  {path: '**', redirectTo: '/home', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking'
})],
  exports: [RouterModule],
})
export class AppRoutingModule { }
