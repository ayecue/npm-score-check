import collect from './collect';
import createContext from './utils/create-context';

export default async function getScore(target: string) {
  const context = await createContext(target);
  const collected = await collect(context);

  return collected;
}
