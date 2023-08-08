import { get, mapValues, mean } from 'lodash';
import flattenObject from 'obj-flatten';
import unflattenObject from 'obj-unflatten';

import { Aggregation } from '../types/aggregation';
import { Evaluation } from '../types/evaluation';

export function calculateAggregation(evaluations: Evaluation[]): Aggregation {
  const shape = flattenObject(evaluations[0] || {});

  const grouped = mapValues(shape, (value, key) =>
    evaluations
      .map((evaluation) => get(evaluation, key))
      .filter((evaluation) => evaluation >= 0)
      .sort((a, b) => a - b)
  );

  const aggregation = mapValues(grouped, (evaluations) => {
    const trimmedLength = Math.round(evaluations.length * 0.01);

    return {
      min: evaluations[0],
      max: evaluations[evaluations.length - 1],
      mean: mean(evaluations),
      truncatedMean: mean(evaluations.slice(trimmedLength, -trimmedLength)),
      median: evaluations[Math.round(evaluations.length / 2)]
    };
  });

  return unflattenObject(aggregation);
}

export default function aggregate() {
  return calculateAggregation([]);
}
