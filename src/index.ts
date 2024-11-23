#!/usr/bin/env node
/**
 * CLI entrypoint script. Not for API usage.
 */
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import * as gstEslintProcessor from './processors/eslint/cli.js';

await yargs(hideBin(process.argv))
  .command(gstEslintProcessor)
  .demandCommand()
  .help("help", "Shows usage instructions")
  .parse();
