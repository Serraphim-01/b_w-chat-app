import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  showModal = false;
  private auth = inject(Auth);
  private router = inject(Router);

  async login() {
    try {
      await signInWithEmailAndPassword(this.auth, this.email, this.password);
      
      this.showModal = true; // Show modal
      setTimeout(() => {
        this.router.navigate(['/chat-lobby']);
      }, 3000); // 3-second delay
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      
      this.showModal = true;
      setTimeout(() => {
        this.router.navigate(['/chat-lobby']);
      }, 3000);
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }
}
