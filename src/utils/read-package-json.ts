import fs from 'fs/promises';

import Package from '../container/package';

export default async function readPackageJSON(
  path: string
): Promise<Package | null> {
  try {
    const content = await fs.readFile(path, 'utf-8');
    return new Package(JSON.parse(content));
  } catch (err) {
    console.error(`Cannot read package.json in ${path}.`, err);
    return null;
  }
}
