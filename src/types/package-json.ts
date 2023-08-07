type Author =
  | string
  | {
      name: string;
      email: string;
      url: string;
    };

type Funding =
  | string
  | {
      type: string;
      url: string;
    };

type License =
  | string
  | {
      type: string;
      url: string;
    };

type Bugs =
  | string
  | {
      url?: string;
      email?: string;
    };

type Repository =
  | string
  | {
      type: string;
      url: string;
      directory?: string;
    };

type Maintainer =
  | string
  | {
      email: string;
      name: string;
    };

type PeerDependenciesMeta = {
  optional: boolean;
};

export interface PackageJSON {
  name: string;
  version?: string;
  description?: string;
  keywords?: string[];
  type?: string;
  main?: string;
  browser?: string;
  man?: string | string[];
  homepage?: string;
  typings?: string;
  scripts?: Record<string, string>;
  repository?: Repository;
  author?: Author;
  contributors?: Author[];
  funding?: Funding | Funding[];
  license?: License;
  licenses?: License[];
  bugs?: Bugs;
  files?: string[];
  config?: Record<string, string>;
  bin?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, PeerDependenciesMeta>;
  bundleDependencies?: string[];
  optionalDependencies?: string[];
  dependencies?: Record<string, string>;
  maintainers?: Maintainer[];
  engines?: Record<string, string>;
  os?: string[];
  cpu?: string[];
  private?: boolean;
  workspaces?: string[];
  overrides?: Record<string, any>;
  deprecated?: string;
  [key: string]: string | number | boolean | Object;
}
