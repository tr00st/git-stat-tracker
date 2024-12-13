import { createReadStream } from "fs";
import { TypedTransform } from "lib/util/TypedTransform.js";
import StreamArray from "stream-json/streamers/StreamArray.js";
import { ReportRecord } from "types/index.js";

export class RecordReader {
    /**
     * Asynchronously reads ReportRecord instances from a given JSON file.
     * @param filename Path of the file to be read.
     */
    static async *readRecords(filename: string): AsyncIterable<ReportRecord> {
        const fileStream = createReadStream(filename);
        const pipeline = fileStream
            .pipe(StreamArray.withParser())
            .pipe(new TypedTransform<ReportRecord>());

        for await (const record of pipeline) {
            yield record;
        }
    }

    /**
     * Reads ReportRecord instances from multiple files.
     * @param files An array of filenames to be read.
     */
    static async *bulkReadRecords(files: string[]): AsyncIterable<ReportRecord> {
        for (const file of files) {
            try {
                for await (const record of this.readRecords(file)) {
                    yield record;
                }
            } catch (error) {
                console.error(`Error reading file ${file}:`, error);
                throw error;
            }
        }
    }
}
