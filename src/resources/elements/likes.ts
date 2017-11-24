import { autoinject, ComponentAttached, bindable } from 'aurelia-framework';

import { UserService } from '../../services/user-service';
import { Page } from './page';
import { Post } from './post';
import { Like } from './like';

@autoinject
export class Likes {
  @bindable private selectedPage: Page | undefined;
  @bindable private selectedPost: Post | undefined;
  private likes: Like[] = [];
  private selectedLike: Like | undefined;

  private pageCursorBefore: string | undefined;
  private pageCursorAfter: string | undefined;
  private hasPrevious: boolean = false;
  private hasNext: boolean = false;

  private total: number = 0;

  constructor(private userService: UserService) {
    // No-op
  }

  private selectedPostChanged() {
    this.refreshLikes();
  }

  private select(like: Like) {
    this.selectedLike = like;
  }

  private next() {
    this.refreshLikes(undefined, this.pageCursorAfter);
  }

  private previous() {
    this.refreshLikes(this.pageCursorBefore, undefined);
  }

  private async refreshLikes(before?: string, after?: string): Promise<void> {
    if (!this.selectedPost || !this.selectedPage) {
      this.likes = [];
      this.clear();
      return;
    }

    const likes = await this.userService.fbApi(`/${this.selectedPost.id}/likes`, {
      access_token: this.selectedPage.access_token,
      fields: 'id,name,link',
      limit: 10,
      summary: true,
      before: before,
      after: after,
    });

    this.likes = likes.data.map(like => <Like>{
      id: like.id,
      name: like.name,
      link: like.link,
    });

    if (this.likes.length === 0) {
      this.clear();
      return;
    }

    this.pageCursorBefore = likes.paging.cursors.before;
    this.pageCursorAfter = likes.paging.cursors.after;

    this.hasPrevious = !!likes.paging.previous;
    this.hasNext = !!likes.paging.next;

    this.total = likes.summary.total_count;

    if (this.selectedLike) {
      this.selectedLike = this.likes.find(like => like.id === this.selectedLike.id);
    } else {
      this.selectedLike = undefined;
    }
  }

  private clear() {
    this.pageCursorBefore = undefined;
    this.pageCursorAfter = undefined;
    this.selectedLike = undefined;
    this.hasPrevious = false;
    this.hasNext = false;
    this.total = 0;
  }
}
