import { spawn } from "child_process";
import { OutdatedReport } from "../types/outdated-report";

export default function getOutdatedReport(path: string): Promise<OutdatedReport> {
  return new Promise((resolve, reject) => {
    let output = '';

    const p = spawn('npm', ['outdated', '--json'], {
      cwd: path
    })
      .on('error', reject)
      .on('close', () => resolve(JSON.parse(output)))

    p.stdout.on('data', (data) => output += data.toString());
  });
}