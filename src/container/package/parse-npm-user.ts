import { NpmViewJSON } from '../../types/npm-view-json';

export type NpmUser = {
  name: string;
  email: string;
};

export const parseNpmUser = (
  author: NpmViewJSON['_npmUser']
): NpmUser | null => {
  if (author == null) return null;
  if (typeof author === 'object')
    return { name: author.name ?? '', email: author.email ?? '' };
  const [name = '', email = ''] = author.split(' ');
  return {
    name,
    email
  };
};
