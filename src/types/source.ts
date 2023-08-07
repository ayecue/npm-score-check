import { AuditReport } from "./audit-report";
import { InspectFilesResult } from "./inspect-files-result";
import { OutdatedReport } from "./outdated-report";

export interface Source {
  files: InspectFilesResult;
  badges: string[];
  linters: string[];
  coverage: number | null;
  outdatedDependencies: OutdatedReport;
  vulnerabilities: AuditReport['vulnerabilities'];
}