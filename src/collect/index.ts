import path from 'path';

import { Collected } from '../types/collected';
import { Context } from '../types/context';
import metadata from './metadata';
import npm from './npm';
import source from './source';

export default async function collect(context: Context): Promise<Collected> {
  const [sourceRes, metadataRes, npmRes] = await Promise.all([
    source(context),
    metadata(context),
    npm(context)
  ]);

  return {
    source: sourceRes,
    metadata: metadataRes,
    npm: npmRes
  };
}
