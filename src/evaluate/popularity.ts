import moment from 'moment';

import { Collected } from '../types/collected';

export function evaluateDownloadsCount(collected: Collected) {
  const downloads = collected.npm && collected.npm.downloads;

  if (!downloads) {
    return 0;
  }

  const index = downloads.findIndex(
    (range) => moment.utc(range.to).diff(range.from, 'd') === 90
  );

  if (index === -1) {
    throw new Error('Could not find entry in downloads');
  }

  const count90 = downloads[index].count;
  const count30 = count90 / 3;

  return count30;
}

export function evaluateDownloadsAcceleration(collected: Collected) {
  const downloads = collected.npm && collected.npm.downloads;

  if (!downloads) {
    return 0;
  }

  const range30 = downloads.find(
    (range) => moment.utc(range.to).diff(range.from, 'd') === 30
  );
  const range90 = downloads.find(
    (range) => moment.utc(range.to).diff(range.from, 'd') === 90
  );
  const range180 = downloads.find(
    (range) => moment.utc(range.to).diff(range.from, 'd') === 180
  );
  const range365 = downloads.find(
    (range) => moment.utc(range.to).diff(range.from, 'd') === 365
  );

  if (!range30 || !range90 || !range180 || !range365) {
    throw new Error('Could not find entry in downloads');
  }

  const mean30 = range30.count / 30;
  const mean90 = range90.count / 90;
  const mean180 = range180.count / 180;
  const mean365 = range365.count / 365;

  return (
    (mean30 - mean90) * 0.25 +
    (mean90 - mean180) * 0.25 +
    (mean180 - mean365) * 0.5
  );
}

export function evaluateCommunityInterest(collected: Collected) {
  const starsCount =
    (collected.github ? collected.github.starsCount : 0) +
    (collected.npm ? collected.npm.starsCount : 0);
  const forksCount = collected.github ? collected.github.forksCount : 0;
  const subscribersCount = collected.github
    ? collected.github.subscribersCount
    : 0;
  const contributorsCount = collected.github
    ? (collected.github.contributors || []).length
    : 0;

  return starsCount + forksCount + subscribersCount + contributorsCount;
}

export default function popularity(collected: Collected) {
  return {
    communityInterest: evaluateCommunityInterest(collected),
    downloadsCount: evaluateDownloadsCount(collected),
    downloadsAcceleration: evaluateDownloadsAcceleration(collected),
    dependentsCount: 0
  };
}
