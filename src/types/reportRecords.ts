/**
 * Enum containing known record types - use one of these if you want intelligent handling of metrics.
 */
export enum KnownRecordTypes {
    TotalLintWarnings = "TotalLintWarnings", // Total number of warnings in the repo that were raised by the linter for this commit
    TotalLintErrors = "TotalLintErrors", // Total number of errors in the repo that were raised by the linter for this commit
    TotalTestsRan = "TotalTestsRan", // The total number of tests that ran for the repo in this commit.
    TotalTestsPassed = "TotalTestsPassed", // The total number of tests that passed for the repo in this commit.
    TotalTestsFailed = "TotalTestsFailed", // The total number of tests that failed for the repo in this commit.
    TotalTestsSkipped = "TotalTestsSkipped" // The total number of tests that skipped for the repo in this commit.
}

/**
 * Records can use either a known type, or a free-text string. If you're not using KnownRecordTypes, you might get less smarts in your output.
 * @see {@link KnownRecordTypes}
 */
export type RecordType = KnownRecordTypes | string;

/**
 * A record describing a repository-wide metric on a single commit.
 */
export type SummaryRecord = {
    type : RecordType;
    value : unknown;
};
export type NumericSummaryRecord = SummaryRecord & { value : number };

/**
 * A record describing an annotation against a specific section of code.
 */
export type AnnotationRecord = {
    type : RecordType;
    file : string;
    startLine : number;
    endLine : number;
    startCol : number;
    endCol : number;
    message? : string;
}

/**
 * Type representing a generic record of some type for a commit. Either an AnnotationRecord or a SummaryRecord.
 * @see {@link SummaryRecord}
 * @see {@link AnnotationRecord}
 */
export type ReportRecord = SummaryRecord | AnnotationRecord;
