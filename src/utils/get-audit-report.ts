import { spawn } from 'child_process';

import { AuditReport } from '../types/audit-report';
import createPackageLock from './create-package-lock';

export default function getAuditReport(
  path: string
): Promise<AuditReport['vulnerabilities']> {
  return new Promise((resolve, reject) => {
    let output = '';
    let errout = '';

    const p = spawn('npm', ['audit', '--json'], {
      cwd: path,
      timeout: 150000
    })
      .on('error', reject)
      .on('close', () => {
        if (errout !== '') return reject(new Error(errout));
        resolve(JSON.parse(output).vulnerabilities);
      });

    p.stderr.on('data', (data) => (errout += data.toString()));
    p.stdout.on('data', (data) => (output += data.toString()));
  });
}
