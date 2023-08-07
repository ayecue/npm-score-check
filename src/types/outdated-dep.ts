export interface OutdatedPackage {
  moduleName: string;
  homepage: string;
  regError?: string;
  pkgError?: string;
  latest: string;
  installed: string;
  isInstalled: boolean;
  notInstalled: boolean;
  packageWanted: string;
  packageJson: string;
  notInPackageJson?: boolean;
  devDependency: boolean;
  usedInScripts?: boolean;
  semverValid: string;
  easyUpgrade: boolean;
  bump: string;
  unused: boolean;
}