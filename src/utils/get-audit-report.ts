import { spawn } from 'child_process';

import { AuditReport } from '../types/audit-report';

export default function getAuditReport(
  path: string
): Promise<AuditReport['vulnerabilities']> {
  return new Promise((resolve, reject) => {
    let output = '';
    let errout = '';

    const p = spawn('npm', ['audit', '--json'], {
      cwd: path
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
