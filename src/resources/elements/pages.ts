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
    this.refreshPages();
  }

  private async refreshPages(): Promise<void> {
    const pages = await this.userService.fbApi(`/${this.userService.id}/accounts`);

    this.pages = pages.data.map(page => <Page>{
      id: page.id,
      name: page.name,
    });
  }
}
