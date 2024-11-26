#!/usr/bin/env node
/**
 * CLI entrypoint script. Not for API usage.
 * @module
 */
import buildYargsInstance from 'args.js';
import { hideBin } from 'yargs/helpers';

await buildYargsInstance(hideBin(process.argv))
  .parse();
