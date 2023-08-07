export type VulnerabilityViaObject = string | {
  source: number;
  name: string;
  dependency: string;
  title: string;
  url: string;
  severity: string;
  cwe: string[],
  cvss: {
      score: number;
      vectorString: string;
  },
  range: string;
}

export interface Vulnerability {
  name: string;
  severity: string;
  isDirect: boolean;
  via: VulnerabilityViaObject[];
  effects: string[];
  range: string;
  nodes: string[];
  fixAvailable: Record<string, string>
}

export interface AuditReport {
  auditReportVersion: string;
  vulnerabilities: Record<string, Vulnerability>;
  metadata: {
    vulnerabilities: {
      info: number;
      low: number;
      moderate: number;
      high: number;
      critical: number;
      total: number;
    },
    dependencies: {
      prod: number;
      dev: number;
      optional: number;
      peer: number;
      peerOptional: number;
      total: number;
    },
  },
}