export interface InspectFilesResult {
  readmeSize: number;
  testsSize: number;
  hasNpmIgnore?: boolean;
  hasShrinkwrap?: boolean;
  hasChangelog?: boolean;
}