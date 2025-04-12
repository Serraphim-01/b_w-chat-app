import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, updateProfile, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Location } from '@angular/common'; // Import Location service

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  private auth = inject(Auth);
  private router = inject(Router);
  private location = inject(Location); // Inject Location service

  user: User | null = null;
  displayName = '';
  photoURL = 'assets/default-avatar.png';
  selectedFile: File | null = null;
  message = '';

  constructor() {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.user = user;
        this.displayName = user.displayName || '';
      } else {
        this.router.navigate(['/login']); // Redirect if not logged in
      }
    });
  }

  async updateProfile() {
    if (!this.user) return;

    try {
      await updateProfile(this.user, { displayName: this.displayName });
      this.message = 'Profile updated successfully!';
    } catch (error: any) {
      this.message = error.message;
    }
  }

  goBack() {
    this.location.back(); // Navigate back to the previous page
  }
}


// TODO: Connect the date of birth, profile picture, email, name.
// TODO: Add a way to change the password
// TODO: Add icons beside editable fields
// TODO: Add a way to delete account
// TODO: Add a way to logout
// TODO: ...
