import { Github } from './github';
import { Metadata } from './metadata';
import { Npm } from './npm';
import { Source } from './source';

export interface Collected {
  source: Source;
  metadata: Metadata;
  npm: Npm;
  github: Github;
}
