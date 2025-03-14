import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

interface ChatRoom {
  id?: string;
  name: string;
  description: string;
  roomType: string;
}

@Component({
  selector: 'app-chat-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-lobby.component.html',
  styleUrls: ['./chat-lobby.component.scss'],
})
export class ChatLobbyComponent {
  private firestore = inject(Firestore);
  private router = inject(Router);

  chatRooms$: Observable<ChatRoom[]>; // Stores the list of rooms
  newRoomName = '';
  newRoomDescription = '';
  newRoomType = 'General'; // Default Type

  constructor() {
    const roomsRef = collection(this.firestore, 'chatRooms');
    this.chatRooms$ = collectionData(roomsRef, { idField: 'id' }) as Observable<ChatRoom[]>;
  }

  async createRoom() {
    if (!this.newRoomName.trim() || !this.newRoomDescription.trim()) return;

    const roomsRef = collection(this.firestore, 'chatRooms');
    await addDoc(roomsRef, {
      name: this.newRoomName,
      description: this.newRoomDescription,
      roomType: this.newRoomType,
    });

    // Reset form after adding a room
    this.newRoomName = '';
    this.newRoomDescription = '';
  }

  enterChatRoom(roomId: string) {
    if (!roomId) return;
    this.router.navigate(['/chat', roomId]);
  }
}
