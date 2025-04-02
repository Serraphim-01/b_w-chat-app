import { Component, inject, OnDestroy } from '@angular/core';
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
  deleteDoc,
} from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, Subscription, map, of } from 'rxjs';
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
  members?: string[];
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
export class ChatLobbyComponent implements OnDestroy {
  showUserRooms: boolean = true;

  private firestore: Firestore;
  private router: Router;
  private auth: Auth;

  chatRooms$: Observable<ChatRoom[]>;
  availableRooms$: Observable<ChatRoom[]> = of([]);
  userRooms$: Observable<ChatRoom[]> = of([]);
  private roomsSubscription: Subscription | null = null; // Store subscription

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
        this.userId = user.uid ?? '';
        this.loadRooms();
      } else {
        this.userId = null;
      }
    });
  }

  toggleRooms(showUserRooms: boolean) {
    this.showUserRooms = showUserRooms;
  }

  loadRooms() {
    if (this.roomsSubscription) {
      this.roomsSubscription.unsubscribe(); // Cleanup previous subscription
    }

    this.roomsSubscription = this.chatRooms$.subscribe((rooms) => {
      this.availableRooms$ = of(
        rooms.filter(
          (room) =>
            (room.roomType === 'General' || room.roomType === 'Private') &&
            !room.members?.includes(this.userId ?? '')
        )
      );

      // 🔹 Make sure userRooms$ includes rooms where the user is a member
      this.userRooms$ = of(
        rooms.filter(
          (room) => room.members?.includes(this.userId ?? '') // 🔥 Fix: Now detects joined rooms
        )
      );

      console.log('User Rooms Updated:', this.userRooms$);
    });
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
    const members = roomData.members || [];

    // If the user is already a member of the room, bypass the room key prompt
    if (this.userId && members.includes(this.userId)) {
      this.router.navigate(['/chat', roomId]);
      return; // User is already in the room, so no need to request the room key
    }

    // Handle Private Room Key Prompt
    if (roomData.roomType === 'Private') {
      const userInputKey = prompt('Enter the Room Key:');
      if (userInputKey !== roomData.roomKey) {
        alert('Incorrect Room Key! Access Denied.');
        return;
      }
    }

    // Add User to Room if not already a member
    if (this.userId && !members.includes(this.userId)) {
      await updateDoc(roomRef, { members: [...members, this.userId] });

      // 🔹 Force a fresh fetch after the update
      setTimeout(() => {
        this.loadRooms(); // Ensures `userRooms$` updates with the latest data
      }, 300); // Small delay to allow Firestore to update
    }

    // Navigate to the chat room
    this.router.navigate(['/chat', roomId]);
  }

  async leaveChatRoom(roomId: string) {
    if (!this.userId) return;

    const roomRef = doc(this.firestore, 'chatRooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      console.error('Room not found!');
      return;
    }

    const roomData = roomSnap.data() as ChatRoom;

    // 🔹 Prevent the owner from leaving
    if (roomData.createdBy === this.userId) {
      alert('Owners cannot leave their own room. You can only delete it.');
      return;
    }

    const updatedMembers =
      roomData.members?.filter((id) => id !== this.userId) || [];

    await updateDoc(roomRef, { members: updatedMembers });

    this.loadRooms(); // Refresh available rooms after leaving
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

  async deleteRoom(roomId: string) {
    if (!confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      const roomRef = doc(this.firestore, 'chatRooms', roomId);
      await deleteDoc(roomRef);
      this.loadRooms(); // Refresh rooms after deletion
      console.log('Room deleted successfully!');
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  }

  // Cleanup subscriptions when component is destroyed
  ngOnDestroy(): void {
    if (this.roomsSubscription) {
      this.roomsSubscription.unsubscribe();
    }
  }
}
