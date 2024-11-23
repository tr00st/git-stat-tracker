---
sidebar_position: 1
---

# Intro

## What is this?

Half-musing half-useful scripts.

I've been looking for a relatively platform agnostic set of tools for harvesting and storing code metrics during CI
processes. The things I was looking for were:

* Visibility over time
* Failures based on "don't make this worse!" rules for PR reviews
* Supporting multiple languages
* Not tightly linked to any CI provider

...so I sketched together something that would work. It may not ever get finished, but should at least provide some
useful scripts. So far, that includes:

* gst-eslint-processor - a tool for parsing eslint JSON reports and summarising the total number of failures.

## Project Status

This project is in early development. All internal and external APIs and CLIs are subject to massive change with no
warning. Even the project name will probably change. The purpose probably won't, but no guarantees.

## Development

* Install fnm: https://github.com/Schniz/fnm
* Use fnm to grab the Node LTS: `fnm install --lts`, then `fnm use [version]`
* Enable corepack: `corepack enable`
* Install dependencies: `npm install`
* Build: `npm run build`
* Test: `npm run test`

## Release process

```
npm version patch
git push --tags
# Then create a release for the new tag on GitHub
```

## What sort of metrics?

Two general categories are needed - summary metrics and annotations:

* Summary Metrics: Apply to a whole directory or repository. For example, "32 tests ran, 0 failures, 3 skipped" would be stored as three Summary Metrics - test runs, test failures, and test skips.
  * Can often be easily graphed - currently expecting single numbers and percentages - we're primarily looking for a short string/numeric value that can be processed into something that can go onto a chart. Things like passed/failed test numbers, code coverage, lines of code, percentages of particular languages, etc.
  * Should be pretty widely supported on various output formats - they make just as much sense in a CSV file, a structured JSON report, or a quick text summary printed to the console.
  * Easy to compare over time, but can only provide some general trends - "less things broke on this commit than the last one" is less useful than "we fixed these three but broke this one"
* Annotations: Apply to a range of characters on a specific line in a specific file. Things like "you missed a semicolon at the end of line 43 in terribleCode.js".
  * Mainly suitable for in-depth reports. You can arguably summarise them, but actually viewing the data would be a pretty in-depth view with a lot of content.
  * Useful for providing actionable insights like "you caused this specific new problem". This will be a bit more difficult to achieve though, as we'll need to uniquely identify what's new and what'e existing.
  * *Should we provide tools for summarising? Basic things like "count the instances of the annotation types" should be pretty easy to achieve, but most of those numbers are probably exported from the tools we'd get annotations from*
  * *Can we fingerprint these to help identify what's changed between reports? Hashing the content that's annotated, plus any "hashable attributes"? Might want to spec that somewhere, so we don't try and use line numbers as a unique characteristic...*

All metrics will:

* Apply to a specific revision - revision / commit date+time will be used to track metrics over time.

## Components

* Collector - eslint/jest/etc - tool will output a set of metrics (and maybe a report to store)
* Processor - tool that'll take the output of one of the above and normalize them into a set of numbers and/or documents to be stored
    * gst-eslint-processor - Parses eslint JSON output files and produces a set if summarised metrics
* Storer - tool that'll store the metrics/docs against the given commit name. probably sharded/indexed with commit date/repo slug as well? also does the job of collation - collects together various metrics and builds them into a single payload before uploading them.
* Fetcher - tool that'll pull the metrics back out and structure them in a reportable form
* Reporter - tool that'll take the formatted output and show something useful - probably a big ol' "this metric over time" graph
* Comparer - tool that'll fail a build (or just return a useful error) if a given commit has made something worse with what changes it's made

## Structure/function

* Collector/Processor/Storer will run within the CI tool.
* Fetcher will be specific to the tech and metric in question - eg: eslint for js linting, jest for js unit tests, xunit for .NET unit tests.
* Processor will be specific to the fetcher...ish - eg: tool for pulling metric numbers from eslint outputs is pretty specific, but it's probably simple to write something that'll do test metrics for anything that'll output standard JUnit report files.
* Storer should be a write-once job - take name-value metrics and dump them in the write place. Make sure it's idempotent(ish) too - think REST PUT semantics.
* Fetcher/reporter should be once-per-metric/purpose. A generic "code coverage over time" graph, or something like that.
* Comparer will probably need some awareness of the SCM tool in use. Might end up just going with a "have we got all the upstream changes merged in?" as a requirment, fail if that doesn't pass, and fail if there's any new errors. This might be where things get more complicated too. Ideally, we'd want to compare which errors were introduced in which files. Something kinda similar (but executed very differently) to https://github.com/paleite/eslint-plugin-diff. Maybe we could take where new errors/warnings/failures were introduced? Finding a baseline commit and checking for an increase is probably going to be more practical. Maybe a "get a unified+stable list of problems and diff them" approach?

## How should we track "new/impacted issues"?

Options include:

* Count: Just count and see if the number went up
  * Awful but a start.
  * Allows fixing simpler stuff but adding worse stuff.
  * Should probably allow this as a quality gate anyway to start with?
* New: Compare list of issues in the source branch against those in the base branch
  * Will probably need a digest of some sort for uniqueness. Type/Location is probably a good start?
* Impacted: Compare the lines changed in Git to those where issues were annotated
  * Probably not all that useful, but might be useful for a "come on, clean the things you've been looking at..." check
* For any of these, we'll need rules about what counts as "new code" - probably easiest to just demand people merge/rebase the latest commits in?
