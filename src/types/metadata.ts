import Package from '../container/package';
import { Release } from './releases';

export interface Metadata {
  name: string;
  scope: string;
  version: string;
  description: string;
  keywords: string[];
  date: string;
  author: Package['author'];
  publisher: { username: string; email: string } | null;
  maintainers: { username: string; email: string }[];
  contributors: Package['contributors'];
  repository: Package['repository'];
  links: Record<string, string>;
  license: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  bundledDependencies: string[];
  optionalDependencies: string[];
  releases: Release[];
  deprecated: string | null;
  hasTestScript: boolean;
  hasSelectiveFiles: boolean | null;
  readme: string | null;
}
