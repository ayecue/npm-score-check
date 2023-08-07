import { get, mapValues } from 'lodash';
import moment from 'moment';
import normalizeValue from 'normalize-value';
import semver from 'semver';

import { Collected } from '../types/collected';

export function evaluateReleasesFrequency(collected: Collected) {
  const releases = collected.metadata.releases;

  if (!releases) {
    return 0;
  }

  const range30 = releases.find(
    (range) => moment.utc(range.to).diff(range.from, 'd') === 30
  );
  const range180 = releases.find(
    (range) => moment.utc(range.to).diff(range.from, 'd') === 180
  );
  const range365 = releases.find(
    (range) => moment.utc(range.to).diff(range.from, 'd') === 365
  );
  const range730 = releases.find(
    (range) => moment.utc(range.to).diff(range.from, 'd') === 730
  );

  if (!range30 || !range180 || !range365 || !range730) {
    throw new Error('Could not find entry in releases');
  }

  const mean30 = range30.count / (30 / 90);
  const mean180 = range180.count / (180 / 90);
  const mean365 = range365.count / (365 / 90);
  const mean730 = range730.count / (730 / 90);

  const quarterMean =
    mean30 * 0.25 + mean180 * 0.45 + mean365 * 0.2 + mean730 * 0.1;

  return normalizeValue(quarterMean, [
    { value: 0, norm: 0 },
    { value: 0.5, norm: 0.5 },
    { value: 1, norm: 0.75 },
    { value: 2, norm: 1 }
  ]);
}

export function evaluateCommitsFrequency(collected: Collected) {
  const commits = collected.github && collected.github.commits;

  if (!commits) {
    return 0;
  }

  const range30 = commits.find(
    (range) => moment.utc(range.to).diff(range.from, 'd') === 30
  );
  const range180 = commits.find(
    (range) => moment.utc(range.to).diff(range.from, 'd') === 180
  );
  const range365 = commits.find(
    (range) => moment.utc(range.to).diff(range.from, 'd') === 365
  );

  if (!range30 || !range180 || !range365) {
    throw new Error('Could not find entry in commits');
  }

  const mean30 = range30.count / (30 / 30);
  const mean180 = range180.count / (180 / 30);
  const mean365 = range365.count / (365 / 30);

  const monthlyMean = mean30 * 0.35 + mean180 * 0.45 + mean365 * 0.2;

  return normalizeValue(monthlyMean, [
    { value: 0, norm: 0 },
    { value: 1, norm: 0.7 },
    { value: 5, norm: 0.9 },
    { value: 10, norm: 1 }
  ]);
}

function evaluateOpenIssues(collected: Collected) {
  const issues = collected.github && collected.github.issues;

  if (!issues) {
    return 0;
  }

  // @ts-ignore
  if (issues.isDisabled) {
    return collected.github.forkOf ? 0.7 : 0.5;
  }

  // @ts-ignore
  if (!issues.count) {
    return 0.7;
  }

  // @ts-ignore
  const openIssuesRatio = issues.openCount / issues.count;

  return normalizeValue(openIssuesRatio, [
    { value: 0.2, norm: 1 },
    { value: 0.5, norm: 0.5 },
    { value: 1, norm: 0 }
  ]);
}

export function evaluateIssuesDistribution(collected) {
  const issues = collected.github && collected.github.issues;

  if (!issues) {
    return 0;
  }

  if (issues.isDisabled) {
    return collected.github.forkOf ? 0.7 : 0.5;
  }

  const ranges = Object.keys(issues.distribution).map(Number);
  const totalCount = ranges.reduce(
    (sum, range) => sum + issues.distribution[range],
    0
  );

  if (!totalCount) {
    return 0.7;
  }

  const weights = ranges.map((range) => {
    const weight = issues.distribution[range] / totalCount;
    const conditioning = normalizeValue(range / 24 / 60 / 60, [
      { value: 29, norm: 1 },
      { value: 365, norm: 5 }
    ]);

    return weight * conditioning;
  });

  const mean =
    ranges.reduce((sum, range, index) => sum + range * weights[index]) /
    (ranges.length || 1);
  const issuesOpenMeanDays = mean / 60 / 60 / 24;

  return normalizeValue(issuesOpenMeanDays, [
    { value: 5, norm: 1 },
    { value: 30, norm: 0.7 },
    { value: 90, norm: 0 }
  ]);
}

export function isPackageFinished(collected) {
  const isStable = semver.gte(collected.metadata.version, '1.0.0', true); // `true` = loose semver
  const isNotDeprecated = !collected.metadata.deprecated;
  const hasFewIssues = get(collected, 'github.issues.openCount', Infinity) < 15;
  const hasREADME =
    !!collected.metadata.readme ||
    get(collected, 'source.files.readmeSize', 0) > 0;
  const hasTests = !!collected.metadata.hasTestScript;
  const isFinished =
    isStable && isNotDeprecated && hasFewIssues && hasREADME && hasTests;

  return isFinished;
}

export default function maintenance(collected: Collected) {
  const evaluation = {
    releasesFrequency: evaluateReleasesFrequency(collected),
    commitsFrequency: evaluateCommitsFrequency(collected),
    openIssues: evaluateOpenIssues(collected),
    issuesDistribution: evaluateIssuesDistribution(collected)
  };

  // If the package is finished, it doesn't require a lot of maintenance
  if (isPackageFinished(collected)) {
    return mapValues(evaluation, (evaluation) => Math.max(evaluation, 0.9));
  }

  return evaluation;
}
