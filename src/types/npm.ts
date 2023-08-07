import { Release } from './releases';

export interface Npm {
  downloads: Release[];
  starsCount: number;
}
