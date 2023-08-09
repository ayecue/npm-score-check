import { PackageJSON } from '../../types/package-json';

export type Maintainer = {
  email: string;
  name: string;
};

const parseMaintainer = (
  maintainer: PackageJSON['maintainers'][number]
): Maintainer | null => {
  if (maintainer == null)
    return {
      name: '',
      email: ''
    };
  if (typeof maintainer === 'object')
    return { email: maintainer.email ?? '', name: maintainer.name ?? '' };
  const [name = '', email = ''] = maintainer.split(' ');
  return {
    name,
    email
  };
};

export const parseMaintainers = (
  maintainers: PackageJSON['maintainers'] = []
): Maintainer[] => {
  return [...maintainers.map(parseMaintainer)].filter((item) => item !== null);
};
