import { Metadata } from "./metadata";
import { Source } from "./source";

export interface Collected {
  source: Source;
  metadata: Metadata;
}