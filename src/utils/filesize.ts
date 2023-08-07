import fs from 'fs/promises';

export default async function fileSize(...filepath: string[]) {
  const items = await Promise.all(filepath.map(async (item) => {
    const stat = await fs.stat(item);
    return stat.isFile() ? stat.size : 0;
  }));

  return items.reduce((sum, item) => {
    return sum + item;
  }, 0)
}