import { promises } from "node:fs";
import { Writable } from "node:stream";

export class FileWriter {
    private fileHandle: promises.FileHandle | null = null;
    private writeStream: Writable | null = null;

    constructor(private outputPath: string) {}

    async open(): Promise<void> {
        if (this.outputPath === '-') {
            this.writeStream = process.stdout;
        } else {
            this.fileHandle = await promises.open(this.outputPath, 'w');
            this.writeStream = this.fileHandle.createWriteStream();
        }
    }

    getStream(): Writable {
        if (!this.writeStream) {
            throw new Error('FileWriter not opened');
        }
        return this.writeStream;
    }

    async close(): Promise<void> {
        if (this.fileHandle) {
            await this.fileHandle.sync();
            await this.fileHandle.close();
        }
    }
}
