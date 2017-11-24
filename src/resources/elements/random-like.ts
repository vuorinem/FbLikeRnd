import { autoinject } from 'aurelia-framework';
import { bindable, computedFrom } from 'aurelia-framework';

import { LikeService } from './../../services/like-service';
import { Page } from './page';
import { Post } from './post';
import { User } from './user';
import { updateNamedExports } from 'typescript';
import { setTimeout } from 'timers';
import { isNumber, isDate } from 'util';

@autoinject
export class RandomLike {
  @bindable private page: Page | undefined;
  @bindable private post: Post | undefined;

  private startDate: string | undefined;
  private endDate: string | undefined;

  private selectedCount: number = 5;
  private currentFirstIndex: number | undefined;
  private selectedFirstIndex: number | undefined;

  private currentIndex: number | undefined;
  private selectedIndex: number | undefined;

  private isSpinning: boolean = false;

  private wheelStopInterval: number = 1000;

  private users: User[] = [];
  private selectedUsers: User[] = [];
  private winner: User | undefined;

  private loadingProgress: number | undefined;

  @computedFrom('users')
  public get total(): number {
    return this.users.length;
  }

  constructor(private likeService: LikeService) {
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
    if (index >= firstSelected && index < firstSelected + count) {
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

  private async loadLikes() {
    if (this.loadingProgress !== undefined) {
      // Loading already in progress
      return;
    }

    const sinceDate = new Date(this.startDate);
    const untilDate = new Date(this.endDate);

    if (!isDate(sinceDate) || !isDate(untilDate)) {
      return;
    }

    untilDate.setHours(23);
    untilDate.setMinutes(59);
    untilDate.setSeconds(59);

    const since = sinceDate.getTime() / 1000;
    const until = untilDate.getTime() / 1000;

    this.clear();

    this.loadingProgress = 0;

    this.users = await this.likeService.getUsers(this.post.id, since, until, this.page.access_token, progress => {
      this.loadingProgress = progress;
    });

    this.loadingProgress = undefined;
  }

  private randomSelect() {
    if (this.isSpinning) {
      return;
    }

    this.wheelOf(this.total,
      index => {
        this.currentFirstIndex = index;
      },
      index => {
        this.selectedFirstIndex = index;
        this.selectedUsers = this.users.slice(index, index + this.selectedCount);

        const overflowCount = index + this.selectedCount - this.total;

        if (overflowCount > 0) {
          this.selectedUsers.push(...this.users.slice(0, overflowCount));
        }
      });
  }

  private async randomWinner() {
    if (this.isSpinning) {
      return;
    }

    this.wheelOf(this.selectedUsers.length,
      index => {
        this.currentIndex = index;
      },
      index => {
        this.selectedIndex = index;
        this.winner = this.selectedUsers[index];
      });
  }

  private clear() {
    this.users = [];
    this.isSpinning = false;
    this.currentFirstIndex = undefined;
    this.selectedFirstIndex = undefined;
    this.currentIndex = undefined;
    this.selectedIndex = undefined;
    this.selectedUsers = [];
    this.winner = undefined;
  }

  private wheelOf(items: number, moveTo: (index: number) => void, landOn: (index: number) => void) {
    const firstIndex = Math.floor(Math.random() * (items - 1));
    const wheelStartInterval = Math.max(1000 / items, 1.1);

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
    return currentInterval ** (1 + (Math.random() + 3.5) / this.wheelStopInterval);
  }
}

export class IntValueConverter {
  public fromView(value: string): number {
    const parsedValue = parseInt(value);

    if (isNumber(parsedValue)) {
      return Math.round(parsedValue);
    } else {
      return 0;
    }
  }
}
