import { autoinject } from 'aurelia-framework';
import { bindable, computedFrom } from 'aurelia-framework';

import { UserService } from '../../services/user-service';
import { Page } from './page';
import { Post } from './post';
import { User } from './user';
import { updateNamedExports } from 'typescript';
import { setTimeout } from 'timers';

@autoinject
export class RandomLike {
  @bindable private page: Page | undefined;
  @bindable private post: Post | undefined;

  private total: number | undefined;
  private currentIndex: number | undefined;
  private selectedIndex: number | undefined;
  private isSpinning: boolean = false;

  private wheelStopInterval: number = 1000;

  private winner: User | undefined;

  constructor(private userService: UserService) {
    // No-op
  }

  private getCurrentClass(total: number, count: number, index: number,
    currentIndex?: number, selectedIndex?: number): string {

    if (this.isBetween(index, count, total, selectedIndex)) {
      return 'success';
    } else if (this.isBetween(index, count, total, currentIndex)) {
      return 'primary';
    } else {
      return 'default';
    }
  }

  private isBetween(index: number, count: number, total: number, firstSelected: number): boolean {
    if (index > firstSelected && index < firstSelected + count) {
      return true;
    } else if (total + index < firstSelected + count) {
      return true;
    } else {
      return false;
    }
  }

  private pageChanged() {
    this.clear();
  }

  private postChanged() {
    this.clear();
  }

  private async randomLike() {
    this.clear();

    const response = await this.userService.fbPageApiWithOffset(`${this.post.id}/likes`, this.page.access_token,
      'id', 1);

    this.total = response.summary.total_count;

    this.wheelOf(this.total,
      index => {
        this.currentIndex = index;
      },
      index => {
        this.selectedIndex = index;
        this.loadLike(index);
      });
  }

  private clear() {
    this.total = undefined;
    this.isSpinning = false;
    this.currentIndex = undefined;
    this.selectedIndex = undefined;
    this.winner = undefined;
  }

  private async loadLike(index: number) {
    const response = await this.userService.fbPageApiWithOffset(`${this.post.id}/likes`, this.page.access_token,
      'id,name,link,pic_large', 1, index);

    this.winner = {
      id: response.data[0].id,
      name: response.data[0].name,
      link: response.data[0].link,
      pic_large: response.data[0].pic_large,
    };
  }

  private wheelOf(items: number, moveTo: (index: number) => void, landOn: (index: number) => void) {
    const firstIndex = Math.floor(Math.random() * (items - 1));
    const wheelStartInterval = Math.max(1000 / this.total, 1.1);

    this.turnWheel(items, firstIndex, wheelStartInterval, moveTo, landOn);
  }

  private turnWheel(items: number, currentIndex: number, intervalToNext: number,
    moveTo: (index: number) => void, landOn: (index: number) => void) {

    moveTo(currentIndex);

    if (intervalToNext > this.wheelStopInterval) {
      this.isSpinning = false;
      landOn(currentIndex);
      return;
    }

    this.isSpinning = true;

    setTimeout(() => {
      const nextIndex = currentIndex === items - 1 ? 0 : currentIndex + 1;
      const nextInterval = this.getNextInterval(intervalToNext);
      this.turnWheel(items, nextIndex, nextInterval, moveTo, landOn);
    }, intervalToNext);
  }

  private getNextInterval(currentInterval: number): number {
    return currentInterval ** (1 + (Math.random()  + 3.5) / this.wheelStopInterval);
  }
}
