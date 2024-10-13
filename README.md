# Components

* Collector - eslint/jest/etc - tool will output a set of metrics (and maybe a report to store)
* Processor - tool that'll take the output of one of the above and normalize them into a set of numbers and/or documents to be stored
* Storer - tool that'll store the metrics/docs against the given commit name. probably sharded/indexed with commit date/repo slug as well/
* Fetcher - tool that'll pull the metrics back out and structure them in a reportable form
* Reporter - tool that'll take the formatted output and show something useful - probably a big ol' "this metric over time" graph

# Structure/function

Collector/Processor/Storer will run within the CI tool.
Fetcher will be specific to the tech and metric in question - eg: eslint for js linting, jest for js unit tests, xunit for .NET unit tests.
Processor will be specific to the fetcher...ish - eg: tool for pulling metric numbers from eslint outputs is pretty specific, but it's probably simple to write something that'll do test metrics for anything that'll output standard JUnit report files.
Storer should be a write-once job - take name-value metrics and dump them in the write place. Make sure it's idempotent(ish) too - think REST PUT semantics.
Fetcher/reporter should be once-per-metric/purpose. A generic "code coverage over time" graph, or something like that.

