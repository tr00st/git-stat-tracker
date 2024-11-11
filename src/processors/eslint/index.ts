#!/usr/bin/env node
import { createReadStream } from "node:fs";
import promises from 'fs/promises'
/// <reference path='bfj.d.ts' />
import bfj from "bfj";
import { Argv } from "yargs";
import { KnownRecordTypes, SummaryRecord } from "../../types/reportRecords.js";
import { duplexPair, Writable } from "node:stream";

export const command = "eslint <inputFile>";
export const describe = "parses the results from inputFile";

export enum OutputFormats {
  Json = "json",
  Csv = "csv"
};

export interface CliArguments {
  inputFile?: string,
  outputFormat?: OutputFormats,
  outputFile: string
};

export const builder = (yargs: Argv) => {
  return yargs.positional('inputFile', {
      description: 'Specify the file to be read - must be an EsLint produced JSON report file',
      type: 'string'
    })
    .option('outputFormat', {
      alias: 'f',
      type: 'string',
      description: 'Specify the output format to be used when writing to file. Must be included if outputFile is set.',
      choices: Object.values(OutputFormats)
    })
    .option('outputFile', {
      alias: 'o',
      type: 'string',
      description: 'Specify the filename where you want the output to be written. Use "-" or omit to write to stdout.',
      default: '-'
    });
};

export interface EslintReportEntry {
  errorCount: number;
  warningCount: number;
}

export const sumMetricCounts = async (dataStream: ReadableStream<EslintReportEntry> | EslintReportEntry[]) => {
  const output = {
    totalErrors: 0,
    totalWarnings: 0
  };

  for await (const { errorCount, warningCount } of dataStream) {
    output.totalErrors += errorCount ?? 0;
    output.totalWarnings += warningCount ?? 0;
  }

  return output;
};

export const handler = async (argv: CliArguments) : Promise<void> => { // TODO - fix that any
  if (!argv.inputFile) {
    console.error("Input filename required");
    process.exit(1);
  }
  const outputFile = argv.outputFile;
  const outputFormat = argv.outputFormat;

  if (outputFile !== '-' && !outputFormat) {
    console.error("Output format and file must be specified together or not at all!");
    process.exit(1);
  }

  const targetFilename = argv.inputFile;
  const fileStream = createReadStream(targetFilename);

  // Use bfj.match to extract the desired elements from the stream
  const dataStream = bfj.match(fileStream, (key: string, value: unknown, depth: number) => (depth === 1 && typeof(key) === "number"), {});

  const output = await sumMetricCounts(dataStream);

  console.error("Input file successfully scanned.")
  console.error(`Total Lint Errors: ${output.totalErrors}`);
  console.error(`Total Lint Warnings: ${output.totalWarnings}`);

  if (outputFormat) {
    // We create a duplex here to flexibly pass output. Anything written to outputStream goes out via outputPipeline
    // to the desired output (file or stdout).
    const [outputStream, outputPipeline] = duplexPair();

    let outputFileHandle : promises.FileHandle | null = null;
    if (outputFile !== "-") {
      outputFileHandle = await promises.open(outputFile, 'w');
      outputPipeline.pipe(outputFileHandle.createWriteStream());
      outputPipeline.pipe(process.stdout);
    } else {
      const stdOutWriter = new Writable({
        write: (chunk, encoding, next) => {
          process.stdout.write(chunk);
        }
      })
      console.error("Writing to stdout");
      outputPipeline.pipe(stdOutWriter);
    }

    switch (outputFormat) {
      case "json": {
        const convertedOutput : SummaryRecord[] = [{
          type: KnownRecordTypes.TotalLintWarnings,
          value: output.totalWarnings
        }, {
          type: KnownRecordTypes.TotalLintErrors,
          value: output.totalErrors
        }];
        await outputStream.write(JSON.stringify(convertedOutput));
        break;
      }
      case "csv": {
        await outputStream.write(`totalErrors,${output.totalErrors}\n`);
        await outputStream.write(`totalWarnings,${output.totalWarnings}\n`);
        break;
      }
    }
    
    outputStream.end();
    outputPipeline.end();
    if (outputFileHandle) {
      await outputFileHandle.sync();
      await outputFileHandle.close();
    }
  }
};

