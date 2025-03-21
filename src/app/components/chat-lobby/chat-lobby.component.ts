import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  increment,
} from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, map, of } from 'rxjs';
import { AvailableRoomsComponent } from './available-rooms/available-rooms.component';
import { UserRoomsComponent } from './user-rooms/user-rooms.component';

interface ChatRoom {
  id?: string;
  name: string;
  description: string;
  roomType: string;
  popularity: number;
  boostedBy: string[];
  createdBy: string;
  roomKey?: string;
}

@Component({
  selector: 'app-chat-lobby',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AvailableRoomsComponent,
    UserRoomsComponent,
  ],
  templateUrl: './chat-lobby.component.html',
  styleUrls: ['./chat-lobby.component.scss'],
})
export class ChatLobbyComponent {
  showUserRooms: boolean = true;

  private firestore: Firestore;
  private router: Router;
  private auth: Auth;

  chatRooms$: Observable<ChatRoom[]>;
  availableRooms$: Observable<ChatRoom[]> = of([]); // Publicly available rooms
  userRooms$: Observable<ChatRoom[]> = of([]); // Rooms created by the current user

  userId: string | null = null;

  constructor() {
    this.firestore = inject(Firestore);
    this.router = inject(Router);
    this.auth = inject(Auth);

    const roomsRef = collection(this.firestore, 'chatRooms');
    this.chatRooms$ = collectionData(roomsRef, { idField: 'id' }) as Observable<
      ChatRoom[]
    >;

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userId = user?.uid ?? '';
        this.filterRooms();
      } else {
        this.userId = null;
      }
    });
  }

  toggleRooms(showUserRooms: boolean) {
    this.showUserRooms = showUserRooms;
  }

  filterRooms() {
    this.availableRooms$ = this.chatRooms$.pipe(
      map((rooms) =>
        rooms.filter(
          (room) => room.roomType === 'General' || room.roomType === 'Private'
        )
      )
    );

    this.userRooms$ = this.chatRooms$.pipe(
      map((rooms) => rooms.filter((room) => room.createdBy === this.userId))
    );
  }

  async enterChatRoom(roomId: string) {
    if (!roomId) return;

    const roomRef = doc(this.firestore, 'chatRooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      console.error('Room not found!');
      return;
    }

    const roomData = roomSnap.data() as ChatRoom;

    if (roomData.roomType === 'Private') {
      const userInputKey = prompt('Enter the Room Key:');
      if (userInputKey !== roomData.roomKey) {
        alert('Incorrect Room Key! Access Denied.');
        return;
      }
    }

    this.router.navigate(['/chat', roomId]);
  }

  async boostRoom(roomId: string) {
    if (!this.userId) {
      console.warn('User must be logged in to boost a room.');
      return;
    }

    const roomRef = doc(this.firestore, 'chatRooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      console.error('Room not found!');
      return;
    }

    const roomData = roomSnap.data() as ChatRoom;

    if (roomData.boostedBy?.includes(this.userId)) {
      console.warn('You have already boosted this room.');
      return;
    }

    await updateDoc(roomRef, {
      popularity: increment(1),
      boostedBy: arrayUnion(this.userId),
    });

    console.log('Room boosted successfully!');
  }
}

// TODO: Private rooms should request a code before user can join
// TODO: Create 2 sections in the Chat-lobby:
// 1. User Chat Rooms: Here the user can see all their chat rooms they have joined
// 2. Other Chat Rooms: Here the user can see other Available chat rooms created by other users.
// TODO: Add a search bar to filter chat rooms
// TODO:
