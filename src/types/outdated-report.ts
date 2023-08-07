export interface OutdatedReport {
  [module: string]: {
    current: string;
    wanted: string;
    latest: string;
    dependent: string;
    location: string;
  }
}