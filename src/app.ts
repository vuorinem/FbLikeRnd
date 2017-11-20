import { PLATFORM, autoinject, ComponentAttached } from 'aurelia-framework';

import { UserService } from './services/user-service';

@autoinject
export class App implements ComponentAttached {
  constructor(private userService: UserService) {
    // No-op
  }

  public async attached() {
    await this.userService.initialize();
  }

  private login() {
    this.userService.login();
  }

  private logout() {
    this.userService.logout();
  }
}
