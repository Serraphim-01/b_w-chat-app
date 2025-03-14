import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { collectionData } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs'; 

interface User {
  id?: string;
  name: string;
  email: string;
  friends: string[];
  friendRequests: string[];
}

@Component({
  selector: 'app-add-friends',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-friends.component.html',
  styleUrls: ['./add-friends.component.scss'],
})
export class AddFriendsComponent {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  searchTerm = '';
  searchedUser: User | null = null;
  currentUserId: string | null = null;
  friendRequests: User[] = [];

  constructor() {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.fetchPendingRequests();
      }
    });
  }
  

  async searchUser() {
    if (!this.searchTerm.trim()) return;
  
    const usersRef = collection(this.firestore, 'users');
  
    try {
      const userDocs = await firstValueFrom(collectionData(usersRef, { idField: 'id' }));
      this.searchedUser = (userDocs as User[]).find(user => user.email === this.searchTerm) || null;
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  async sendFriendRequest(userId: string) {
    if (!this.currentUserId) return;

    const userRef = doc(this.firestore, 'users', userId);
    await updateDoc(userRef, {
      friendRequests: arrayUnion(this.currentUserId),
    });

    console.log('Friend request sent!');
  }

  async fetchPendingRequests() {
    if (!this.currentUserId) return;

    const userRef = doc(this.firestore, 'users', this.currentUserId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data() as User;
      this.friendRequests = [];

      for (const requestId of userData.friendRequests || []) {
        const requestRef = doc(this.firestore, 'users', requestId);
        const requestSnap = await getDoc(requestRef);

        if (requestSnap.exists()) {
          this.friendRequests.push({ id: requestId, ...(requestSnap.data() as User) });
        }
      }
    }
  }

  async acceptFriendRequest(friendId: string) {
    if (!this.currentUserId) return;

    const currentUserRef = doc(this.firestore, 'users', this.currentUserId);
    const friendRef = doc(this.firestore, 'users', friendId);

    await updateDoc(currentUserRef, {
      friends: arrayUnion(friendId),
      friendRequests: arrayRemove(friendId),
    });

    await updateDoc(friendRef, {
      friends: arrayUnion(this.currentUserId),
    });

    console.log('Friend request accepted!');
    this.fetchPendingRequests();
  }
}
