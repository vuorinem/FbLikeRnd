import { PLATFORM } from 'aurelia-framework';
import { ConfiguresRouter, RouterConfiguration, Router } from 'aurelia-router'

export class App implements ConfiguresRouter {
  public configureRouter(config: RouterConfiguration, router: Router): void | Promise<void> | PromiseLike<void> {
    config.map([
      {
        moduleId: PLATFORM.moduleName('views/home'),
        name: 'Home',
        route: '',
      },
    ]);
  }
}
