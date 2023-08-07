import GitHost from 'hosted-git-info';

export default function hostedGitInfo(repositoryUrl: string): GitHost {
  try {
    return GitHost.fromUrl(repositoryUrl);
  } catch (err) {
    console.warn(
      { err },
      `Error while parsing ${repositoryUrl}, returning null..`
    );
  }
}
