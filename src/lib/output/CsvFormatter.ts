import { KnownRecordTypes, ReportRecord } from "types/index.js";
import { OutputFormatter } from "./types.js";
import { Writable } from "stream";

export class CsvFormatter implements OutputFormatter {
    async formatRecords(records: AsyncIterable<ReportRecord> | ReportRecord[], outputStream: Writable): Promise<void> {
        for await (const record of records) {
            if (record.category === "Summary" && record.subcategory === "Numeric") {
                outputStream.write(`${KnownRecordTypes.TotalLintErrors},${record.value}\n`);
            }
        }
    }
}

