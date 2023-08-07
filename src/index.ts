import collect from './collect';
import evaluate from './evaluate';
import createContext from './utils/create-context';

export default async function score(target: string) {
  const context = await createContext(target);
  const collected = await collect(context);

  return evaluate(collected);
}
