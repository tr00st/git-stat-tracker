import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Argv } from 'yargs'

export const command = "store dynamodb <inputFile>";
export const describe = "stores results in an AWS DynamoDB database";

interface Arguments {
  repositoryUri: string;
  commitHash: string;
  timestamp: string;
}

export const builder = (yargs: Argv) => {
  return yargs.positional('inputFile', {
      description: 'Specify the file to be read - must be an EsLint produced JSON report file',
      type: 'string'
    })
    .option('repositoryUri', {
      alias: ['r', 'repository'],
      requiresArg: true,
      type: 'string',
      description: 'The canonical URI to store this record against - changing this will disassociate from any existing records',
      choices: ['json', 'csv']
    })
    .option('commitHash', {
      alias: ['c', 'commit'],
      requiresArg: true,
      type: 'string',
      description: 'Git hash (or other globally unique commit ID) to reference this record against',
      choices: ['json', 'csv']
    })
    .option('timestamp', {
      alias: ['t'],
      requiresArg: true,
      type: 'string',
      description: 'Commit (or other canonical) timestamp to store this record with. Will be used for time-series reporting.',
      choices: ['json', 'csv'],
      default: (new Date()).toISOString(),
      defaultDescription: 'the timestamp when this script was',
      coerce: Date.parse
    })
};


export const handler = async (argv: Arguments) => {

  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  const metrics = {
    ":totalLintErrors": Math.floor(Math.random()*100),
    ":totalLintWarnings": Math.floor(Math.random()*100)
  };

  const attributesToStore = {
    ...metrics,
    ":commitTimestamp": argv.timestamp
  };
  const timingStart = Date.now();


  const storeCommand = new UpdateCommand({
      TableName: "tr00st-repo-stats",
      Key: {
        commitHash: argv.commitHash,
        repository: argv.repositoryUri
      },
      UpdateExpression: "set commitTimestamp = :commitTimestamp, totalLintErrors = :totalLintErrors, totalLintWarnings = :totalLintWarnings",
      ExpressionAttributeValues: attributesToStore,
      ReturnValues: "ALL_NEW",
  });

  const response = await docClient.send(storeCommand);
  const timingEnd = Date.now();
  console.log(response);
  console.log(`Initial upsert took ${timingEnd - timingStart}ms`)
};
