import fs from 'fs/promises';

export default async function fileContents(path: string): Promise<string> {
  const buffer = await fs.readFile(path, 'utf-8');
  return buffer.toString();
}
