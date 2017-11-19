import { PLATFORM, autoinject } from 'aurelia-framework';
import {
  ConfiguresRouter, RouterConfiguration, Router, RoutableComponentActivate, RouteConfig, NavigationInstruction
} from 'aurelia-router';

import { UserService } from './services/user-service';

@autoinject
export class App implements ConfiguresRouter, RoutableComponentActivate {
  constructor(private userService: UserService) {
    // No-op
  }

  public async activate(params: any, routeConfig: RouteConfig, navigationInstruction: NavigationInstruction) {
    await this.userService.initialize();
  }

  public configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      {
        moduleId: PLATFORM.moduleName('views/home'),
        name: 'Home',
        route: '',
      },
    ]);
  }

  private login() {
    this.userService.login();
  }

  private logout() {
    this.userService.logout();
  }
}
