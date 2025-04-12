import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from '../../components/profile/profile.component';

@Component({
  selector: 'app-profile-information',
  standalone: true,
  imports: [CommonModule, ProfileComponent],
  templateUrl: './profile-information.component.html',
  styleUrls: ['./profile-information.component.scss'],
})
export class ProfileInformationComponent {
  activeTab: 'profile' | 'friends' = 'profile';

  setTab(tab: 'profile' | 'friends') {
    this.activeTab = tab;
  }
}
