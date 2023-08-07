import { get } from 'lodash';
import normalizeValue from 'normalize-value';
import semver from 'semver';
import URL from 'url';

import { Collected } from '../types/collected';

export function evaluateCarefulness(collected: Collected) {
  const licenseEvaluation = Number(!!collected.metadata.license);
  const readmeEvaluation = normalizeValue(
    get(collected, 'source.files.readmeSize', 0),
    [
      { value: 0, norm: 0 },
      { value: 400, norm: 1 }
    ]
  );
  const lintersEvaluation = Number(!!get(collected, 'source.linters', null));
  const ignoreEvaluation = Number(
    get(collected, 'source.files.hasNpmIgnore') ||
      collected.metadata.hasSelectiveFiles ||
      false
  );
  const changelogEvaluation = Number(
    get(collected, 'source.files.hasChangelog', false)
  );

  const isDeprecated = !!collected.metadata.deprecated;
  const isStable = semver.gte(collected.metadata.version, '1.0.0', true); // `true` = loose semver
  const finalWeightConditioning = isDeprecated ? 0 : !isStable ? 0.5 : 1;

  return (
    (licenseEvaluation * 0.33 +
      readmeEvaluation * 0.38 +
      lintersEvaluation * 0.13 +
      ignoreEvaluation * 0.08 +
      changelogEvaluation * 0.08) *
    finalWeightConditioning
  );
}

export function evaluateTests(collected: Collected) {
  if (!collected.source) {
    return 0;
  }

  const testsEvaluation = normalizeValue(collected.source.files.testsSize, [
    { value: 0, norm: 0 },
    { value: 400, norm: collected.metadata.hasTestScript ? 1 : 0.5 }
  ]);
  const coverageEvaluation = collected.source.coverage || 0;
  const statusEvaluation = (
    (collected.github && collected.github.statuses) ||
    []
  ).reduce((sum, status, index, arr) => {
    switch (status.state) {
      case 'success':
        return sum + 1 / arr.length;
      case 'pending':
        return sum + 0.3 / arr.length;
      case 'error':
      case 'failure':
        return sum;
      default:
        return sum;
    }
  }, 0);

  return (
    testsEvaluation * 0.6 + statusEvaluation * 0.25 + coverageEvaluation * 0.15
  );
}

export function evaluateHealth(collected: Collected) {
  if (!collected.source) {
    return 0;
  }

  const dependencies = collected.metadata.dependencies || {};
  const dependenciesCount = Object.keys(dependencies).length;

  if (!dependenciesCount) {
    return 1;
  }

  // Calculate outdated count
  const outdatedCount = Object.keys(
    collected.source.outdatedDependencies
  ).length;

  // Calculate vulnerabilities count
  const vulnerabilitiesCount = collected.source.vulnerabilities.length;

  // Calculate unlocked count - packages that have loose locking of versions, e.g.: '*' or >= 1.6.0
  // Note that if the package has npm-shrinkwrap.json, then it actually has its versions locked down
  const unlockedCount = collected.source.files.hasShrinkwrap
    ? 0
    : Object.values(dependencies).reduce((count, value) => {
        const range = semver.validRange(value, true);

        return range && !semver.gtr('1000000.0.0', range, true)
          ? count + 1
          : count;
      }, 0);

  const outdatedEvaluation = normalizeValue(outdatedCount, [
    { value: 0, norm: 1 },
    { value: Math.max(2, dependenciesCount / 4), norm: 0 }
  ]);
  const vulnerabilitiesEvaluation = normalizeValue(vulnerabilitiesCount, [
    { value: 0, norm: 1 },
    { value: Math.max(2, dependenciesCount / 4), norm: 0 }
  ]);

  const finalWeightConditioning = !unlockedCount ? 1 : 1 / (unlockedCount + 1);

  return (
    (outdatedEvaluation * 0.5 + vulnerabilitiesEvaluation * 0.5) *
    finalWeightConditioning
  );
}

export function evaluateBranding(collected: Collected) {
  const parsedRepository = URL.parse(
    get(collected.metadata, 'repository.url', '')
  );
  const parsedHomepage = URL.parse(
    get(
      collected.metadata,
      'links.homepage',
      get(collected, 'github.homepage', '')
    )
  );
  const hasCustomHomepage = !!(
    parsedRepository.host &&
    parsedHomepage.host &&
    parsedRepository.host !== parsedHomepage.host
  );
  const badgesCount = get(collected, 'source.badges.length', 0);

  const homepageEvaluation = Number(hasCustomHomepage);
  const badgesEvaluation = normalizeValue(badgesCount, [
    { value: 0, norm: 0 },
    { value: 4, norm: 1 }
  ]);

  return homepageEvaluation * 0.4 + badgesEvaluation * 0.6;
}

export default function quality(collected) {
  return {
    carefulness: evaluateCarefulness(collected),
    tests: evaluateTests(collected),
    health: evaluateHealth(collected),
    branding: evaluateBranding(collected)
  };
}
