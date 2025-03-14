import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from '@angular/fire/auth';

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

  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';

  async signUp() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }

    try {
      await createUserWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );
      
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
