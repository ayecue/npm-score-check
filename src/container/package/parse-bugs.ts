import { PackageJSON } from '../../types/package-json';

export type Bugs = {
  url: string;
  email: string;
};

export const parseBugs = (bugs: PackageJSON['bugs']): Bugs => {
  if (bugs == null) return { url: '', email: '' };
  if (typeof bugs === 'object')
    return { url: bugs.url ?? '', email: bugs.email ?? '' };
  return { url: bugs, email: '' };
};
