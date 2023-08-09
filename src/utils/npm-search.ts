import { json } from 'npm-registry-fetch';

export interface NpmSearchOptions {
  limit?: number;
  quality?: number;
  popularity?: number;
  maintenance?: number;
  from?: number;
}

export default async function npmSearch(
  text: string,
  {
    limit = 20,
    quality = 0.65,
    popularity = 0.98,
    maintenance = 0.5,
    from = 0
  }: NpmSearchOptions = {}
): Promise<string[]> {
  const result = await json('/-/v1/search', {
    detailed: false,
    limit,
    quality,
    popularity,
    maintenance,
    from,
    query: {
      text,
      size: limit,
      from,
      quality,
      popularity,
      maintenance
    }
  });

  return result.objects.map((item) => item.package.name);
}
