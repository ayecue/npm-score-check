import { Collected } from '../types/collected';
import { Context } from '../types/context';
import github from './github';
import metadata from './metadata';
import npm from './npm';
import source from './source';

export default async function collect(context: Context): Promise<Collected> {
  const [sourceRes, metadataRes, npmRes, githubRes] = await Promise.all([
    source(context),
    metadata(context),
    npm(context),
    github(context)
  ]);

  return {
    source: sourceRes,
    metadata: metadataRes,
    npm: npmRes,
    github: githubRes
  };
}
