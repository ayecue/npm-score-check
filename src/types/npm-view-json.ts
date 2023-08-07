import { PackageJSON } from './package-json';

type DistSignature = {
  keyid: string;
  sig: string;
};

type Dist = {
  integrity: string;
  shasum: string;
  tarbal: string;
  fileCount: number;
  unpackedSize: number;
  signatures: DistSignature[];
};

type NpmOperationalInternal = {
  host: string;
  tmp: string;
};

type NpmUser =
  | string
  | {
      name: string;
      email: string;
    };

export interface NpmViewJSON extends PackageJSON {
  _id: string;
  _rev: string;
  'dist-tags': {
    latest: string;
    [tag: string]: string;
  };
  versions: string[];
  time: {
    created: string;
    modified: string;
    [version: string]: string;
  };
  readmeFilename: string;
  _cached: boolean;
  _contentLength: number;
  gitHead: string;
  _nodeVersion: string;
  _npmVersion: string;
  dist: Dist;
  _npmUser: NpmUser;
  _npmOperationalInternal: NpmOperationalInternal;
  _hasShrinkwrap: boolean;
  readme?: string;
  users?: Record<string, boolean>;
}
