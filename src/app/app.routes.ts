import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { ChatComponent } from './components/chat-lobby/chat/chat.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ChatLobbyComponent } from './features/chat-lobby/chat-lobby.component';
import { TopRankedRoomsComponent } from './components/chat-lobby/top-ranked-rooms/top-ranked-rooms.component';
import { NavComponent } from './components/nav/nav.component';
import { ProfileInformationComponent } from './features/profile-information/profile-information.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'chat/:roomId', component: ChatComponent },
  { path: 'profile-info', component: ProfileInformationComponent,
    children: [
      { path: '', redirectTo: 'profile/:userId', pathMatch: 'full' },
      { path: 'profile/:userId', component: ProfileComponent },
    ]
  },
  {
    path: 'nav',
    component: NavComponent,
    children: [
      // Nested routes under NavComponent
      { path: '', redirectTo: 'chat-lobby', pathMatch: 'full' },
      { path: 'chat-lobby', component: ChatLobbyComponent },
      { path: 'top-rooms', component: TopRankedRoomsComponent },
    ],
  }
];
