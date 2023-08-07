import { PackageJSON } from '../../types/package-json';

export type License = {
  type: string;
  url: string;
};

const parseLicense = (license: PackageJSON['license']): License | null => {
  if (license == null) return null;
  if (typeof license === 'object')
    return { type: license.type ?? '', url: license.url ?? '' };
  return { type: license, url: '' };
};

export const parseLicenses = (
  license: PackageJSON['license'],
  licenses: PackageJSON['licenses'] = []
): License[] => {
  return [parseLicense(license), ...licenses.map(parseLicense)].filter(
    (item) => item !== null
  );
};
