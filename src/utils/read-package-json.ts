import fs from 'fs/promises';

import Package from '../container/package';

export default async function readPackageJSON(path: string): Promise<Package> {
  const content = await fs.readFile(path, 'utf-8');
  return new Package(JSON.parse(content));
}
