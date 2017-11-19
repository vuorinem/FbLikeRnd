import { autoinject, ComponentAttached, bindable } from 'aurelia-framework';

import { UserService } from '../../services/user-service';
import { Page } from './page';
import { Post } from './post';

@autoinject
export class Posts {
  @bindable private selectedPage: Page | undefined;
  private posts: Post[] = [];
  @bindable private selectedPost: Post | undefined;

  constructor(private userService: UserService) {
    // No-op
  }

  private selectedPageChanged() {
    this.refreshPosts();
  }

  private select(post: Post) {
    this.selectedPost = post;
  }

  private async refreshPosts(): Promise<void> {
    if (!this.selectedPage) {
      return;
    }

    const posts = await this.userService.fbApi(`/${this.selectedPage.id}/posts`);

    this.posts = posts.data.map(post => <Post>{
      id: post.id,
      message: post.message,
    });
  }
}
