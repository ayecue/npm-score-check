import { spawn } from "child_process";
import { NpmView } from "../types/npm-view";

export default function getNpmView(packageName: string): Promise<NpmView> {
  return new Promise((resolve, reject) => {
    let output = '';

    const p = spawn('npm', ['view', '--json', packageName])
      .on('error', reject)
      .on('close', () => resolve(JSON.parse(output)))

    p.stdout.on('data', (data) => output += data.toString());
  });
}