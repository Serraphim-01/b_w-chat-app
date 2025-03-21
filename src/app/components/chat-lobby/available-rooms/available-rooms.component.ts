import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ChatRoom {
  id?: string;
  name: string;
  description: string;
  roomType: string;
  popularity: number;
  boostedBy: string[];
}

@Component({
  selector: 'app-available-rooms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './available-rooms.component.html',
  styleUrls: ['./available-rooms.component.scss'],
})
export class AvailableRoomsComponent {
  @Input() availableRooms: ChatRoom[] = [];
  @Input() userId: string | null = null;
  @Input() boostRoom!: (roomId: string) => void;
  @Input() enterChatRoom!: (roomId: string) => void;
}
