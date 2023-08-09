import { calculateAggregation } from './aggregate';
import collect from './collect';
import evaluate from './evaluate';
import buildScore from './score';
import { Evaluation } from './types/evaluation';
import {
  createContextWithLocalPackage,
  createContextWithRemoteNpm
} from './utils/create-context';
import npmSearch, { NpmSearchOptions } from './utils/npm-search';

export async function evaluateNpmRemotePackage(
  name: string
): Promise<Evaluation> {
  const context = await createContextWithRemoteNpm(name);
  const collected = await collect(context);

  context.dispose();

  const evaluation = await evaluate(collected);

  return evaluation;
}

export async function evaluateMultipleNpmRemotePackagesOfQuery(
  search: string,
  options?: NpmSearchOptions
): Promise<Evaluation[]> {
  const names = await npmSearch(search, options);
  const result = await Promise.all(
    names.map(async (name) => {
      try {
        const evaluation = await evaluateNpmRemotePackage(name);
        return evaluation;
      } catch (err) {
        console.error(`Unable to evaluate ${name} due to: ${err.message}`);
        return Promise.resolve(null);
      }
    })
  );

  return result.filter((item) => item !== null);
}

export default async function score(target: string) {
  const context = await createContextWithLocalPackage(target);
  const collected = await collect(context);

  context.dispose();

  const evaluation = await evaluate(collected);
  const [lowEvals, medEvals, highEvals] = await Promise.all([
    evaluateMultipleNpmRemotePackagesOfQuery('express', {
      limit: 5,
      quality: 0.1,
      maintenance: 0,
      popularity: 0
    }),
    evaluateMultipleNpmRemotePackagesOfQuery('express', {
      limit: 5,
      quality: 0.5,
      maintenance: 0,
      popularity: 0
    }),
    evaluateMultipleNpmRemotePackagesOfQuery('express', {
      limit: 5,
      quality: 1,
      maintenance: 0,
      popularity: 0
    })
  ]);
  const aggregation = calculateAggregation([
    ...lowEvals,
    ...medEvals,
    ...highEvals
  ]);

  return buildScore(collected, evaluation, aggregation);
}
