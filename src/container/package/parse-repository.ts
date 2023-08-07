import { PackageJSON } from '../../types/package-json';

export type Repository = {
  type: string;
  url: string;
  directory: string;
};

export const parseRepository = (
  repository: PackageJSON['repository']
): Repository | null => {
  if (repository == null) return null;
  if (typeof repository === 'object')
    return {
      type: repository.type ?? '',
      url: repository.url ?? '',
      directory: repository.directory ?? ''
    };
  return { type: '', url: repository, directory: '' };
};
