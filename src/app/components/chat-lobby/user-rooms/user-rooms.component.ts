import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

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
  selector: 'app-user-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-rooms.component.html',
  styleUrls: ['./user-rooms.component.scss'],
})
export class UserRoomsComponent {
  private firestore: Firestore = inject(Firestore);

  @Input() userRooms: ChatRoom[] = [];
  @Input() userId: string | null = null;
  @Input() boostRoom!: (roomId: string) => void;
  @Input() enterChatRoom!: (roomId: string) => void;

  // Form properties
  newRoomName = '';
  newRoomDescription = '';
  newRoomType = 'General';
  newRoomKey = '';

  async createRoom() {
    if (!this.newRoomName.trim() || !this.newRoomDescription.trim()) {
      alert('Room name and description are required.');
      return;
    }
    if (!this.userId) {
      alert('You must be logged in to create a room.');
      return;
    }

    try {
      const roomData: ChatRoom = {
        name: this.newRoomName,
        description: this.newRoomDescription,
        roomType: this.newRoomType,
        popularity: 0,
        boostedBy: [],
        createdBy: this.userId ?? '',
      };

      if (this.newRoomType === 'Private') {
        if (!this.newRoomKey.trim()) {
          alert('Please enter a room key for the private room.');
          return;
        }
        roomData.roomKey = this.newRoomKey;
      }

      const roomsRef = collection(this.firestore, 'chatRooms');
      await addDoc(roomsRef, roomData);

      console.log('Room created successfully!');
      alert('Room created successfully!');

      // Reset form
      this.newRoomName = '';
      this.newRoomDescription = '';
      this.newRoomType = 'General';
      this.newRoomKey = '';
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Error creating room. Check the console for details.');
    }
  }
}
