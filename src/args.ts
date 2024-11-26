#!/usr/bin/env node
/**
 * CLI entrypoint script. Not for API usage.
 */
import yargs from 'yargs'
import * as gstEslintProcessor from './processors/eslint/cli.js';
import * as gstDynamoDbStorer from './storers/dynamodb/cli.js';

const buildYargsInstance = (args: string | string[]) => {
    return yargs(args)
        .command(gstEslintProcessor)
        .command(gstDynamoDbStorer)
        .completion()
        .demandCommand(1, 'Please specify a command to run')
        .strict()
        .help("help", "Shows usage instructions");
};

export default buildYargsInstance;
