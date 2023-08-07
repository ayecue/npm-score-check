import fs from 'fs/promises';
import path from 'path';
import { PkgConfig } from './types/pkg-config';

export default async function getScore(target: string) {
  const pkgConfig: PkgConfig = {
    packageJSON: JSON.parse(await fs.readFile(target, 'utf-8')),
    packageDir: path.dirname(target)
  };
}