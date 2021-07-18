import {enableProdMode} from '@angular/core';

enableProdMode();

export { AppServerModule } from './app/app.server.module';
export { renderModule, renderModuleFactory } from '@angular/platform-server';
export {ngExpressEngine} from '@nguniversal/express-engine';
export {provideModuleMap} from '@nguniversal/module-map-ngfactory-loader';
