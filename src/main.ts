import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { registerLicense } from '@syncfusion/ej2-base';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Register Syncfusion license (using community license for demo)
// For production, replace with your license key from syncfusion.com
registerLicense('ORg4AjUWIQA/Gnt2VVhiQlFadVlJXGFWfVJpTGpQdk5xdV9DaVZUTWY/P1ZhSXxRd0RiW35fcnVVRmBbVEI=');

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
