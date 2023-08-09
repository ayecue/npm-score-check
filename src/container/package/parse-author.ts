import { PackageJSON } from '../../types/package-json';

export type Author = {
  name: string;
  email: string;
  url: string;
};

export const parseAuthor = (author: PackageJSON['author']): Author => {
  if (author == null)
    return {
      name: '',
      email: '',
      url: ''
    };
  if (typeof author === 'object')
    return {
      name: author.name ?? '',
      email: author.email ?? '',
      url: author.url ?? ''
    };
  const [name = '', email = '', url = ''] = author.split(' ');
  return {
    name,
    email,
    url
  };
};
