# git-stat-tracker - eslint processor

## Usage

Use the eslint JSON formatter

```
$ npm run --silent eslint -f json -o eslint-report.json
$ npx git-stat-tracker/eslint-processor eslint-report.json
```