import { PackageJSON } from '../../types/package-json';

export type Bugs = {
  url: string;
  email: string;
};

export const parseBugs = (bugs: PackageJSON['bugs']): Bugs | null => {
  if (bugs == null) return null;
  if (typeof bugs === 'object')
    return { url: bugs.url ?? '', email: bugs.email ?? '' };
  return { url: bugs, email: '' };
};
