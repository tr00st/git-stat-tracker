#!/usr/bin/env node
/**
 * Builds a yargs instance for usage in the main CLI entrypoint (or docs generation).
 * @module
 */
import yargs from 'yargs'
import * as gstEslintProcessor from './processors/eslint/cli.js';
import * as gstDynamoDbStorer from './storers/dynamodb/cli.js';

/**
 * Builds a yargs instance, adding known commands and enabling features as required.
 * @param args args array or raw string, passed to yargs(args) when building the yargs instance.
 * @returns Instance of yargs, ready to be run with .parse()
 */
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
