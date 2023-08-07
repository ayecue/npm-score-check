import NpmView from '../container/npm-view';
import Package from '../container/package';

export interface Context {
  package: {
    json: Package;
    dir: string;
  };
  npm: NpmView;
}
