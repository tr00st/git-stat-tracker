import { createReadStream } from "node:fs";
/// <reference path='bfj.d.ts' />
import bfj from "bfj";
import { Argv } from "yargs";
import { CliArguments, OutputFormats } from "./types.js";
import { sumMetricCounts } from "./index.js";
import { collapseAsyncGenerator } from "./utils.js";
import { FormatterFactory } from "../../output/FormatterFactory.js";
import { FileWriter } from "../../output/FileWriter.js";

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


export const handler = async (argv: CliArguments) : Promise<void> => { // TODO - fix that any
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

  // Use bfj.match to extract the desired elements from the stream
  const dataStream = bfj.match(fileStream,
    (key: string, value: unknown, depth: number) => (depth === 1 && typeof(key) === "number"), {});

  if (outputFormat) {
    const formatter = FormatterFactory.createFormatter(outputFormat);
    const writer = new FileWriter(outputFile);

    try {
        await writer.open();
        const outputGenerator = sumMetricCounts(dataStream, argv.includeMessages);
        const records = await collapseAsyncGenerator(outputGenerator);
        await formatter.formatRecords(records, writer.getStream());
    } finally {
        await writer.close();
    }
    // We create a duplex here to flexibly pass output. Anything written to outputStream goes out via outputPipeline
    // to the desired output (file or stdout).
    // const [outputStream, outputPipeline] = duplexPair();

    // let outputFileHandle : promises.FileHandle | null = null;
    // if (outputFile !== "-") {
    //   outputFileHandle = await promises.open(outputFile, 'w');
    //   outputPipeline.pipe(outputFileHandle.createWriteStream());
    //   outputPipeline.pipe(process.stdout);
    // } else {
    //   const stdOutWriter = new Writable({
    //     write: (chunk, encoding, next) => {
    //       process.stdout.write(chunk);
    //       next();
    //     }
    //   })
    //   console.error("Writing to stdout");
    //   outputPipeline.pipe(stdOutWriter);
    // }


    // const outputGenerator = sumMetricCounts(dataStream, argv.includeMessages);
    // switch (outputFormat) {
    //   case "json": {
    //     const items = await collapseAsyncGenerator(outputGenerator);
    //     await (new Promise<void>((resolve, reject) => {
    //       const jsonStream = bfj.streamify(items);
        
    //       jsonStream.on('end', () => {
    //         resolve();
    //       });
    //       jsonStream.on('error', () => {reject();});
    //       jsonStream.on('dataError', () => {reject();});
    //       jsonStream.pipe(outputStream);
    //     }));
    //     process.stdout.write("\n"); // HACK - add a newline so tie output doesn't get overwritten on CLI
    //     break;
    //   }
    //   case "csv": {
    //     let totalWarnings : number = 0;
    //     let totalErrors : number = 0;
    //     for await (const entry of outputGenerator) {
    //       if (entry.category === "Summary") {
    //         if (entry.subcategory === "Numeric") {
    //           if (entry.type === KnownRecordTypes.TotalLintErrors) {
    //             totalErrors = entry.value;
    //           } else if (entry.type === KnownRecordTypes.TotalLintWarnings) {
    //             totalWarnings = entry.value;
    //           }
    //         }
    //       }
    //     }
        
    //     await outputStream.write(`totalErrors,${totalErrors}\n`);
    //     await outputStream.write(`totalWarnings,${totalWarnings}\n`);
    //     break;
    //   }
    // }
    
    // outputStream.end();
    // outputPipeline.end();
    // if (outputFileHandle) {
    //   await outputFileHandle.sync();
    //   await outputFileHandle.close();
    // }
  }
};

