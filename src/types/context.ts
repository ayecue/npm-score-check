import { NpmView } from "./npm-view";
import { PackageJSON } from "./package-json";

export interface Context {
  package: {
    json: PackageJSON;
    dir: string;
  };
  npm: NpmView;
}