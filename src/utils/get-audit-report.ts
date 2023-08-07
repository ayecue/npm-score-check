import { spawn } from 'child_process';

import { AuditReport } from '../types/audit-report';

export default function getAuditReport(
  path: string
): Promise<AuditReport['vulnerabilities']> {
  return new Promise((resolve, reject) => {
    let output = '';

    const p = spawn('npm', ['audit', '--json'], {
      cwd: path
    })
      .on('error', reject)
      .on('close', () => resolve(JSON.parse(output).vulnerabilities));

    p.stdout.on('data', (data) => (output += data.toString()));
  });
}
