import { ReportRecord } from "types/index.js";


export interface CommitMetadata {
    commitHash: string;
    timestamp: number;
    repositoryUri: string;
}

export interface StoreWriter {
    storeRecords(records: AsyncIterable<ReportRecord>, config: CommitMetadata): Promise<void>;
}
