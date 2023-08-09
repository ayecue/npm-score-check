# npm-score-check

Get the npm score of your package. Cut down version of [npms-analyzer](https://github.com/npms-io/npms-analyzer).

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