import { Argv } from 'yargs'
import { DynamoDBRecordProcessor } from './DynamoDBRecordProcessor.js';
import { RecordReader } from '../../utils/json/RecordReader.js';

export const command = "store dynamodb";
export const describe = "stores results in an AWS DynamoDB database";

interface Arguments {
    inputFile: string[];
    repositoryUri: string;
    commitHash: string;
    timestamp: number;
    tableName: string;
}

export const builder = (yargs: Argv) => {
    return yargs
        .option('inputFile', {
            alias: 'i',
            array: true,
            requiresArg: true,
            description: 'Specify one or more files to be read - must be a JSON file produced by git-stat-tracker. Use "-" or omit to read from stdout.',
            default: ['-'],
            type: 'string'
        })
        .option('repositoryUri', {
            alias: ['r', 'repository'],
            requiresArg: true,
            type: 'string',
            description: 'The canonical URI to store this record against - changing this will disassociate from any existing records'
        })
        .option('commitHash', {
            alias: ['c', 'commit'],
            requiresArg: true,
            type: 'string',
            description: 'Git hash (or other globally unique commit ID) to reference this record against'
        })
        .option('timestamp', {
            alias: ['t'],
            requiresArg: true,
            type: 'number',
            description: 'Commit (or other canonical) timestamp to store this record with. Will be used for time-series reporting. Defaults to a Unix timestamp in seconds.',
            default: Math.floor((new Date()).getTime() / 1000),
            defaultDescription: 'the timestamp when this script was'
        })
        .option('tableName', {
            alias: ['n'],
            requiresArg: true,
            type: 'string',
            description: 'The name of the DynamoDB table to store the records in',
        })
        .demandOption(['repositoryUri', 'commitHash'], 'repositoryUri and commitHash must be specified')
        .demandOption('tableName', 'tableName must be specified')
};

export const handler = async ({
    inputFile: inputFiles,
    commitHash,
    repositoryUri,
    timestamp,
    tableName
}: Arguments): Promise<void> => {
    try {
        const processor = new DynamoDBRecordProcessor();
        const records = RecordReader.bulkReadRecords(inputFiles);

        const config = {
            tableName,
            repositoryUri,
            commitHash,
            timestamp
        };

        await processor.processRecords(records, config);
    } catch (error) {
        console.error('Failed to process records:', error);
        throw error;
    }
};
