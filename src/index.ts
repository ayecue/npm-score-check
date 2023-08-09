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
        console.error(`Unable to evaluate ${name} due to:`, err);
        return Promise.resolve(null);
      }
    })
  );

  return result.filter((item) => item !== null);
}

export interface ScoreOptions {
  keywords?: string[];
  sampleSize?: number;
  maxKeywords?: number;
}

export default async function score(
  target: string,
  { keywords = null, sampleSize = 5, maxKeywords = 3 }: ScoreOptions = {}
) {
  const context = await createContextWithLocalPackage(target);
  const collected = await collect(context);

  context.dispose();

  const evaluation = await evaluate(collected);
  const potentialKeywords = keywords ?? collected.metadata.keywords ?? ['cli'];
  const finalKeywords: string[] = [];

  for (
    let index = 0;
    index < maxKeywords && potentialKeywords.length > 0;
    index++
  ) {
    const selectedIndex = Math.floor(
      Math.random() * (potentialKeywords.length - 1)
    );
    const item = potentialKeywords[selectedIndex];
    potentialKeywords.splice(selectedIndex, 1);
    finalKeywords.push(item);
  }

  const evaluations = [];

  for (const item of finalKeywords) {
    const searchText = `keywords:${item}`;
    const [m, p, q] = await Promise.all([
      evaluateMultipleNpmRemotePackagesOfQuery(searchText, {
        limit: sampleSize,
        quality: 0,
        maintenance: 1,
        popularity: 0
      }),
      evaluateMultipleNpmRemotePackagesOfQuery(searchText, {
        limit: sampleSize,
        quality: 0,
        maintenance: 0,
        popularity: 1
      }),
      evaluateMultipleNpmRemotePackagesOfQuery(searchText, {
        limit: sampleSize,
        quality: 1,
        maintenance: 0,
        popularity: 0
      })
    ]);
    evaluations.push(...m, ...p, ...q);
  }
  const aggregation = calculateAggregation(evaluations);

  return buildScore(collected, evaluation, aggregation);
}
