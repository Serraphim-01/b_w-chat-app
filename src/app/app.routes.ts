import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ChatComponent } from './components/chat/chat.component';
import { SignupComponent } from './components/signup/signup.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ChatLobbyComponent } from './components/chat-lobby/chat-lobby.component';
import { TopRankedRoomsComponent } from './components/top-ranked-rooms/top-ranked-rooms.component';
import { AddFriendsComponent } from './components/add-friends/add-friends.component';
import { NavComponent } from './components/nav/nav.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'chat/:roomId', component: ChatComponent },
  { path: 'profile/:userId', component: ProfileComponent },
  {
    path: 'nav',
    component: NavComponent,
    children: [
      // Nested routes under NavComponent
      { path: '', redirectTo: 'chat-lobby', pathMatch: 'full' },
      { path: 'chat-lobby', component: ChatLobbyComponent },
      { path: 'top-rooms', component: TopRankedRoomsComponent },
      { path: 'add-friends', component: AddFriendsComponent },
    ],
  },
];
