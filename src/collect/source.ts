import { PkgConfig } from '../types/pkg-config';
import fileSize from '../utils/filesize';
import detectRepoLinters from 'detect-repo-linters';
import detectRepoTestFiles from 'detect-repo-test-files';
import detectReadmeBadges from 'detect-readme-badges';
import detectRepoChangelog from 'detect-repo-changelog';
import fetchCoverage from 'fetch-coverage';
import isRegularFile from 'is-regular-file';
import fileContents from '../utils/file-contents';
import Arborist from '@npmcli/arborist';
import npmCheck from 'npm-check';
import semver from 'semver';
import { OutdatedPackage } from '../types/outdated-dep';
import { VulnerabilityReport } from '../types/vulnerability-report';

async function getTestSize(pkgConfig: PkgConfig): Promise<number> {
  const files = await detectRepoTestFiles(pkgConfig.packageDir);
  return fileSize(...files);
}

async function checkForChangelog(pkgConfig: PkgConfig): Promise<boolean> {
  const file = await detectRepoChangelog(pkgConfig.packageDir);
  return file ? true : null;
}

export interface InspectFilesResult {
  readmeSize: number;
  testsSize: number;
  hasNpmIgnore?: boolean;
  hasShrinkwrap?: boolean;
  hasChangelog?: boolean;
}

export async function inspectFiles(pkgConfig: PkgConfig): Promise<InspectFilesResult> {
  const [
    readmeSize,
    testsSize,
    hasNpmIgnore = null,
    hasShrinkwrap = null,
    hasChangelog
  ] = await Promise.all([
    fileSize(`${pkgConfig.packageDir}/README.md`),
    getTestSize(pkgConfig),
    isRegularFile(`${pkgConfig.packageDir}/.npmignore`),
    isRegularFile(`${pkgConfig.packageDir}/npm-shrinkwrap.json`),
    checkForChangelog(pkgConfig)
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

export async function checkVulnerabilities({ packageDir }: PkgConfig): Promise<VulnerabilityReport> {
  const arb = new Arborist({
    path: packageDir
  });
  const report = await arb.audit();
  return report.toJSON();
}

export async function checkOutdatedDeps({ packageDir }: PkgConfig): Promise<OutdatedPackage[]> {
  const result = await npmCheck({ cwd: packageDir });
  return result.all().packages.filter((item) => semver.lt(item.packageWanted, item.latest));
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