import { autoinject, ComponentAttached, bindable } from 'aurelia-framework';

import { UserService } from '../../services/user-service';
import { Page } from './page';
import { Post } from './post';

@autoinject
export class Posts {
  @bindable private selectedPage: Page | undefined;
  private posts: Post[] = [];
  @bindable private selectedPost: Post | undefined;

  private pageCursorBefore: string | undefined;
  private pageCursorAfter: string | undefined;
  private hasPrevious: boolean = false;
  private hasNext: boolean = false;

  constructor(private userService: UserService) {
    // No-op
  }

  private selectedPageChanged() {
    this.refreshPosts();
  }

  private select(post: Post) {
    this.selectedPost = post;
  }

  private next() {
    this.refreshPosts(undefined, this.pageCursorAfter);
  }

  private previous() {
    this.refreshPosts(this.pageCursorBefore, undefined);
  }

  private async refreshPosts(before?: string, after?: string): Promise<void> {
    if (!this.selectedPage) {
      this.posts = [];
      this.clear();
      return;
    }

    const posts = await this.userService.fbPageApi(`/${this.selectedPage.id}/posts`,
      this.selectedPage.access_token, 'id,message', before, after);

    this.posts = posts.data.map(post => <Post>{
      id: post.id,
      message: post.message,
    });

    if (this.posts.length === 0) {
      this.clear();
      return;
    }

    this.pageCursorBefore = posts.paging.cursors.before;
    this.pageCursorAfter = posts.paging.cursors.after;

    this.hasPrevious = !!posts.paging.previous;
    this.hasNext = !!posts.paging.next;

    if (this.selectedPost) {
      this.selectedPost = this.posts.find(post => post.id === this.selectedPost.id);
    } else {
      this.selectedPost = undefined;
    }
  }

  private clear() {
    this.pageCursorBefore = undefined;
    this.pageCursorAfter = undefined;
    this.selectedPost = undefined;
    this.hasPrevious = false;
    this.hasNext = false;
  }
}
