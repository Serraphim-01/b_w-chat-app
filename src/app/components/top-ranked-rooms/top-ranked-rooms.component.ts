import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface ChatRoom {
  id?: string;
  name: string;
  description: string;
  roomType: string;
  popularity: number;
}

@Component({
  selector: 'app-top-ranked-rooms',
  imports: [CommonModule],
  templateUrl: './top-ranked-rooms.component.html',
  styleUrl: './top-ranked-rooms.component.scss'
})
export class TopRankedRoomsComponent {
  private firestore = inject(Firestore);

  topRooms$: Observable<ChatRoom[]>;

  constructor() {
    const roomsRef = collection(this.firestore, 'chatRooms');
    const rankedRoomsQuery = query(roomsRef, orderBy('popularity', 'desc')); 

    this.topRooms$ = collectionData(rankedRoomsQuery, { idField: 'id' }) as Observable<ChatRoom[]>;
  }
}
