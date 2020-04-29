import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {AuthGuard} from "./core/guards/auth.guard";

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule), canActivate: [AuthGuard]},
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)},

  { path: 'ricette', loadChildren: () => import('./ricette/ricette.module').then( m => m.RicettePageModule), canActivate: [AuthGuard]},
  { path: 'ricetta/:id', loadChildren: () => import('./ricetta/ricetta.module').then( m => m.RicettaPageModule), canActivate: [AuthGuard]},

  { path: 'schedeproduzione', loadChildren: () => import('./schedeproduzione/schedeproduzione.module').then(m => m.SchedeproduzionePageModule), canActivate: [AuthGuard] },
  { path: 'schedaproduzione/:id', loadChildren: () => import('./schedeproduzione/schedaproduzione.module').then(m => m.SchedaproduzionePageModule), canActivate: [AuthGuard] },

  { path: 'archiviodocumenti', loadChildren: () => import('./archiviodocumenti/archiviodocumenti.module').then( m => m.ArchiviodocumentiPageModule), canActivate: [AuthGuard] },

  { path: 'foodcost', loadChildren: () => import('./foodcost/foodcost.module').then( m => m.FoodcostPageModule), canActivate: [AuthGuard]},

  { path: 'ingredienti', loadChildren: () => import('./ingredienti/ingredienti.module').then( m => m.IngredientiPageModule), canActivate: [AuthGuard] },
  { path: 'ingrediente/:id', loadChildren: () => import('./ingrediente/ingrediente.module').then( m => m.IngredientePageModule), canActivate: [AuthGuard] },

  { path: 'listini', loadChildren: () => import('./listini/listini.module').then( m => m.ListiniPageModule), canActivate: [AuthGuard] },
  { path: 'listino/:id', loadChildren: () => import('./listino/listino.module').then(m => m.ListinoPageModule), canActivate: [AuthGuard] },

  { path: 'menus', loadChildren: () => import('./menus/menus.module').then( m => m.MenusPageModule), canActivate: [AuthGuard] },
  { path: 'menu/:id', loadChildren: () => import('./menu/menu.module').then( m => m.MenuPageModule), canActivate: [AuthGuard] },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
