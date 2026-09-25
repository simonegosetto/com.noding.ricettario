import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guard';

/** Stessi URL della versione legacy (i link salvati continuano a funzionare). */
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'login',
    title: 'Accesso',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    title: 'Home',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
  },
  // Anche /ingredienti e /ingrediente/:id, eliminate, tornano alla home.
  { path: '**', redirectTo: 'home' },
];
