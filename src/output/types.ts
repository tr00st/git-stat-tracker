import { Writable } from "node:stream";
import { ReportRecord } from "types/reportRecords.js";

// interfaces/OutputFormatter.ts
export interface OutputFormatter {
    formatRecords(records: ReportRecord[], outputStream: Writable): Promise<void>;
}
