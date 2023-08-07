import path from 'path';

import { Collected } from '../types/collected';
import { Context } from '../types/context';
import getNpmView from '../utils/get-npm-view';
import readPackageJSON from '../utils/read-package-json';
import metadata from './metadata';
import npm from './npm';
import source from './source';

export default async function collect(packagePath: string): Promise<Collected> {
  const pkg = await readPackageJSON(packagePath);
  const context: Context = {
    package: {
      json: pkg,
      dir: path.dirname(packagePath)
    },
    npm: await getNpmView(pkg.name)
  };
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
