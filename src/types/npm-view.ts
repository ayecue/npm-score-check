export interface NpmView {
  _id: string;
  _rev: string;
  name: string;
  "dist-tags": {
    latest: string;
    [tag: string]: string;
  };
  versions: string[],
  time: {
    created: string;
    modified: string;
    [version: string]: string;
  };
  maintainers: string[];
  description: string;
  homepage: string;
  keywords: string[];
  repository: {
    type: string;
    url: string;
  },
  author: string;
  bugs: {
    url: string;
  };
  readmeFilename: string;
  _cached: boolean;
  _contentLength: number;
  version: string;
  engines: Record<string, string>;
  type: string;
  licenses: {
    type: string;
    url: string;
  }[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  bin: Record<string, string>;
  scripts: Record<string, string>;
  directories: Record<string, string>;
  gitHead: string;
  _nodeVersion: string;
  _npmVersion: string;
  dist: {
    integrity: string;
    shasum: string;
    tarbal: string;
    fileCount: number;
    unpackedSize: number;
    signatures: {
      keyid: string;
      sig: string;
    }[];
  };
  _npmUser: string;
  _npmOperationalInternal: {
    host: string;
    tmp: string;
  },
  _hasShrinkwrap: boolean;
}