import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
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

    public async processRecords(
        records: AsyncIterable<ReportRecord>,
        config: DynamoDBStorageConfig
    ) {
        const { expressionAttributeNames, expressionAttributeValues, updateExpressionClauses } = 
            await this.buildExpressions(records);

        const command = this.createUpdateCommand(
            config,
            expressionAttributeNames,
            expressionAttributeValues,
            updateExpressionClauses
        );

        return await this.docClient.send(command);
    }

    async buildExpressions(records: AsyncIterable<ReportRecord>) {
        const expressionAttributeNames: Record<string, string> = {};
        const expressionAttributeValues: Record<string, string | number> = {};
        const updateExpressionClauses: string[] = [];

        let i = 1;
        for await (const record of records) {
            if (record.category === "Summary") {
                const substitution = 
                    this.processAttribute(record, i.toString(), expressionAttributeNames, expressionAttributeValues);
                
                const attributeName = substitution?.attributeName;
                const valueSubstitute = substitution?.valueSubstitute;

                if (attributeName) {
                    updateExpressionClauses.push(`${attributeName} = ${valueSubstitute}`);
                    i++;
                }
            }
        }

        return {
            expressionAttributeNames,
            expressionAttributeValues,
            updateExpressionClauses
        };
    }

    processAttribute(
        record: ReportRecord,
        suffix: string,
        expressionAttributeNames: Record<string, string>,
        expressionAttributeValues: Record<string, string | number>
    ) {
        if (record.category == "Summary") {
            if (bannedAttributeNames.includes(record.type)) {
                console.warn(`Banned attribute name '${record.type}' found, skipping`);
                return { attributeName: null, valueSubstitute: null };
            }

            const attributeName = `#attribute${suffix}`;
            const valueSubstitute = `:value${suffix}`;

            expressionAttributeNames[attributeName] = record.type;
            expressionAttributeValues[valueSubstitute] = record.value;

            return { attributeName, valueSubstitute };
        }
    }

    createUpdateCommand(
        config: DynamoDBStorageConfig,
        expressionAttributeNames: Record<string, string>,
        expressionAttributeValues: Record<string, string | number>,
        updateExpressionClauses: string[]
    ) {
        const updateExpression = `SET commitTimestamp = :commitTimestamp, ${updateExpressionClauses.join(', ')}`;
        
        return new UpdateCommand({
            TableName: config.tableName,
            Key: {
                commitHash: config.commitHash,
                repository: config.repositoryUri
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: {
                ":commitTimestamp": new Date(config.timestamp*1000).toISOString(),
                ...expressionAttributeValues
            },
            ReturnValues: "ALL_NEW",
        });
    }
}
