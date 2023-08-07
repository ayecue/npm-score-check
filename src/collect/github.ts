import ghIssuesStats from 'gh-issues-stats';
import { pick, uniqBy } from 'lodash';
import moment from 'moment';
import nodeFetch from 'node-fetch';

import { Context } from '../types/context';
import { GithubActivity } from '../types/github-activity';
import { GithubContributor } from '../types/github-contributor';
import { GithubInfo } from '../types/github-info';
import { GithubStatus } from '../types/github-status';
import { IssueStats } from '../types/issues-stats';
import { Release } from '../types/releases';
import hostedGitInfo from '../utils/hosted-git-info';
import pointsToRanges, {
  bucketsFromBreakpoints
} from '../utils/points-to-ranges';
import { Github } from '../types/github';

export function extractCommits(commitActivity: GithubActivity[]): Release[] {
  const points = commitActivity.map((entry) => ({
    date: moment.unix(entry.week).utc(),
    count: entry.total
  }));
  const ranges = pointsToRanges(
    points,
    bucketsFromBreakpoints([7, 30, 90, 180, 365])
  );

  return ranges.map((range) => ({
    from: range.from,
    to: range.to,
    count: range.points.reduce((sum, point) => sum + point.count, 0)
  }));
}

async function githubRequest<T>(resource: string): Promise<T> {
  const url = `https://api.github.com${resource}`;
  const res = await nodeFetch(url);
  return res.json();
}

export async function fetchIssuesStats(
  repository: string
): Promise<IssueStats> {
  const stats = await ghIssuesStats(repository);

  return {
    count: stats.issues.count + stats.pullRequests.count,
    openCount: stats.issues.openCount + stats.pullRequests.openCount,
    distribution: Object.keys(stats.issues.distribution).reduce(
      (accumulated, range) => {
        accumulated[range] =
          stats.issues.distribution[range] +
          stats.pullRequests.distribution[range];
        return accumulated;
      },
      {}
    )
  };
}

export async function fetchGithubStats(context: Context) {
  const gitInfo = hostedGitInfo(context.package.json.repository.url);
  const repository = `${gitInfo.user}/${gitInfo.project}`;

  const [
    infoRes,
    contributorsRes,
    commitActivityRes,
    statusesRes,
    issuesStatsRes
  ] = await Promise.all([
    githubRequest<GithubInfo>(`/repos/${repository}`),
    githubRequest<GithubContributor[]>(
      `/repos/${repository}/stats/contributors`
    ),
    githubRequest<GithubActivity[]>(
      `/repos/${repository}/stats/commit_activity`
    ),
    githubRequest<GithubStatus[]>(
      `/repos/${repository}/commits/master/statuses`
    ),
    fetchIssuesStats(repository)
  ]);

  return {
    info: infoRes,
    contributors: contributorsRes,
    commitActivity: commitActivityRes,
    issuesStats: issuesStatsRes,
    statuses: statusesRes
  };
}

export default async function github(context: Context): Promise<Github> {
  const props = await fetchGithubStats(context);

  return {
    homepage: props.info.homepage,
    forkOf:
      (props.info.fork && props.info.parent && props.info.parent.full_name) ||
      null,
    starsCount: props.info.stargazers_count,
    forksCount: props.info.forks_count,
    subscribersCount: props.info.subscribers_count,
    issues: Object.assign(props.issuesStats, {
      isDisabled: !props.info.has_issues
    }),
    contributors: Object.values(props.contributors)
      .map((contributor) => {
        const author = contributor.author;
        return (
          author && {
            username: contributor.author.login,
            commitsCount: contributor.total
          }
        );
      })
      .reverse(),

    commits: extractCommits(props.commitActivity),

    statuses: uniqBy(props.statuses, (status) => status.context).map((status) =>
      pick(status, 'context', 'state')
    )
  };
}
