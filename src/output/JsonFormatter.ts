import { ReportRecord } from "types/index.js";
import { OutputFormatter } from "./types.js";
import { Writable } from "stream";

export class JsonFormatter implements OutputFormatter {
    async formatRecords(records: AsyncIterable<ReportRecord> | ReportRecord[], outputStream: Writable): Promise<void> {
        outputStream.write("[\n");
        let first = true;
        for await (const record of records) {
            if (!first) outputStream.write(",\n");
            outputStream.write(JSON.stringify(record));
            first = false;
        }
        outputStream.write("\n]\n");
    }
}
