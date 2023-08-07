import { Collected } from '../types/collected';
import maintenance from './maintenance';
import popularity from './popularity';
import quality from './quality';

export default async function evaluate(collected: Collected) {
  return {
    maintenance: maintenance(collected),
    popularity: popularity(collected),
    quality: quality(collected)
  };
}
