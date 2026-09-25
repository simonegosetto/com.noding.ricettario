import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  RouteReuseStrategy,
  TitleStrategy,
  withComponentInputBinding,
  withNavigationErrorHandler,
  withPreloading,
} from '@angular/router';
import { IonicRouteStrategy } from '@ionic/angular/ionic-route-strategy';
import { provideIonicAngular } from '@ionic/angular/provide';

import { routes } from './app.routes';
import { readOnlyInterceptor } from './core/api/read-only.interceptor';
import { AppTitleStrategy } from './core/navigation/app-title.strategy';
import { reloadOnChunkError } from './core/navigation/chunk-error';
import { provideRepositories } from './data/providers';
import { registerAppIcons } from './shared/icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // useSetInputAPI: i componentProps dei modali arrivano ai signal input() tramite setInput().
    provideIonicAngular({ useSetInputAPI: true }),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideRouter(
      routes,
      withComponentInputBinding(),
      withPreloading(PreloadAllModules),
      withNavigationErrorHandler(reloadOnChunkError),
    ),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    provideHttpClient(withInterceptors([readOnlyInterceptor])),
    provideRepositories(),
    provideAppInitializer(registerAppIcons),
  ],
};
