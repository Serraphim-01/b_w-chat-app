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
  updateDoc,
  increment,
  Timestamp,
} from '@angular/fire/firestore';
import { Auth, signOut, User } from '@angular/fire/auth';
import { Observable, map } from 'rxjs';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
} from '@angular/fire/storage';
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
  private storage = inject(Storage);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  messages$: Observable<Message[]> = new Observable();
  newMessage = '';
  userId: string | null = null;
  displayName: string | null = 'Anonymous';
  profilePictureURL: string | null = null;
  roomId: string | null = null;

  constructor() {
    // Listen for authentication changes
    this.auth.onAuthStateChanged((user: User | null) => {
      if (user) {
        this.userId = user.uid;
        this.displayName = user.displayName || 'Anonymous';
        this.profilePictureURL = user.photoURL || 'favicon.ico';
        console.log("User authenticated:", this.userId);
      } else {
        console.warn("User not logged in!");
        this.router.navigate(['/login']);
      }
    });

    // Get Room ID from Route and Load Messages
    this.route.paramMap.subscribe((params) => {
      this.roomId = params.get('roomId');
      if (this.roomId) {
        console.log("Entered chat room:", this.roomId);
        this.loadMessages(this.roomId);
      } else {
        console.error("No room ID found in the URL.");
      }
    });
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

  goToChatRoom(roomId: string) {
    this.router.navigate(['/chat-room', roomId]);
  }

  goToProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
  }
}
