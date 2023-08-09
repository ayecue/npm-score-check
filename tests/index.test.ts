import score, { evaluateNpmRemotePackage } from '../src';
import path from 'path';

describe('npm-score-check', () => {
  test('default score', async () => {
    const result = await score(path.resolve(__dirname, './mocks/express/package.json'), {
      sampleSize: 1
    });

    expect(result.flags).toMatchSnapshot();
    expect(result.evaluation).toMatchSnapshot();
    expect(result.package).toMatchSnapshot();
  });

  test('default evaluateNpmRemotePackage', async () => {
    const result = await evaluateNpmRemotePackage('express');

    expect(result).toMatchSnapshot();
  });
});
