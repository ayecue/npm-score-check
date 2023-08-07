import { get } from 'lodash';
import normalizeValue from 'normalize-value';
import semver from 'semver';

import { Collected } from '../types/collected';
import { Context } from '../types/context';

export function evaluateCarefulness(context: Context, collected: Collected) {
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

export function evaluateTests(context: Context, collected: Collected) {
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
