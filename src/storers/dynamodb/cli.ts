import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { createReadStream } from "fs";
import { TypedTransform } from "lib/util/TypedTransform.js";
import StreamArray from "stream-json/streamers/StreamArray.js";
import { ReportRecord } from "types/index.js";
import { Argv } from 'yargs'

export const command = "store dynamodb";
export const describe = "stores results in an AWS DynamoDB database";

interface Arguments {
    inputFile: string[];
    repositoryUri: string;
    commitHash: string;
    timestamp: number;
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
            type: 'string',
            description: 'Commit (or other canonical) timestamp to store this record with. Will be used for time-series reporting.',
            default: (new Date()).toISOString(),
            defaultDescription: 'the timestamp when this script was',
            coerce: Date.parse
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

/**
 * Asynchronously reads ReportRecord instances from a given JSON file. Requires the file to be a single array of
 * ReportRecord typed objects.
 * @param filename Path of the file to be read.
 * @returns An async iterable that yields ReportRecord instances as they are read.
 * @async
 */
const readRecords = async function* (filename: string) : AsyncIterable<ReportRecord> {
    const fileStream = createReadStream(filename);
    const pipeline = fileStream
        .pipe(StreamArray.withParser())
        .pipe(new TypedTransform<ReportRecord>());

    for await (const record of pipeline) {
        yield record;
    }
}

/**
 * Reads ReportRecord instances from multiple files. Returns a single iterable containing all reports from all files, including
 * any duplicates.
 * @param files An array of filenames to be read.
 * @returns An async iterable that yields ReportRecord instances from each file in the array.
 * @async
 */
const bulkReadRecords = async function* (files: string[]) : AsyncIterable<ReportRecord> {
    for (const file of files) {
        for await (const record of readRecords(file)) {
            yield record;
        }
    }
}

export const handler = async ({inputFile : inputFiles, commitHash, repositoryUri, timestamp} : Arguments) : Promise<void> => {
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);
    
    const records : AsyncIterable<ReportRecord> = bulkReadRecords(inputFiles);

    const expressionAttributeNames : Record<string, string> = {};
    const expressionAttributeValues : Record<string, string | number> = {
        ":commitTimestamp": timestamp
    };

    const updateExpressionClauses = [];
    const bannedAttributeNames = [
        'commitHash',
        'repository',
        'commitTimestamp'
    ];

    let i : number = 1;
    for await (const record of records) {
        if (record.category == "Summary") {
            const attributeName = record.type;
            if (bannedAttributeNames.includes(attributeName)) {
                console.warn(`Banned attribute name '${attributeName}' found, skipping`);
            }
            // We currently only support Summary types in here.
            const attributeNameSubstitute = `#attribute${i}`;
            const valueNameSubstitute = `:value${i}`;
            expressionAttributeNames[attributeNameSubstitute] = attributeName;
            expressionAttributeValues[valueNameSubstitute] = record.value;
            updateExpressionClauses.push(`${attributeNameSubstitute} = ${valueNameSubstitute}`)
            i++;
        }
    }

    const storeCommand = new UpdateCommand({
        TableName: "tr00st-repo-stats",
        Key: {
            commitHash: commitHash,
            repository: repositoryUri
        },
        
        UpdateExpression: `set commitTimestamp = :commitTimestamp, ${updateExpressionClauses.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
    });

    const response = await docClient.send(storeCommand);
    console.log(response);
};
