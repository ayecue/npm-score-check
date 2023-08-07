import detectRepoLinters from 'detect-repo-linters';
import detectRepoTestFiles from 'detect-repo-test-files';
import detectReadmeBadges from 'detect-readme-badges';
import detectRepoChangelog from 'detect-repo-changelog';
import fetchCoverage from 'fetch-coverage';
import isRegularFile from 'is-regular-file';

import { Context } from '../types/context';
import fileSize from '../utils/filesize';
import fileContents from '../utils/file-contents';
import { OutdatedReport } from '../types/outdated-report';
import { InspectFilesResult } from '../types/inspect-files-result';
import { AuditReport } from '../types/audit-report';
import getAuditReport from '../utils/get-audit-report';
import getOutdatedReport from '../utils/get-outdated-report';



export default async function metadata(context: Context) {
  
}