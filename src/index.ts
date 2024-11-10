#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import * as gstEslintProcessor from './processors/eslint/index.js';

await yargs(hideBin(process.argv))
  .command(gstEslintProcessor)
  .demandCommand()
  .help("help", "Shows usage instructions")
  .parseAsync();

