import { spawn } from 'child_process';

import { OutdatedReport } from '../types/outdated-report';

export default function getOutdatedReport(
  path: string
): Promise<OutdatedReport> {
  return new Promise((resolve, reject) => {
    let output = '';
    let errout = '';

    const p = spawn('npm', ['outdated', '--json'], {
      cwd: path
    })
      .on('error', reject)
      .on('close', () => {
        if (errout !== '') return reject(new Error(errout))
        resolve(JSON.parse(output))
      });

    p.stderr.on('data', (data) => (errout += data.toString()));
    p.stdout.on('data', (data) => (output += data.toString()));
  });
}
