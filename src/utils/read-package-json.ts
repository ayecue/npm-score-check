import fs from 'fs/promises';
import { PackageJSON } from '../types/package-json';

export default async function readPackageJSON(path: string): Promise<PackageJSON> {
  const content = await fs.readFile(path, 'utf-8');
  return JSON.parse(content);
}