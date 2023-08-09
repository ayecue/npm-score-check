# npm-score-check

Get the npm score of your package. Cut down version of [npms-analyzer](https://github.com/npms-io/npms-analyzer).

The score will not be 1:1 to npm since the amount of evaluation aggregations to compare against won't be the same. But still might be useful to get an idea related to the score value.

# Install

```
npm i npm-score-check
```

# How to use

Expose an environment variable containing a GitHub token:
```bash
export GITHUB_TOKEN="my-token"
```

Run npm-score-check command:
```bash
npm-score-check /my/pack/to/package.json
```