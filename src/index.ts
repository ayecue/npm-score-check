import aggregate from './aggregate';
import collect from './collect';
import evaluate from './evaluate';
import buildScore from './score';
import {
  createContextWithLocalPackage,
  createContextWithRemoteNpm
} from './utils/create-context';

export async function evaluateNpmRemotePackage(name: string) {
  const context = await createContextWithRemoteNpm(name);
  const collected = await collect(context);

  context.dispose();

  const evaluation = await evaluate(collected);

  return evaluation;
}

export default async function score(target: string) {
  const context = await createContextWithLocalPackage(target);
  const collected = await collect(context);

  context.dispose();

  const evaluation = await evaluate(collected);
  const aggregation = aggregate();

  return buildScore(collected, evaluation, aggregation);
}
