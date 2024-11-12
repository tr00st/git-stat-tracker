#!/usr/bin/env node
import { createReadStream } from "node:fs";
import promises from 'fs/promises'
/// <reference path='bfj.d.ts' />
import bfj from "bfj";
import { Argv } from "yargs";
import { AnnotationRecord, KnownRecordTypes, NumericSummaryRecord, ReportRecord, SummaryRecord } from "../../types/reportRecords.js";
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
  outputFile: string,
  includeMessages: boolean
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

export enum EslintMessageSeverity {
  Warning = 1,
  Error = 2
}
export interface EslintReportMessageEntry {
  message: string;
  severity: EslintMessageSeverity;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
}
export interface EslintReportFileEntry {
  filePath: string;
  errorCount: number;
  warningCount: number;
  messages: EslintReportMessageEntry[];
}

const linterSeverityMap = {
  [EslintMessageSeverity.Warning]: KnownRecordTypes.LintWarning,
  [EslintMessageSeverity.Error]: KnownRecordTypes.LintError
}

export const sumMetricCounts = async function* (dataStream: ReadableStream<EslintReportFileEntry> | EslintReportFileEntry[], includeMessages: boolean) : AsyncGenerator<ReportRecord> {
  let totalErrors = 0;
  let totalWarnings = 0;

  for await (const fileEntry of dataStream) {
    totalErrors += fileEntry.errorCount ?? 0;
    totalWarnings += fileEntry.warningCount ?? 0;
    if (includeMessages) {
      const messages : EslintReportMessageEntry[] = fileEntry.messages;
      for (const messageEntry of messages) {
        const outputMessageEntry : AnnotationRecord = {
          type: linterSeverityMap[messageEntry.severity],
          file: fileEntry.filePath,
          startLine: messageEntry.line,
          endLine: messageEntry.endLine,
          startCol: messageEntry.column,
          endCol: messageEntry.endColumn,
          category: "Annotation"
        };
        yield outputMessageEntry;
      }
    }
  }
  const totalWarningsRecord : NumericSummaryRecord = {
    type: KnownRecordTypes.TotalLintWarnings,
    value: totalWarnings,
    category: "Summary",
    subcategory: "Numeric"
  };
  yield totalWarningsRecord;
  yield {
    type: KnownRecordTypes.TotalLintErrors,
    value: totalErrors,
    category: "Summary",
    subcategory: "Numeric"
  };
};

// HACK - Way to load everything into RAM...
async function collapseAsyncGenerator<Type>(generator: AsyncGenerator<Type>) {
  const output = [];
  for await (const item of generator) {
    output.push(item);
  }
  return output;
}

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
          next();
        }
      })
      console.error("Writing to stdout");
      outputPipeline.pipe(stdOutWriter);
    }


    const outputGenerator = sumMetricCounts(dataStream, argv.includeMessages);
    switch (outputFormat) {
      case "json": {
        const items = await collapseAsyncGenerator(outputGenerator);
        await (new Promise<void>((resolve, reject) => {
          const jsonStream = bfj.streamify(items);
        
          // jsonStream.on('data', chunk => { console.log(`F ${chunk}`) });
          jsonStream.on('end', () => {
            resolve();
          });
          jsonStream.on('error', () => {reject();});
          jsonStream.on('dataError', () => {reject();});
          jsonStream.pipe(outputStream);
          console.log('did thing');
        }));
        break;
      }
      case "csv": {
        let totalWarnings : number = 0;
        let totalErrors : number = 0;
        for await (const entry of outputGenerator) {
          if (entry.category === "Summary") {
            if (entry.subcategory === "Numeric") {
              if (entry.type === KnownRecordTypes.TotalLintErrors) {
                totalErrors = entry.value;
              } else if (entry.type === KnownRecordTypes.TotalLintWarnings) {
                totalWarnings = entry.value;
              }
            }
          }
        }
        
        await outputStream.write(`totalErrors,${totalErrors}\n`);
        await outputStream.write(`totalWarnings,${totalWarnings}\n`);
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

