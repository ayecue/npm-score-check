import moment from 'moment';

export type Point = {
  date: moment.Moment;
  version?: string;
  count?: number;
};

export type Bucket = {
  start: moment.Moment;
  end: moment.Moment;
};

export type Range = {
  from: string;
  to: string;
  points: Point[];
};

export default function pointsToRanges(
  points: Point[],
  buckets: Bucket[]
): Range[] {
  return buckets.map((bucket) => {
    const filteredPoints = points.filter((point) =>
      moment.utc(point.date).isBetween(bucket.start, bucket.end, null, '[)')
    );

    return {
      from: moment.utc(bucket.start).toISOString(),
      to: moment.utc(bucket.end).toISOString(),
      points: filteredPoints
    };
  });
}

export function bucketsFromBreakpoints(breakpoints: number[]): Bucket[] {
  const referenceDate = moment.utc().startOf('day');

  return breakpoints.map((breakpoint) => ({
    start: referenceDate.clone().subtract(breakpoint, 'd'),
    end: referenceDate
  }));
}
