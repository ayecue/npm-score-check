export type Aggregate = {
  min: number;
  max: number;
  mean: number;
  truncatedMean: number;
  median: number;
};

export interface Aggregation {
  maintenance: {
    releasesFrequency: Aggregate;
    commitsFrequency: Aggregate;
    openIssues: Aggregate;
    issuesDistribution: Aggregate;
  };
  popularity: {
    communityInterest: Aggregate;
    downloadsCount: Aggregate;
    downloadsAcceleration: Aggregate;
    dependentsCount: Aggregate;
  };
  quality: {
    carefulness: Aggregate;
    tests: Aggregate;
    health: Aggregate;
    branding: Aggregate;
  };
}
