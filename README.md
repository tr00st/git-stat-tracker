# What is this?

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

# What sort of metrics?

The initial scope of this project is kept pretty specific, so it's more likely to actually produce something... Metrics should be:

* Applies to a whole directory or repository - these are summary metrics, not specific file analyses. The obvious workaround here at the moment is storing full reports as a "bonus feature". Reports are probably going to be stored by firing in a full URI for where the report is stored.
* Applies to a specific revision - revision / commit date+time will be used to track metrics over time.
* Can be easily graphed - currently expecting single numbers and percentages - we're primarily looking for a short string/numeric value that can be processed into something that can go onto a chart. Things like passed/failed test numbers, code coverage, lines of code, percentages of particular languages, etc.

# Components

* Collector - eslint/jest/etc - tool will output a set of metrics (and maybe a report to store)
* Processor - tool that'll take the output of one of the above and normalize them into a set of numbers and/or documents to be stored
    * gst-eslint-processor - Parses eslint JSON output files and produces a set if summarised metrics
* Storer - tool that'll store the metrics/docs against the given commit name. probably sharded/indexed with commit date/repo slug as well? also does the job of collation - collects together various metrics and builds them into a single payload before uploading them.
* Fetcher - tool that'll pull the metrics back out and structure them in a reportable form
* Reporter - tool that'll take the formatted output and show something useful - probably a big ol' "this metric over time" graph
* Comparer - tool that'll fail a build (or just return a useful error) if a given commit has made something worse with what changes it's made

# Structure/function

* Collector/Processor/Storer will run within the CI tool.
* Fetcher will be specific to the tech and metric in question - eg: eslint for js linting, jest for js unit tests, xunit for .NET unit tests.
* Processor will be specific to the fetcher...ish - eg: tool for pulling metric numbers from eslint outputs is pretty specific, but it's probably simple to write something that'll do test metrics for anything that'll output standard JUnit report files.
* Storer should be a write-once job - take name-value metrics and dump them in the write place. Make sure it's idempotent(ish) too - think REST PUT semantics.
* Fetcher/reporter should be once-per-metric/purpose. A generic "code coverage over time" graph, or something like that.
* Comparer will probably need some awareness of the SCM tool in use. Might end up just going with a "have we got all the upstream changes merged in?" as a requirment, fail if that doesn't pass, and fail if there's any new errors. This might be where things get more complicated too. Ideally, we'd want to compare which errors were introduced in which files. Something kinda similar (but executed very differently) to https://github.com/paleite/eslint-plugin-diff. Maybe we could take where new errors/warnings/failures were introduced? Finding a baseline commit and checking for an increase is probably going to be more practical. Maybe a "get a unified+stable list of problems and diff them" approach?

# License

Pending.