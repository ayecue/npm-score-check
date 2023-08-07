import { PackageJSON } from '../../types/package-json';

export type Funding = {
  type: string;
  url: string;
};

export const parseFunding = (funding: PackageJSON['funding']): Funding[] => {
  if (funding == null) return [];
  if (typeof funding === 'object') {
    if (Array.isArray(funding)) {
      return funding.map((item) => {
        if (typeof item === 'object')
          return { type: item.type ?? '', url: item.url ?? '' };
        return {
          type: '',
          url: item
        };
      });
    }

    return [{ type: funding.type ?? '', url: funding.url ?? '' }];
  }
  return [{ type: '', url: funding }];
};
