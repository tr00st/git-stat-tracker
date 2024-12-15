import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ReportRecord } from "types/index.js";
import { DynamoDBStorageConfig } from "./types.js";
import { FieldMapper, PrefixFieldMapper } from "utils/fieldMapping.js";

export class DynamoDBWriter {
    private readonly docClient: DynamoDBDocumentClient;
    private readonly config: DynamoDBStorageConfig;
    private readonly fieldMapper: FieldMapper;

    constructor(config: DynamoDBStorageConfig, client?: DynamoDBClient) {
        this.config = config;
        const dbClient = client || new DynamoDBClient({});
        this.docClient = DynamoDBDocumentClient.from(dbClient);
        this.fieldMapper = new PrefixFieldMapper(config.fieldPrefix);
    }

    public async * fetchRecordsByDate(
        repositoryUri: string,
        from: Date = new Date(0, 1, 1),
        to: Date = new Date(9999, 1, 1)
    ) : AsyncIterable<ReportRecord> {
        const command = new QueryCommand({
            TableName: this.config.tableName,
            KeyConditionExpression: "repository = :repository",
            FilterExpression: "commitTimestamp BETWEEN :fromDate AND :toDate",
            ExpressionAttributeValues: {
                ":repository": repositoryUri,
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
                    yield {
                        type: this.fieldMapper.fromStorageFieldName(key),
                        value: value,
                        category: "Summary"
                    } as ReportRecord;
                }
            }

            // Check for more pages, and keep querying if necessary.
            command.input.ExclusiveStartKey = output.LastEvaluatedKey;
        } while (command.input.ExclusiveStartKey);
    }
}
