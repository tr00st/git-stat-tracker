import { createReadStream } from "node:fs";
import { Argv } from "yargs";
import { CliArguments, EslintReportFileEntry, OutputFormats } from "./types.js";
import { sumMetricCounts } from "./index.js";
import { FormatterFactory } from "../../output/FormatterFactory.js";
import { FileWriter } from "../../output/FileWriter.js";
import StreamArray from "stream-json/streamers/StreamArray.js";
import { Transform, TransformCallback } from "node:stream";

export const command = "eslint <inputFile>";
export const describe = "parses the results from inputFile";

export const builder = (yargs: Argv) => {
    return yargs.positional('inputFile', {
        description: 'Specify the file to be read - must be an EsLint produced JSON report file',
        type: 'string'
    })
        .option('outputFormat', {
            alias: 'f',
            type: 'string',
            description: 'Specify the output format to be used when writing to file. Must be included if outputFile is set.',
            choices: Object.values(OutputFormats),
            default: OutputFormats.Json
        })
        .option('outputFile', {
            alias: 'o',
            type: 'string',
            description: 'Specify the filename where you want the output to be written. Use "-" or omit to write to stdout.',
            default: '-'
        })
        .option('includeMessages', {
            alias: 'm',
            type: 'boolean',
            default: false,
            description: 'Includes individual eslint messages in the output. Not supported in all output types (eg: CSV)'
        });
};

class TypedTransform<T> extends Transform {
    constructor(options = {}) {
        super({
            ...options,
            objectMode: true
        });
    }

    _transform(chunk: { value: T }, _encoding: string, callback: TransformCallback) {
        try {
            const typedData: T = chunk.value;
            this.push(typedData);
            callback();
        } catch (error) {
            if (error instanceof Error) {
                callback(error);
            } else if (typeof error === 'string') {
                callback(new Error(error));
            } else {
                callback(new Error('An unknown error occurred'));
            }
        }
    }
}

export const handler = async (argv: CliArguments): Promise<void> => {
    if (!argv.inputFile) {
        console.error("Input filename required");
        process.exit(1);
    }
    const { outputFile, outputFormat } = argv;

    if (outputFile !== '-' && !outputFormat) {
        console.error("Output format and file must be specified together or not at all!");
        process.exit(1);
    }

    const fileStream = createReadStream(argv.inputFile);
    const pipeline = fileStream
        .pipe(StreamArray.withParser())
        .pipe(new TypedTransform<EslintReportFileEntry>());

    if (outputFormat) {
        const formatter = FormatterFactory.createFormatter(outputFormat);
        const writer = new FileWriter(outputFile);

        try {
            await writer.open();
            const output = sumMetricCounts(pipeline, argv.includeMessages);
            await formatter.formatRecords(output, writer.getStream());
        } finally {
            await writer.close();
        }
    }
};

