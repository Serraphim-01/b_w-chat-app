import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from '@angular/fire/auth';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
} from '@angular/fire/storage';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  private auth = inject(Auth);
  private router = inject(Router);
  private storage = inject(Storage);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  dateOfBirth = '';
  profilePictureFile?: File;
  profilePictureUrl = '';
  errorMessage = '';
  successMessage = '';

  async signUp() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );
      const user = userCredential.user;

      // Upload profile picture if provided
      if (this.profilePictureFile) {
        const storageRef = ref(this.storage, `profile_pictures/${user.uid}`);
        await uploadBytes(storageRef, this.profilePictureFile);
        this.profilePictureUrl = await getDownloadURL(storageRef);
      }

      // Update user profile with name and profile picture
      await updateProfile(user, {
        displayName: this.name,
        photoURL: this.profilePictureUrl,
      });

      this.successMessage = 'Account created successfully! Please log in.';
      this.errorMessage = '';

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1000);
    } catch (error: any) {
      this.errorMessage = error.message;
      this.successMessage = '';
    }
  }

  handleFileInput(event: any) {
    const file = event.target.files[0]; 

    if (file) {
      this.profilePictureFile = file; 

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePictureUrl = e.target.result; 
      };
      reader.readAsDataURL(file); 
    } else {
      this.profilePictureFile = undefined;
      this.profilePictureUrl = ''; 
    }
  }

  async signUpWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.errorMessage = 'Google Sign-In failed: ' + error.message;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
