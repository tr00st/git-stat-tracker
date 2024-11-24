#!/usr/bin/env node
/**
 * CLI entrypoint script. Not for API usage.
 */
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import * as gstEslintProcessor from './processors/eslint/cli.js';
import * as gstDynamoDbStorer from './storers/dynamodb/cli.js';

await yargs(hideBin(process.argv))
  .command(gstEslintProcessor)
  .command(gstDynamoDbStorer)
  .completion()
  .demandCommand(1, 'Please specify a command to run')
  .strict()
  .help("help", "Shows usage instructions")
  .parse();
