import { spawn } from 'child_process';

import NpmView from '../container/npm-view';

export default function getNpmView(packageName: string): Promise<NpmView> {
  return new Promise((resolve, reject) => {
    let output = '';
    let errout = '';

    const p = spawn('npm', ['view', '--json', packageName], {
      timeout: 150000
    })
      .on('error', reject)
      .on('close', () => {
        if (errout !== '') return reject(new Error(errout));
        resolve(new NpmView(JSON.parse(output)));
      });

    p.stderr.on('data', (data) => (errout += data.toString()));
    p.stdout.on('data', (data) => (output += data.toString()));
  });
}
