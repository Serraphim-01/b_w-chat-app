import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatRoom {
  id?: string;
  name: string;
  description: string;
  roomType: string;
  popularity: number;
  boostedBy: string[];
}

@Component({
  selector: 'app-user-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-rooms.component.html',
  styleUrls: ['./user-rooms.component.scss'],
})
export class UserRoomsComponent {
  @Input() userRooms: ChatRoom[] = [];
  @Input() userId: string | null = null;
  @Input() boostRoom!: (roomId: string) => void;
  @Input() enterChatRoom!: (roomId: string) => void;
  @Input() createRoom!: () => void;

  // ✅ Declare these properties to prevent errors
  newRoomName = '';
  newRoomDescription = '';
  newRoomType = 'General';
  newRoomKey = '';
}
