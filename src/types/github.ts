import { IssueStats } from './issues-stats';
import { Release } from './releases';

export interface Github {
  homepage: string;
  forkOf: string;
  starsCount: number;
  forksCount: number;
  subscribersCount: number;
  issues: IssueStats | {
    isDisabled: boolean;
  };
  contributors: {
    username: string;
    commitsCount: number;
  }[];
  commits: Release[];
  statuses: any[];
}
