#!/usr/bin/env node
import { parseArgs } from "node:util";
import { createReadStream } from "node:fs";
import bfj from "bfj";

const {
  positionals
} = parseArgs({
  args: process.argv.slice(2),
  options: {},
  strict: false
});

if (positionals.length < 1) {
  console.error("Input filename required");
  process.exit(1);
}

const targetFilename = positionals[0];
const fileStream = createReadStream(targetFilename);

// Use bfj.match to extract the desired elements from the stream
const dataStream = bfj.match(fileStream, (key, value, depth) => (depth === 1 && typeof(key) === "number"), {});

let totalErrors = 0;
let totalWarnings = 0;
for await (const { errorCount, warningCount } of dataStream) {
    totalErrors += errorCount ?? 0;
    totalWarnings += warningCount ?? 0;
}

console.log(`totalLintErrors,${totalErrors}`);
console.log(`totalLintWarnings,${totalWarnings}`);
