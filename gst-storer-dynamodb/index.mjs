import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const argv = await yargs(hideBin(process.argv))
  .usage('$0 <inputFile>', 'parses the results from inputFile', (yargs) => {
    yargs.positional('inputFile', {
      description: 'Specify the file to be read - must be an EsLint produced JSON report file',
      type: 'string'
    })
    .option('outputFormat', {
      alias: 'f',
      type: 'string',
      description: 'Specify the output format to be used when writing to file',
      choices: ['json', 'csv']
    })
    .option('outputFile', {
      alias: 'o',
      type: 'string',
      description: 'Specify the filename where you want the output to be written'
    })
  })
  .demand(1)
  .parseAsync();

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const repoUri = "https://github.com/tr00st/git-stat-tracker/";
const metrics = {
    ":commitTimestamp": (new Date()).toISOString(),
    ":totalLintErrors": Math.floor(Math.random()*100),
    ":totalLintWarnings": Math.floor(Math.random()*100)
};
const commitHash = `DummyId-${Math.random()}${Math.random()}`;
const timingStart = Date.now();


const command = new UpdateCommand({
    TableName: "tr00st-repo-stats",
    Key: {
      commitHash: commitHash,
      repository: repoUri
    },
    UpdateExpression: "set commitTimestamp = :commitTimestamp, totalLintErrors = :totalLintErrors, totalLintWarnings = :totalLintWarnings",
    ExpressionAttributeValues: metrics,
    ReturnValues: "ALL_NEW",
});

const response = await docClient.send(command);
const timingEnd = Date.now();
console.log(response);
console.log(`Initial upsert took ${timingEnd - timingStart}ms`)
