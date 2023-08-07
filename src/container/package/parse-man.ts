import { PackageJSON } from '../../types/package-json';

export const parseMan = (man: PackageJSON['man']): string[] => {
  if (man == null) return [];
  if (Array.isArray(man)) return man;
  return [man];
};
