import detectRepoLinters from 'detect-repo-linters';
import detectRepoTestFiles from 'detect-repo-test-files';
import detectReadmeBadges from 'detect-readme-badges';
import detectRepoChangelog from 'detect-repo-changelog';
import fetchCoverage from 'fetch-coverage';
import isRegularFile from 'is-regular-file';

import { PkgConfig } from '../types/pkg-config';
import fileSize from '../utils/filesize';
import fileContents from '../utils/file-contents';
import { OutdatedReport } from '../types/outdated-report';
import { InspectFilesResult } from '../types/inspect-files-result';
import { AuditReport } from '../types/audit-report';
import getAuditReport from '../utils/get-audit-report';
import getOutdatedReport from '../utils/get-outdated-report';

export async function inspectFiles(pkgConfig: PkgConfig): Promise<InspectFilesResult> {
  const [
    readmeSize,
    testsSize,
    hasNpmIgnore = null,
    hasShrinkwrap = null,
    hasChangelog
  ] = await Promise.all([
    fileSize(`${pkgConfig.packageDir}/README.md`),
    detectRepoTestFiles(pkgConfig.packageDir).then((files) => fileSize(...files)),
    isRegularFile(`${pkgConfig.packageDir}/.npmignore`),
    isRegularFile(`${pkgConfig.packageDir}/npm-shrinkwrap.json`),
    detectRepoChangelog(pkgConfig.packageDir).then((file) => file ? true : null)
  ]);

  return {
    readmeSize,
    testsSize,
    hasNpmIgnore,
    hasShrinkwrap,
    hasChangelog
  };
}

export async function getReadmeBadges(pkgConfig: PkgConfig): Promise<string[]> {
  const readmeContent = await fileContents(`${pkgConfig.packageDir}/README.md`);
  const badges = await detectReadmeBadges(readmeContent);
  return Array.from(new Set(...badges));
}

export async function getRepoLinters(pkgConfig: PkgConfig): Promise<string[]> {
  const linters = await detectRepoLinters(pkgConfig.packageDir);
  return Array.from(new Set(...linters));
}

export async function fetchCodeCoverage({ packageJSON }: PkgConfig, badges: string[]): Promise<number> {
  const repository = packageJSON.repository;
  const url = typeof repository === 'string' ? repository : repository.url;

  if (!url) {
      return Promise.resolve(0);
  }

  return fetchCoverage(url, {
      badges
  });
}

export async function checkVulnerabilities({ packageDir }: PkgConfig): Promise<AuditReport> {
  return getAuditReport(packageDir);
}

export async function checkOutdatedDeps({ packageDir }: PkgConfig): Promise<OutdatedReport> {
  return getOutdatedReport(packageDir);
}

export default async function source(pkgConfig: PkgConfig) {
  const [
    files,
    badges,
    linters
  ] = await Promise.all([
    inspectFiles(pkgConfig),
    getReadmeBadges(pkgConfig),
    getRepoLinters(pkgConfig)
  ]);
  const [
    coverage,
    outdatedDependencies,
    vulnerabilities
  ] = await Promise.all([
    fetchCodeCoverage(pkgConfig, badges),
    checkOutdatedDeps(pkgConfig),
    checkVulnerabilities(pkgConfig)
  ]);

  return {
    files,
    badges,
    linters,
    coverage,
    outdatedDependencies,
    vulnerabilities
  };
}