import { KnownRecordTypes, ReportRecord } from "types/index.js";
import { OutputFormatter } from "./types.js";
import { Writable } from "stream";

export class CsvFormatter implements OutputFormatter {
    async formatRecords(records: ReportRecord[], outputStream: Writable): Promise<void> {
        for (const record of records) {
            if (record.category === "Summary" && record.subcategory === "Numeric") {
                outputStream.write(`${KnownRecordTypes.TotalLintErrors},${record.value}\n`);
            }
        }
    }
}

