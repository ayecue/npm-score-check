import fs from 'fs';
import gitly from 'gitly';
import { mkdirp } from 'mkdirp';
import { tmpdir } from 'node:os';
import path from 'path';

import { Context } from '../types/context';
import getNpmView from '../utils/get-npm-view';
import readPackageJSON from '../utils/read-package-json';
import generateName from './generate-name';

export async function createContextWithRemoteNpm(
  name: string
): Promise<Context> {
  const npmView = await getNpmView(name);
  const tmpDir = path.resolve(tmpdir(), generateName());

  await mkdirp(tmpDir);
  await gitly(npmView.repository.url, tmpDir, {});

  const pkg = await readPackageJSON(path.resolve(tmpDir, 'package.json'));

  return {
    package: {
      json: pkg,
      dir: tmpDir
    },
    npm: await getNpmView(name),
    dispose: () => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  };
}

export async function createContextWithLocalPackage(
  packagePath: string
): Promise<Context> {
  const pkg = await readPackageJSON(packagePath);

  return {
    package: {
      json: pkg,
      dir: path.dirname(packagePath)
    },
    npm: await getNpmView(pkg.name),
    dispose: () => {}
  };
}
