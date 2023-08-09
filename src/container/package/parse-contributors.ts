import { PackageJSON } from '../../types/package-json';
import { Author, parseAuthor } from './parse-author';

export const parseContributors = (
  contributers: PackageJSON['contributors'] = []
): Author[] => {
  if (typeof contributers === 'string') return [contributers];
  return [...contributers.map(parseAuthor)].filter((item) => item !== null);
};
