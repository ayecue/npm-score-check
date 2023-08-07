import { PackageJSON } from "./package-json";

export interface PkgConfig {
  packageJSON: PackageJSON;
  packageDir: string;
}