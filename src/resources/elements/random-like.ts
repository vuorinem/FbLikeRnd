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

    const users = await this.likeService.getUsers(this.post.id, since, until, this.page.access_token, progress => {
      this.loadingProgress = progress;
    });

    this.users = users.sort(() => Math.random() < 0.5 ? -1 : 1);

    this.loadingProgress = undefined;
  }

  private randomSelect() {
    if (this.isSpinning) {
      return;
    }

    this.clearSelected();
    this.clearWinner();

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

    this.clearWinner();

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

    this.clearSelected();
    this.clearWinner();
  }

  private clearSelected() {
    this.currentFirstIndex = undefined;
    this.selectedFirstIndex = undefined;
    this.selectedUsers = [];
  }

  private clearWinner() {
    this.currentIndex = undefined;
    this.selectedIndex = undefined;
    this.winner = undefined;
  }

  private wheelOf(items: number, moveTo: (index: number) => void, landOn: (index: number) => void) {
    const firstIndex = 0;
    const wheelStartInterval = Math.max(1000 / items, 1.1);
    const startSlowdownAfter = Math.floor(items * (5 + Math.random()));

    this.turnWheel(items, firstIndex, wheelStartInterval, startSlowdownAfter, moveTo, landOn);
  }

  private turnWheel(items: number, currentIndex: number, intervalToNext: number, startSlowdownAfter: number,
    moveTo: (index: number) => void, landOn: (index: number) => void) {

    moveTo(currentIndex);

    if (intervalToNext > this.wheelStopInterval) {
      this.isSpinning = false;
      landOn(currentIndex);
      return;
    }

    this.isSpinning = true;

    let interval = intervalToNext;
    let skip = 1;
    if (intervalToNext < 30) {
      skip = Math.floor(30 / intervalToNext);
      interval = intervalToNext / skip;
    }

    setTimeout(() => {
      if (!this.isSpinning) {
        // Wheel has been stopped
        return;
      }

      let nextIndex = currentIndex + skip;
      if (nextIndex >= items) {
        nextIndex -= items;
      }

      let nextInterval = intervalToNext;
      let nextStartSlowdownAfter = startSlowdownAfter;
      if (startSlowdownAfter < 0) {
        nextInterval = this.getNextInterval(nextInterval);
      } else {
        nextStartSlowdownAfter = nextStartSlowdownAfter - skip;
      }

      this.turnWheel(items, nextIndex, nextInterval, nextStartSlowdownAfter, moveTo, landOn);
    }, interval);
  }

  private getNextInterval(currentInterval: number): number {
    return currentInterval ** (1 + currentInterval / (Math.random() * 5 + 28) / this.wheelStopInterval);
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
