import { autoinject, ComponentAttached, bindable } from 'aurelia-framework';

import { UserService } from '../../services/user-service';
import { Page } from './page';

@autoinject
export class Pages implements ComponentAttached {
  private pages: Page[] = [];
  @bindable private selectedPage: Page | undefined;

  private pageCursorBefore: string | undefined;
  private pageCursorAfter: string | undefined;
  private hasPrevious: boolean = false;
  private hasNext: boolean = false;

  constructor(private userService: UserService) {
    // No-op
  }

  public attached(): void {
    this.refreshPages();
  }

  private select(page: Page) {
    this.selectedPage = page;
  }

  private next() {
    this.refreshPages(undefined, this.pageCursorAfter);
  }

  private previous() {
    this.refreshPages(this.pageCursorBefore, undefined);
  }

  private async refreshPages(before?: string, after?: string): Promise<void> {
    if (!this.userService.isAuthenticated) {
      this.pages = [];
      this.selectedPage = undefined;
      this.hasPrevious = false;
      this.hasNext = false;
      return;
    }

    const pages = await this.userService.fbApi(`/${this.userService.id}/accounts`,
      'id,name,access_token', before, after);

    this.pages = pages.data.map(page => <Page>{
      id: page.id,
      name: page.name,
      access_token: page.access_token,
    });

    if (this.pages.length === 0) {
      this.clear();
      return;
    }

    this.pageCursorBefore = pages.paging.cursors.before;
    this.pageCursorAfter = pages.paging.cursors.after;

    this.hasPrevious = !!pages.paging.previous;
    this.hasNext = !!pages.paging.next;

    if (this.selectedPage) {
      this.selectedPage = this.pages.find(page => page.id === this.selectedPage.id);
    } else {
      this.selectedPage = undefined;
    }
  }

  private clear() {
    this.pageCursorBefore = undefined;
    this.pageCursorAfter = undefined;
    this.selectedPage = undefined;
    this.hasPrevious = false;
    this.hasNext = false;
  }
}
