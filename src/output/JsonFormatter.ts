import bfj from "bfj";
import { ReportRecord } from "types/reportRecords.js";
import { OutputFormatter } from "./types.js";
import { Writable } from "stream";

export class JsonFormatter implements OutputFormatter {
    async formatRecords(records: ReportRecord[], outputStream: Writable): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const jsonStream = bfj.streamify(records);
            
            jsonStream.on('end', () => {
                outputStream.write('\n');
                resolve();
            });
            jsonStream.on('error', reject);
            jsonStream.on('dataError', reject);
            
            jsonStream.pipe(outputStream, { end: false });
        });
    }
}