import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth, signOut, User } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent implements OnInit {
  currentUser: User | null = null;
  showLogoutModal = false; // Controls logout modal visibility

  constructor(private auth: Auth, private router: Router) {}

  ngOnInit() {
    // Listen for authentication state changes
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
    });
  }

  goToProfile() {
    if (this.currentUser) {
      this.router.navigate([`/profile/${this.currentUser.uid}`]);
    }
  }

  openLogoutModal() {
    this.showLogoutModal = true;
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }

  logout() {
    signOut(this.auth)
      .then(() => {
        this.router.navigate(['/login']); // Redirect to login after logout
        this.showLogoutModal = false;
      })
      .catch((error) => {
        console.error('Logout Error:', error);
      });
  }
}

// TODO: add logout ✅
// TODO: add profile ✅
// TODO: Move the Nav to the Bottom of the Page and
//        it should be fixed there ⏳
// TODO: Should hold all the Other Routes ✅
