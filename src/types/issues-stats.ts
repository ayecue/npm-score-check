export interface IssueStats {
  count: number;
  openCount: number;
  distribution: Record<string, number>;
}
