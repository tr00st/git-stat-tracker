import { Writable } from "node:stream";
import { ReportRecord } from "types/index.js";

// interfaces/OutputFormatter.ts
export interface OutputFormatter {
    formatRecords(records: AsyncIterable<ReportRecord> | ReportRecord[], outputStream: Writable): Promise<void>;
}
