import detectReadmeBadges from 'detect-readme-badges';
import detectRepoChangelog from 'detect-repo-changelog';
import detectRepoLinters from 'detect-repo-linters';
import detectRepoTestFiles from 'detect-repo-test-files';
import fetchCoverage from 'fetch-coverage';
import isRegularFile from 'is-regular-file';

import { AuditReport } from '../types/audit-report';
import { Context } from '../types/context';
import { InspectFilesResult } from '../types/inspect-files-result';
import { OutdatedReport } from '../types/outdated-report';
import { Source } from '../types/source';
import fileContents from '../utils/file-contents';
import fileSize from '../utils/filesize';
import getAuditReport from '../utils/get-audit-report';
import getOutdatedReport from '../utils/get-outdated-report';

export async function inspectFiles(
  context: Context
): Promise<InspectFilesResult> {
  const [
    readmeSize,
    testsSize,
    hasNpmIgnore = null,
    hasShrinkwrap = null,
    hasChangelog
  ] = await Promise.all([
    fileSize(`${context.package.dir}/${context.npm.readmeFilename}`),
    detectRepoTestFiles(context.package.dir).then((files) =>
      fileSize(...files)
    ),
    isRegularFile(`${context.package.dir}/.npmignore`),
    isRegularFile(`${context.package.dir}/npm-shrinkwrap.json`),
    detectRepoChangelog(context.package.dir).then((file) =>
      file ? true : null
    )
  ]);

  return {
    readmeSize,
    testsSize,
    hasNpmIgnore,
    hasShrinkwrap,
    hasChangelog
  };
}

export async function getReadmeBadges(context: Context): Promise<string[]> {
  const readmeContent = await fileContents(
    `${context.package.dir}/${context.npm.readmeFilename}`
  );
  const badges = await detectReadmeBadges(readmeContent);
  return Array.from(new Set(badges));
}

export async function getRepoLinters(context: Context): Promise<string[]> {
  const linters = await detectRepoLinters(context.package.dir);
  return Array.from(new Set(linters));
}

export async function fetchCodeCoverage(
  context: Context,
  badges: string[]
): Promise<number> {
  const repository = context.package.json.repository;
  const url = typeof repository === 'string' ? repository : repository.url;

  if (!url) {
    return Promise.resolve(0);
  }

  return fetchCoverage(url, {
    badges
  });
}

export async function checkVulnerabilities(
  context: Context
): Promise<AuditReport['vulnerabilities']> {
  return getAuditReport(context.package.dir);
}

export async function checkOutdatedDeps(
  context: Context
): Promise<OutdatedReport> {
  return getOutdatedReport(context.package.dir);
}

export default async function source(context: Context): Promise<Source> {
  const [files, badges, linters] = await Promise.all([
    inspectFiles(context),
    getReadmeBadges(context),
    getRepoLinters(context)
  ]);
  const [coverage, outdatedDependencies, vulnerabilities] = await Promise.all([
    fetchCodeCoverage(context, badges),
    checkOutdatedDeps(context),
    checkVulnerabilities(context)
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
