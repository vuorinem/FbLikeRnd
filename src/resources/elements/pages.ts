import { autoinject, ComponentAttached } from 'aurelia-framework';

import { UserService } from '../../services/user-service';
import { Page } from './page';

@autoinject
export class Pages implements ComponentAttached {
  private pages: Page[] = [];

  constructor(private userService: UserService) {
    // No-op
  }

  public attached(): void {
    // TODO: update pages list
  }
}
