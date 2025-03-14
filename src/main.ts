import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { environment } from './environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';
import { provideStorage, getStorage } from '@angular/fire/storage'; 
import { routes } from './app/app.routes';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

bootstrapApplication(AppComponent, {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),  
    provideAuth(() => getAuth()),
    provideRouter(routes),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ],
});
