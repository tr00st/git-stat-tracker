// These types are 

/**
 * A record describing a repository-wide metric on a single commit.
 */
export interface SummaryRecord {
    type : string;
    value : unknown;
};

/**
 * A record describing an annotation against a specific section of code.
 */
export interface AnnotationRecord {
    type : string;
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
export type Record = SummaryRecord | AnnotationRecord;
