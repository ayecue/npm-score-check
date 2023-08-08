import isLinkWorking from 'is-link-working';
import { pickBy } from 'lodash';
import moment from 'moment';
import spdx from 'spdx';
import spdxCorrect from 'spdx-correct';

import NpmView from '../container/npm-view';
import Package from '../container/package';
import { Author } from '../container/package/parse-author';
import { Context } from '../types/context';
import { Metadata } from '../types/metadata';
import { Release } from '../types/releases';
import hostedGitInfo from '../utils/hosted-git-info';
import pointsToRanges, {
  bucketsFromBreakpoints
} from '../utils/points-to-ranges';

export function extractReleases(context: Context): Release[] {
  const time = context.npm.time || {};
  const points = Object.keys(time).map((version) => ({
    date: moment.utc(time[version]),
    version
  }));
  const ranges = pointsToRanges(
    points,
    bucketsFromBreakpoints([30, 90, 180, 365, 730])
  );

  return ranges.map((range) => ({
    from: range.from,
    to: range.to,
    count: range.points.length
  }));
}

function normalizeLicense(license: string | null) {
  if (typeof license !== 'string' || !license.trim()) {
    return null;
  }

  if (!spdx.valid(license)) {
    const correctedLicense = spdxCorrect(license);

    if (correctedLicense) {
      license = correctedLicense;
    } else {
      license = null;
    }
  }

  return license;
}

export function extractLicense(context: Context): string {
  const licenses = context.package.json.licenses;

  if (licenses.length === 0) {
    return null;
  }

  return licenses
    .map((license) =>
      normalizeLicense(typeof license === 'object' ? license?.type : license)
    )
    .reduce((str, license) => str + (str ? ' OR ' : '') + license, '');
}

export async function extractLinks(
  context: Context
): Promise<Record<string, string>> {
  const repositoryUrl =
    typeof context.package.json.repository === 'object'
      ? context.package.json.repository.url
      : context.package.json.repository;
  const gitInfo = hostedGitInfo(repositoryUrl);

  const links: Record<string, string> = pickBy({
    npm: `https://www.npmjs.com/package/${encodeURIComponent(
      context.package.json.name
    )}`,
    homepage: context.package.json.homepage,
    repository: gitInfo && gitInfo.browse(),
    bugs:
      (context.package.json.bugs && context.package.json.bugs.url) ||
      (gitInfo && gitInfo.bugs())
  });
  const isLinkWorkingCache = { [links.npm]: true };
  const areLinksWorking: Promise<{ key: string; link: string | null }>[] =
    Object.entries(links).map(async ([key, link]) => {
      const normalizedLink = link.split('#')[0];

      if (!isLinkWorkingCache[normalizedLink]) {
        const isWorking = await isLinkWorking(normalizedLink, {
          timeout: 5000,
          retries: 0
        });
        return isWorking ? { key, link } : { key, link: null };
      }

      return isLinkWorkingCache[normalizedLink]
        ? { key, link }
        : { key, link: null };
    });
  const finalLinks = (await Promise.all(areLinksWorking)).reduce<
    Record<string, string>
  >((result, item) => {
    return {
      ...result,
      [item.key]: item.link
    };
  }, {});

  if (!finalLinks.homepage && finalLinks.repository) {
    finalLinks.homepage = gitInfo.docs();
  }

  return pickBy(finalLinks);
}

export function extractAuthor(
  context: Context,
  maintainers: NpmView['maintainers'] | Package['maintainers']
): Author {
  if (!context.package.json.author) {
    return null;
  }

  const author = Object.assign({}, context.package.json.author);
  const maintainer =
    maintainers &&
    maintainers.find(
      (maintainer) => maintainer.email === context.package.json.author.email
    );

  if (maintainer) {
    author.name = maintainer.name;
  }

  return author;
}

export function extractPublisher(
  context: Context,
  maintainers: NpmView['maintainers'] | Package['maintainers']
): { username: string; email: string } | null {
  let npmUser = context.npm._npmUser;

  if (!npmUser && maintainers) {
    npmUser =
      context.package.json.author &&
      maintainers.find(
        (maintainer) => maintainer.email === context.package.json.author.email
      );
    npmUser = npmUser || maintainers[0];
  }

  return npmUser ? { username: npmUser.name, email: npmUser.email } : null;
}

export function extractScope(context: Context) {
  const match = context.package.json.name.match(/^@([^/]+)\/.+$/);

  return match ? match[1] : 'unscoped';
}

function extractMaintainers(
  context: Context
): NpmView['maintainers'] | Package['maintainers'] {
  if (
    Array.isArray(context.npm.maintainers) &&
    context.npm.maintainers.length
  ) {
    return context.npm.maintainers;
  }

  if (
    Array.isArray(context.package.json.maintainers) &&
    context.package.json.maintainers.length
  ) {
    return context.package.json.maintainers;
  }

  return null;
}

export default async function metadata(context: Context): Promise<Metadata> {
  const links = await extractLinks(context);
  const maintainers = extractMaintainers(context);

  return {
    name: context.package.json.name,
    scope: extractScope(context),
    version: context.package.json.version,
    description: context.package.json.description,
    keywords: context.package.json.keywords,
    date:
      context.npm.time &&
      (context.npm.time[context.package.json.version] ||
        context.npm.time.modified),
    author: extractAuthor(context, maintainers),
    publisher: extractPublisher(context, maintainers),
    maintainers:
      maintainers &&
      maintainers.map((maintainer) => ({
        username: maintainer.name,
        email: maintainer.email
      })),
    contributors: context.package.json.contributors,
    repository: context.package.json.repository,
    links,
    license: extractLicense(context),
    dependencies: context.package.json.dependencies,
    devDependencies: context.package.json.devDependencies,
    peerDependencies: context.package.json.peerDependencies,
    bundledDependencies: context.package.json.bundleDependencies,
    optionalDependencies: context.package.json.optionalDependencies,
    releases: extractReleases(context),
    deprecated:
      typeof context.package.json.deprecated === 'string'
        ? context.package.json.deprecated
        : null,
    hasTestScript:
      (context.package.json.scripts.test ?? 'no test specified').indexOf(
        'no test specified'
      ) === -1
        ? true
        : null,
    hasSelectiveFiles:
      Array.isArray(context.package.json.files) &&
      context.package.json.files.length > 0
        ? true
        : null,
    readme:
      typeof context.npm.readme === 'string' && context.npm.readme
        ? context.npm.readme
        : null
  };
}
