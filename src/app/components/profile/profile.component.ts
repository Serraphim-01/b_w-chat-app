import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, updateProfile, User } from '@angular/fire/auth';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  private auth = inject(Auth);
  private storage = inject(Storage);
  private router = inject(Router);

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
        this.photoURL = user.photoURL || this.photoURL;
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

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async uploadProfilePicture() {
    if (!this.selectedFile || !this.user) return;

    const filePath = `profile_pictures/${this.user.uid}`;
    const storageRef = ref(this.storage, filePath);

    try {
      await uploadBytes(storageRef, this.selectedFile);
      const url = await getDownloadURL(storageRef);
      await updateProfile(this.user, { photoURL: url });

      this.photoURL = url;
      this.message = 'Profile picture updated!';
    } catch (error: any) {
      this.message = error.message;
    }
  }
}
