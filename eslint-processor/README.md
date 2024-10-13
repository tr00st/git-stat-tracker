# git-stat-tracker - eslint processor

## Usage

Use the eslint JSON formatter (and silent mode if you're running through yarn!)

```
$ yarn --silent eslint -f json -o eslint-report.json
$ npx git-stat-tracker/eslint-processor eslint-report.json
```