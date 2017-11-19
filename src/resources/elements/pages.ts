import { autoinject, ComponentAttached, bindable } from 'aurelia-framework';

import { UserService } from '../../services/user-service';
import { Page } from './page';

@autoinject
export class Pages implements ComponentAttached {
  private pages: Page[] = [];
  @bindable private selectedPage: Page | undefined;

  constructor(private userService: UserService) {
    // No-op
  }

  public attached(): void {
    this.refreshPages();
  }

  private select(page: Page) {
    this.selectedPage = page;
  }

  private async refreshPages(): Promise<void> {
    if (!this.userService.isAuthenticated) {
      this.pages = [];
      return;
    }

    const pages = await this.userService.fbApi(`/${this.userService.id}/accounts`);

    this.pages = pages.data.map(page => <Page>{
      id: page.id,
      name: page.name,
      access_token: page.access_token,
    });

    if (this.selectedPage) {
      this.selectedPage = this.pages.find(page => page.id === this.selectedPage.id);
    } else {
      this.selectedPage = undefined;
    }
  }
}
