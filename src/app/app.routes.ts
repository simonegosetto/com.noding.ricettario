import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guard';
import { unsavedChangesGuard } from './core/navigation/unsaved-changes.guard';

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
  {
    path: 'ricette',
    title: 'Ricette',
    canActivate: [authGuard],
    loadComponent: () => import('./features/ricette/ricette.page').then((m) => m.RicettePage),
  },
  {
    // 0 = nuova ricetta.
    path: 'ricetta/:id',
    title: 'Ricetta',
    canActivate: [authGuard],
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () => import('./features/ricetta/ricetta.page').then((m) => m.RicettaPage),
  },
  {
    path: 'schedeproduzione',
    title: 'Schede di produzione',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/schedeproduzione/schedeproduzione.page').then(
        (m) => m.SchedeproduzionePage,
      ),
  },
  {
    path: 'schedaproduzione/:id',
    title: 'Scheda di produzione',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/schedeproduzione/schedaproduzione.page').then(
        (m) => m.SchedaproduzionePage,
      ),
  },
  {
    path: 'archiviodocumenti',
    title: 'Archivio documenti',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/archiviodocumenti/archiviodocumenti.page').then(
        (m) => m.ArchiviodocumentiPage,
      ),
  },
  {
    path: 'listini',
    title: 'Listini prezzi',
    canActivate: [authGuard],
    loadComponent: () => import('./features/listini/listini.page').then((m) => m.ListiniPage),
  },
  {
    path: 'listino/:id',
    title: 'Listino',
    canActivate: [authGuard],
    loadComponent: () => import('./features/listino/listino.page').then((m) => m.ListinoPage),
  },
  {
    path: 'menus',
    title: 'Menù',
    canActivate: [authGuard],
    loadComponent: () => import('./features/menus/menus.page').then((m) => m.MenusPage),
  },
  {
    path: 'menu/:id',
    title: 'Menù',
    canActivate: [authGuard],
    loadComponent: () => import('./features/menu/menu.page').then((m) => m.MenuPage),
  },
  {
    path: 'foodcost',
    title: 'Dizionario ingredienti',
    canActivate: [authGuard],
    loadComponent: () => import('./features/foodcost/foodcost.page').then((m) => m.FoodcostPage),
  },
  // Anche /ingredienti e /ingrediente/:id, eliminate, tornano alla home.
  { path: '**', redirectTo: 'home' },
];
