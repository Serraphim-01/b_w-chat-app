import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FriendsService {
  private refreshFriendsSource = new BehaviorSubject<boolean>(false);
  refreshFriends$ = this.refreshFriendsSource.asObservable();

  triggerRefreshFriends() {
    this.refreshFriendsSource.next(true);
  }
}
