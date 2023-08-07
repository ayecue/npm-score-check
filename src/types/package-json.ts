export interface PackageJSON {
  name: string;
  version: string;
  description?: string;
  main?: string;
  homepage?: string;
  typings?: string;
  scripts?: Record<string, string>,
  repository?: string | {
    type: string;
    url: string;
  },
  author?: string;
  license?: string;
  bugs?: {
    url?: string;
    email?: string;
  },
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  dependencies?: Record<string, string>;
  [key: string]: string | number | boolean | Object
}