export interface Evaluation {
  maintenance: {
    releasesFrequency: number;
    commitsFrequency: number;
    openIssues: number;
    issuesDistribution: number;
  };
  popularity: {
    communityInterest: number;
    downloadsCount: number;
    downloadsAcceleration: number;
    dependentsCount: number;
  };
  quality: {
    carefulness: number;
    tests: number;
    health: number;
    branding: number;
  };
}
