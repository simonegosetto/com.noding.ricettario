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
  withComponentInputBinding,
  withPreloading,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app.routes';
import { readOnlyInterceptor } from './core/api/read-only.interceptor';
import { provideRepositories } from './data/providers';
import { registerAppIcons } from './shared/icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // useSetInputAPI: i componentProps dei modali arrivano ai signal input() tramite setInput().
    provideIonicAngular({ useSetInputAPI: true }),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([readOnlyInterceptor])),
    provideRepositories(),
    provideAppInitializer(registerAppIcons),
  ],
};
