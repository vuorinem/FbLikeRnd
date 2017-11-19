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

  constructor(private userService: UserService) {
    // No-op
  }

  private selectedPostChanged() {
    this.refreshLikes();
  }

  private select(like: Like) {
    this.selectedLike = like;
  }

  private async refreshLikes(): Promise<void> {
    if (!this.selectedPost || !this.selectedPage) {
      this.likes = [];
      this.selectedLike = undefined;
      return;
    }

    const likes = await this.userService.fbPageApi(`/${this.selectedPost.id}/likes`,
      this.selectedPage.access_token);

    this.likes = likes.data.map(like => <Like>{
      id: like.id,
      name: like.name,
    });

    if (this.selectedLike) {
      this.selectedLike = this.likes.find(like => like.id === this.selectedLike.id);
    } else {
      this.selectedLike = undefined;
    }
  }
}
