import { clamp, pick } from 'lodash';
import semver from 'semver';
import weightedMean from 'weighted-mean';

import collect from './collect';
import evaluate from './evaluate';
import { Collected } from './types/collected';
import { Evaluation } from './types/evaluation';
import createContext from './utils/create-context';
import Numerical from './utils/paper-numerical';

//TODO: rework calculate score since there are no aggregates
export function calculateScore(value: number, avgY: number) {
  const normValue = clamp(value, 0, 1);
  const roots = [];

  Numerical.solveCubic(1, 1, 1, -1 * normValue, roots, 0, 1);

  const t = roots[0];

  if (t == null) {
    return 0;
  }

  return t ** 3 - 3 * avgY * t ** 2 + 3 * t * avgY;
}

export function scoreQuality(quality: Evaluation['quality']) {
  const scores = {
    carefulness: calculateScore(quality.carefulness, 0.8),
    tests: calculateScore(quality.tests, 0.7),
    health: calculateScore(quality.health, 1),
    branding: calculateScore(quality.branding, 1)
  };

  return weightedMean([
    [scores.carefulness, 7],
    [scores.tests, 7],
    [scores.health, 4],
    [scores.branding, 2]
  ]);
}

function scorePopularity(popularity: Evaluation['popularity']) {
  const scores = {
    communityInterest: calculateScore(popularity.communityInterest, 1),
    downloadsCount: calculateScore(popularity.downloadsCount, 1),
    downloadsAcceleration: calculateScore(popularity.downloadsAcceleration, 1)
    // dependentsCount: calculateScore(popularity.dependentsCount, aggregation.dependentsCount, 1),
  };

  return weightedMean([
    [scores.communityInterest, 2],
    [scores.downloadsCount, 2],
    [scores.downloadsAcceleration, 1]
    // [scores.dependentsCount, 2],
  ]);
}

function scoreMaintenance(maintenance: Evaluation['maintenance']) {
  const scores = {
    releasesFrequency: calculateScore(maintenance.releasesFrequency, 1),
    commitsFrequency: calculateScore(maintenance.commitsFrequency, 1),
    openIssues: calculateScore(maintenance.openIssues, 1),
    issuesDistribution: calculateScore(maintenance.issuesDistribution, 1)
  };

  return weightedMean([
    [scores.releasesFrequency, 2],
    [scores.commitsFrequency, 1],
    [scores.openIssues, 1],
    [scores.issuesDistribution, 2]
  ]);
}

export function buildScore(collected: Collected, evaluation: Evaluation) {
  const scoreDetail = {
    quality: scoreQuality(evaluation.quality),
    popularity: scorePopularity(evaluation.popularity),
    maintenance: scoreMaintenance(evaluation.maintenance)
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

export default async function score(target: string) {
  const context = await createContext(target);
  const collected = await collect(context);
  const evaluation = await evaluate(collected);

  return buildScore(collected, evaluation);
}
