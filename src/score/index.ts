import { clamp, pick } from 'lodash';
import semver from 'semver';
import weightedMean from 'weighted-mean';

import { Aggregate, Aggregation } from '../types/aggregation';
import { Collected } from '../types/collected';
import { Evaluation } from '../types/evaluation';
import Numerical from '../utils/paper-numerical';

export function calculateScore(
  value: number,
  aggregation: Aggregate,
  avgY: number
) {
  console.log(value, aggregation);
  const normValue = clamp((value - aggregation.min) / aggregation.max, 0, 1);
  const normMean = clamp(
    (aggregation.truncatedMean - aggregation.min) / aggregation.max,
    0,
    1
  );

  const roots = [];

  Numerical.solveCubic(
    1,
    -3 * normMean,
    3 * normMean,
    -1 * normValue,
    roots,
    0,
    1
  );

  const t = roots[0];

  if (t == null) {
    return 0;
  }

  return t ** 3 - 3 * avgY * t ** 2 + 3 * t * avgY;
}

export function scoreQuality(
  quality: Evaluation['quality'],
  aggregate: Aggregation['quality']
) {
  const scores = {
    carefulness: calculateScore(
      quality.carefulness,
      aggregate.carefulness,
      0.8
    ),
    tests: calculateScore(quality.tests, aggregate.tests, 0.7),
    health: calculateScore(quality.health, aggregate.health, 1),
    branding: calculateScore(quality.branding, aggregate.branding, 1)
  };

  return weightedMean([
    [scores.carefulness, 7],
    [scores.tests, 7],
    [scores.health, 4],
    [scores.branding, 2]
  ]);
}

function scorePopularity(
  popularity: Evaluation['popularity'],
  aggregate: Aggregation['popularity']
) {
  const scores = {
    communityInterest: calculateScore(
      popularity.communityInterest,
      aggregate.communityInterest,
      1
    ),
    downloadsCount: calculateScore(
      popularity.downloadsCount,
      aggregate.dependentsCount,
      1
    ),
    downloadsAcceleration: calculateScore(
      popularity.downloadsAcceleration,
      aggregate.downloadsAcceleration,
      1
    )
    // dependentsCount: calculateScore(popularity.dependentsCount, aggregation.dependentsCount, 1),
  };

  return weightedMean([
    [scores.communityInterest, 2],
    [scores.downloadsCount, 2],
    [scores.downloadsAcceleration, 1]
    // [scores.dependentsCount, 2],
  ]);
}

function scoreMaintenance(
  maintenance: Evaluation['maintenance'],
  aggregate: Aggregation['maintenance']
) {
  const scores = {
    releasesFrequency: calculateScore(
      maintenance.releasesFrequency,
      aggregate.releasesFrequency,
      1
    ),
    commitsFrequency: calculateScore(
      maintenance.commitsFrequency,
      aggregate.commitsFrequency,
      1
    ),
    openIssues: calculateScore(maintenance.openIssues, aggregate.openIssues, 1),
    issuesDistribution: calculateScore(
      maintenance.issuesDistribution,
      aggregate.issuesDistribution,
      1
    )
  };

  return weightedMean([
    [scores.releasesFrequency, 2],
    [scores.commitsFrequency, 1],
    [scores.openIssues, 1],
    [scores.issuesDistribution, 2]
  ]);
}

export default function buildScore(
  collected: Collected,
  evaluation: Evaluation,
  aggregation: Aggregation
) {
  const scoreDetail = {
    quality: scoreQuality(evaluation.quality, aggregation.quality),
    popularity: scorePopularity(evaluation.popularity, aggregation.popularity),
    maintenance: scoreMaintenance(
      evaluation.maintenance,
      aggregation.maintenance
    )
  };

  return {
    package: pick(collected.metadata, [
      'name',
      'scope',
      'version',
      'description',
      'keywords',
      'date',
      'links',
      'author',
      'publisher',
      'maintainers'
    ]),
    flags:
      collected.metadata.version === '0.0.0'
        ? null
        : {
            deprecated: collected.metadata.deprecated,
            insecure:
              collected.source && collected.source.vulnerabilities
                ? collected.source.vulnerabilities.length
                : null,
            unstable: semver.lt(collected.metadata.version, '1.0.0', true)
              ? true
              : null
          },
    evaluation,
    score: {
      final:
        scoreDetail.quality * 0.3 +
        scoreDetail.popularity * 0.35 +
        scoreDetail.maintenance * 0.35,
      detail: scoreDetail
    }
  };
}
