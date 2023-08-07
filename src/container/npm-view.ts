import { NpmViewJSON } from '../types/npm-view-json';
import Package from './package';
import { NpmUser, parseNpmUser } from './package/parse-npm-user';

export default class NpmView extends Package {
  readonly _id: string;
  readonly _rev: string;
  readonly distTags: NpmViewJSON['dist-tags'];
  readonly versions: string[];
  readonly time: NpmViewJSON['time'];
  readonly readmeFilename: string;
  readonly _cached: boolean;
  readonly _contentLength: number;
  readonly gitHead: string;
  readonly _nodeVersion: string;
  readonly _npmVersion: string;
  readonly dist: NpmViewJSON['dist'] | null;
  readonly _npmUser: NpmUser | null;
  readonly _npmOperationalInternal:
    | NpmViewJSON['_npmOperationalInternal']
    | null;

  readonly _hasShrinkwrap: boolean;
  readonly readme: string | null;

  constructor(json: NpmViewJSON) {
    super(json);
    this._id = json._id ?? '';
    this._rev = json._rev ?? '';
    this.distTags = json['dist-tags'] ?? {
      latest: '0.0.0'
    };
    this.versions = json.versions ?? [];
    this.time = json.time ?? {
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };
    this.readmeFilename = json.readmeFilename ?? 'README.md';
    this._cached = json._cached ?? false;
    this._contentLength = json._contentLength ?? 0;
    this.gitHead = json.gitHead ?? '';
    this._nodeVersion = json._nodeVersion ?? '';
    this._npmVersion = json._npmVersion ?? '';
    this.dist = json.dist ?? null;
    this._npmUser = parseNpmUser(json._npmUser);
    this._npmOperationalInternal = json._npmOperationalInternal ?? null;
    this._hasShrinkwrap = json._hasShrinkwrap ?? false;
    this.readme = json.readme ?? null;
  }
}
