import moment from 'moment';
import nodeFetch from 'node-fetch';

import { Context } from '../types/context';
import { Npm } from '../types/npm';
import { Release } from '../types/releases';
import pointsToRanges, {
  bucketsFromBreakpoints
} from '../utils/points-to-ranges';

export async function fetchDownloads(context: Context): Promise<Release[]> {
  const requestRange = {
    from: moment
      .utc()
      .subtract(1, 'd')
      .startOf('day')
      .subtract(365, 'd')
      .format('YYYY-MM-DD'),
    to: moment.utc().subtract(1, 'd').startOf('day').format('YYYY-MM-DD')
  };
  const url = `https://api.npmjs.org/downloads/range/${requestRange.from}:${
    requestRange.to
  }/${encodeURIComponent(context.npm.name)}`;
  const res = await nodeFetch(url);
  const body = await res.json();
  const downloads = body.downloads;
  const points = downloads.map((entry) => ({
    date: moment.utc(entry.day),
    count: entry.downloads
  }));
  const ranges = pointsToRanges(
    points,
    bucketsFromBreakpoints([1, 7, 30, 90, 180, 365])
  );

  return ranges.map((range) => {
    const downloadsCount = range.points.reduce(
      (sum, point) => sum + point.count,
      0
    );

    return {
      from: range.from,
      to: range.to,
      count: downloadsCount
    };
  });
}

export function extractStarsCount(context: Context) {
  return Object.keys(context.npm.users).length;
}

export default async function npm(context: Context): Promise<Npm> {
  return {
    downloads: await fetchDownloads(context),
    starsCount: extractStarsCount(context)
  };
}
