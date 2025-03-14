import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  Firestore, 
  collection, 
  addDoc, 
  collectionData, 
  doc, 
  getDoc,
  updateDoc, 
  arrayUnion,
  increment 
} from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth'; 
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

interface ChatRoom {
  id?: string;
  name: string;
  description: string;
  roomType: string;
  popularity: number;
  boostedBy: string[];
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
  private auth = inject(Auth);


  chatRooms$: Observable<ChatRoom[]>; 
  newRoomName = '';
  newRoomDescription = '';
  newRoomType = 'General';
  userId: string | null = null;

  constructor() {
    const roomsRef = collection(this.firestore, 'chatRooms');
    this.chatRooms$ = collectionData(roomsRef, { idField: 'id' }) as Observable<ChatRoom[]>;

     onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userId = user.uid; 
      } else {
        this.userId = null; 
      }
    });
  }

  async createRoom() {
    if (!this.newRoomName.trim() || !this.newRoomDescription.trim()) return;

    const roomsRef = collection(this.firestore, 'chatRooms');
    await addDoc(roomsRef, {
      name: this.newRoomName,
      description: this.newRoomDescription,
      roomType: this.newRoomType,
      popularity: 0, 
    });

    // Reset form after adding a room
    this.newRoomName = '';
    this.newRoomDescription = '';
  }

  enterChatRoom(roomId: string) {
    if (!roomId) return;
    this.router.navigate(['/chat', roomId]);
  }

  // async increasePopularity(roomId: string) {
  //  const roomDoc = doc(this.firestore, `chatRooms/${roomId}`);
  //  await updateDoc(roomDoc, { popularity: increment(5000) });
  //}

  async boostRoom(roomId: string) {
    if (!this.userId) {
      console.warn("User must be logged in to boost a room.");
      return;
    }

    const roomRef = doc(this.firestore, 'chatRooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      console.error("Room not found!");
      return;
    }

    const roomData = roomSnap.data() as ChatRoom;

    if (roomData.boostedBy?.includes(this.userId)) {
      console.warn("You have already boosted this room.");
      return;
    }

    await updateDoc(roomRef, {
      popularity: increment(1),
      boostedBy: arrayUnion(this.userId),
    });

    console.log("Room boosted successfully!");
  }

}
