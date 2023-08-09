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
  const result: License[] = [parseLicense(license)];
  if (typeof licenses === 'object' && Array.isArray(licenses)) {
    result.push(...licenses.map(parseLicense));
  } else {
    result.push(parseLicense(licenses));
  }
  return result.filter((item) => item !== null);
};
