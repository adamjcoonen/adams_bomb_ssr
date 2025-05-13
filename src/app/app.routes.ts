import { Routes } from '@angular/router';
import { AboutComponent } from './views/about/about.component';
import { AuthCallbackViewComponent } from './views/auth-callback-view/auth-callback-view.component';
import { ComicsComponent } from './views/comics/comics.component';
import { ComicDetailsComponent } from './views/comic-details/comic-details.component';
import { ClipsComponent } from './views/clips/clips.component';
import { MainComponent } from './views/main/main.component';
import { PaymentsComponent } from './views/payments/payments.component';
import { ShowsComponent } from './views/shows/shows.component';
import { ShowDetailsComponent } from './views/show-details/show-details.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
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
