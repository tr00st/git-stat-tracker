import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ReportRecord } from "types/index.js";
import { bannedAttributeNames } from "./utils.js";

export interface DynamoDBStorageConfig {
    tableName: string;
    repositoryUri: string;
    commitHash: string;
    timestamp: number;
}

export class DynamoDBWriter {
    private readonly docClient: DynamoDBDocumentClient;

    constructor(client?: DynamoDBClient) {
        const dbClient = client || new DynamoDBClient({});
        this.docClient = DynamoDBDocumentClient.from(dbClient);
    }

    public async * fetchRecordsByDate(
        config: DynamoDBStorageConfig,
        repository: string,
        from: Date = new Date(0, 1, 1),
        to: Date = new Date(9999, 1, 1)
    ) : AsyncIterable<ReportRecord> {
        const command = new QueryCommand({
            TableName: config.tableName,
            KeyConditionExpression: "repository = :repository",
            FilterExpression: "commitTimestamp BETWEEN :fromDate AND :toDate",
            ExpressionAttributeValues: {
                ":repository": config.repositoryUri,
                ":fromDate": from.toISOString(),
                ":toDate": to.toISOString()
            }
        });
        
        do {
            const output = await this.docClient.send(command);

            if (!output.Items) {
                return;
            }

            for (const item of output.Items) {
                for (const [key, value] of Object.entries(item)) {
                    if (!bannedAttributeNames.includes(key)) {
                        yield {
                            type: key,
                            value: value,
                            category: "Summary"
                        } as ReportRecord;
                    }
                }
            }

            // Check for more pages, and keep querying if necessary.
            command.input.ExclusiveStartKey = output.LastEvaluatedKey;
        } while (command.input.ExclusiveStartKey);
    }
}
