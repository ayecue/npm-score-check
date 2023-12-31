import { PackageJSON } from '../types/package-json';
import { Author, parseAuthor } from './package/parse-author';
import { Bugs, parseBugs } from './package/parse-bugs';
import { parseContributors } from './package/parse-contributors';
import { Funding, parseFunding } from './package/parse-funding';
import { License, parseLicenses } from './package/parse-licenses';
import { Maintainer, parseMaintainers } from './package/parse-maintainer';
import { parseMan } from './package/parse-man';
import { parseRepository, Repository } from './package/parse-repository';

export default class Package {
  readonly description: string | null;
  readonly name: string | null;
  readonly version: string | null;
  readonly keywords: string[];
  readonly type: string | null;
  readonly main: string | null;
  readonly man: string[];
  readonly homepage: string | null;
  readonly typings: string | null;
  readonly scripts: Record<string, string>;
  readonly repository: Repository;
  readonly author: Author;
  readonly contributors: Author[];
  readonly funding: Funding[];
  readonly licenses: License[];
  readonly bugs: Bugs;
  readonly files: string[];
  readonly config: Record<string, string>;
  readonly bin: Record<string, string>;
  readonly devDependencies: Record<string, string>;
  readonly peerDependencies: Record<string, string>;
  readonly bundleDependencies: string[];
  readonly optionalDependencies: string[];
  readonly dependencies: Record<string, string>;
  readonly maintainers: Maintainer[];
  readonly engines: Record<string, string>;
  readonly os: string[];
  readonly cpu: string[];
  readonly private: boolean;
  readonly workspaces: string[];
  readonly overrides: Record<string, any>;
  readonly deprecated: string | null;

  constructor(json: PackageJSON) {
    this.description = json.description ?? null;
    this.name = json.name ?? null;
    this.version = json.version ?? null;
    this.keywords = json.keywords ?? [];
    this.type = json.type ?? null;
    this.main = json.main ?? null;
    this.man = parseMan(json.man);
    this.homepage = json.homepage ?? null;
    this.typings = json.typings ?? null;
    this.scripts = json.scripts ?? {};
    this.repository = parseRepository(json.repository);
    this.author = parseAuthor(json.author);
    this.contributors = parseContributors(json.contributors);
    this.funding = parseFunding(json.funding);
    this.licenses = parseLicenses(json.license, json.licenses);
    this.bugs = parseBugs(json.bugs);
    this.files = json.files ?? [];
    this.config = json.config ?? {};
    this.bin = json.bin ?? {};
    this.devDependencies = json.devDependencies ?? {};
    this.peerDependencies = json.peerDependencies ?? {};
    this.bundleDependencies = json.bundleDependencies ?? [];
    this.optionalDependencies = json.optionalDependencies ?? [];
    this.dependencies = json.dependencies ?? {};
    this.maintainers = parseMaintainers(json.maintainers);
    this.engines = json.engines ?? {};
    this.os = json.os ?? [];
    this.cpu = json.cpu ?? [];
    this.private = json.private ?? false;
    this.workspaces = json.workspaces ?? [];
    this.overrides = json.overrides ?? {};
    this.deprecated = json.deprecated ?? null;
  }
}
