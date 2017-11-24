import { autoinject } from 'aurelia-framework';
import { User } from './../resources/elements/user';
import { UserService } from './user-service';

@autoinject
export class LikeService {

  private pageSize: number = 10;

  constructor(private userService: UserService) {
    // No-op
  }

  public async getUsers(postId: string, since: number, until: number, token: string,
    progress: (percentage: number) => void): Promise<User[]> {

    const response = await this.userService.fbApi(`${postId}/likes`, {
      access_token: token,
      since: since,
      until: until,
      summary: true,
      limit: this.pageSize,
      fields: 'id,name,pic_square,pic_large',
    });

    const total: number = response.summary.total_count;
    const users: User[] = [];

    this.appendUsers(users, response.data);

    return this.next(postId, since, until, token, users, response, progress, total);
  }

  public async next(postId: string, since: number, until: number, token: string, users: User[],
    response: any, progress: (percentage: number) => void, total: number): Promise<User[]> {

    progress(users.length / total * 100);

    if (!response.paging || !response.paging.next) {
      return users;
    }

    const nextResponse = await this.appendNext(postId, since, until, response.paging.cursors.after, token, users);

    return this.next(postId, since, until, token, users, nextResponse, progress, total);
  }

  public async appendNext(postId: string, since: number, until: number, after: string, token: string,
    users: User[]): Promise<any> {

    const response = await this.userService.fbApi(`${postId}/likes`, {
      access_token: token,
      since: since,
      until: until,
      after: after,
      limit: this.pageSize,
      fields: 'id,name,pic_square,pic_large',
    });

    this.appendUsers(users, response.data);

    return response;
  }

  private appendUsers(users: User[], data: any[]) {
    data.map(user => {
      users.push({
        id: user.id,
        name: user.name,
        firstName: (user.name as string).split(" ", 2)[0],
        picSquare: user.pic_square,
        picLarge: user.pic_large,
      });
    });
  }

}
