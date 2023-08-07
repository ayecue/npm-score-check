import path from 'path'
import { Context } from '../types/context'
import readPackageJSON from '../utils/read-package-json'
import getNpmView from '../utils/get-npm-view';
import source from './source';

export default async function collect(packagePath: string) {
  const packageJSON = await readPackageJSON(packagePath);
  const context: Context = {
    package: {
      json: packageJSON,
      dir: path.dirname(packagePath)
    },
    npm: await getNpmView(packageJSON.name)
  };

  return {
    source: await source(context)
  };
}