import fs from 'fs';
import gitly from 'gitly';
import { mkdirp } from 'mkdirp';
import { tmpdir } from 'node:os';
import path from 'path';

import { Context } from '../types/context';
import getNpmView from '../utils/get-npm-view';
import readPackageJSON from '../utils/read-package-json';
import generateName from './generate-name';
import hostedGitInfo from './hosted-git-info';

export async function createContextWithRemoteNpm(
  name: string
): Promise<Context> {
  const npmView = await getNpmView(name);
  const gitInfo = hostedGitInfo(npmView.repository.url);
  const repository = `${gitInfo.user}/${gitInfo.project}`;
  const tmpDir = path.resolve(tmpdir(), generateName());
  const dispose = () => fs.rmSync(tmpDir, { recursive: true, force: true });

  await mkdirp(tmpDir);
  const [_tmp, outputDir] = await gitly(repository, tmpDir, {});

  if (outputDir === '') {
    dispose();
    throw new Error(`Unable to download git repo for ${name}.`);
  }

  const pkg = await readPackageJSON(path.resolve(outputDir, 'package.json'));

  if (!pkg) {
    dispose();
    throw new Error(`Cannot read package in ${name}.`);
  }

  return {
    package: {
      json: pkg,
      dir: tmpDir
    },
    npm: await getNpmView(name),
    dispose
  };
}

export async function createContextWithLocalPackage(
  packagePath: string
): Promise<Context> {
  const pkg = await readPackageJSON(packagePath);

  if (!pkg) {
    throw new Error(`Cannot read package in ${packagePath}.`);
  }

  return {
    package: {
      json: pkg,
      dir: path.dirname(packagePath)
    },
    npm: await getNpmView(pkg.name),
    dispose: () => {}
  };
}
