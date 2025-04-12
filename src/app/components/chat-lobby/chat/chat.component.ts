import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  collectionData,
  doc,
  getDoc,
  updateDoc,
  increment,
  Timestamp,
} from '@angular/fire/firestore';
import { Auth, signOut, User } from '@angular/fire/auth';
import { Observable, map } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

interface Message {
  id?: string;
  text: string;
  sender: string;
  userId: string;
  timestamp: Date;
  photoURL: string | null;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  messages$: Observable<Message[]> = new Observable();
  newMessage = '';
  userId: string | null = null;
  displayName: string | null = 'Anonymous';
  profilePictureURL: string | null = null;
  roomId: string | null = null;
  roomOwnerId: string | null = null;
  isDirectChat: boolean = false;
  roomName: string = 'Chat Room';

  constructor() {
    // Listen for authentication changes
    this.auth.onAuthStateChanged((user: User | null) => {
      if (user) {
        this.userId = user.uid;
        this.displayName = user.displayName || 'Anonymous';
        this.profilePictureURL = user.photoURL || 'favicon.ico';
        console.log('User authenticated:', this.userId);
      } else {
        console.warn('User not logged in!');
        this.router.navigate(['/login']);
      }
    });

    // Get Room ID from Route and Load Room Data & Messages
    this.route.paramMap.subscribe(async (params) => {
      this.roomId = params.get('roomId');
      if (this.roomId) {
        console.log('Entered chat room:', this.roomId);
        await this.loadRoomData(this.roomId);
        this.loadMessages(this.roomId);
      } else {
        console.error('No room ID found in the URL.');
      }
    });
  }

  // Fetch Room Creator ID
  async loadRoomData(roomId: string) {
    const roomRef = doc(this.firestore, 'chatRooms', roomId);
    const roomSnap = await getDoc(roomRef);
  
    if (roomSnap.exists()) {
      const roomData = roomSnap.data() as { createdBy?: string; type?: string; friendName?: string };
  
      this.roomOwnerId = roomData.createdBy || null;
  
      // Check if it's a direct chat
      this.isDirectChat = roomData.type === 'direct';
      this.roomName = this.isDirectChat ? roomData.friendName || 'Friend Chat' : 'Chat Room';
    }
  }
  

  async increasePopularity() {
    if (!this.roomId) return;
    const roomDoc = doc(this.firestore, `chatRooms/${this.roomId}`);
    await updateDoc(roomDoc, { popularity: increment(1) });
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  async sendMessage() {
    if (!this.userId || !this.roomId) return;
    if (!this.newMessage.trim()) return;

    const messagesRef = collection(this.firestore, 'messages');

    await addDoc(messagesRef, {
      text: this.newMessage,
      sender: this.displayName,
      userId: this.userId,
      timestamp: new Date(),
      photoURL: this.auth.currentUser?.photoURL || null,
      roomId: this.roomId,
    });

    this.newMessage = ''; // Clear input
  }

  loadMessages(roomId: string | null) {
    if (!roomId) return;

    const messagesRef = collection(this.firestore, 'messages');
    const messagesQuery = query(
      messagesRef,
      where('roomId', '==', roomId),
      orderBy('timestamp')
    );

    this.messages$ = collectionData(messagesQuery, { idField: 'id' }).pipe(
      map((messages) =>
        messages.map((msg) => ({
          id: msg['id'],
          text: msg['text'],
          sender: msg['sender'],
          userId: msg['userId'],
          timestamp: (msg['timestamp'] as Timestamp).toDate(),
          photoURL: msg['photoURL'] || 'favicon.ico',
        }))
      )
    );
  }

  async leaveRoom() {
    if (!this.userId || !this.roomId) return;
    if (this.userId === this.roomOwnerId) return; // Prevent owner from leaving

    const roomRef = doc(this.firestore, 'chatRooms', this.roomId);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {
      const roomData = roomSnap.data() as { members?: string[] };
      const members = roomData['members'] || [];

      if (members.includes(this.userId)) {
        const updatedMembers = members.filter(
          (member) => member !== this.userId
        );
        await updateDoc(roomRef, { members: updatedMembers });
        console.log('Left the room successfully.');
      }
    }

    this.router.navigate(['/nav/chat-lobby']);
  }

  goBack() {
    this.router.navigate(['/nav/chat-lobby']);
  }

  goToChatRoom(roomId: string) {
    this.router.navigate(['/chat-room', roomId]);
  }

  goToProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
  }
}
