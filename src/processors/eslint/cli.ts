/**
 * This module contains the CLI for the EsLint processor. Not intended for API usage.
 * @module
 */
import { createReadStream } from "node:fs";
import { Argv } from "yargs";
import { CliArguments, EslintReportFileEntry, OutputFormats } from "./types.js";
import { processReportEntries } from "./index.js";
import { FormatterFactory } from "../../lib/output/FormatterFactory.js";
import { FileWriter } from "../../lib/output/FileWriter.js";
import StreamArray from "stream-json/streamers/StreamArray.js";
import { TypedTransform } from "../../lib/util/TypedTransform.js";

export const command = "process eslint <inputFile>";
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
            const output = processReportEntries(pipeline, argv.includeMessages);
            await formatter.formatRecords(output, writer.getStream());
        } finally {
            await writer.close();
        }
    }
};

