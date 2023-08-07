import path from 'path';

import { Context } from '../types/context';
import getNpmView from '../utils/get-npm-view';
import readPackageJSON from '../utils/read-package-json';

export default async function createContext(packagePath: string): Promise<Context> {
  const pkg = await readPackageJSON(packagePath);

  return {
    package: {
      json: pkg,
      dir: path.dirname(packagePath)
    },
    npm: await getNpmView(pkg.name)
  };
}