import randomChars from './random-chars';

export default function generateName() {
  return `tmp-${process.pid}-${randomChars(12)}`;
}
