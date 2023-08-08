import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export default function createPackageLock(target: string): Promise<void> {
  if (fs.existsSync(path.resolve(target, 'package-lock.json'))) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const p = spawn('npm', ['i', '--package-lock-only'], {
      cwd: target,
      timeout: 150000
    })
      .on('error', reject)
      .on('close', resolve);
  });
}
