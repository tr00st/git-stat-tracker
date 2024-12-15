import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ReportRecord } from "types/index.js";
import { DynamoDBStorageConfig } from "./types.js";
import { CommitMetadata, StoreWriter } from "../../types/stores.js";
import { FieldMapper, PrefixFieldMapper } from "utils/fieldMapping.js";

export class DynamoDBWriter implements StoreWriter {
    private readonly docClient: DynamoDBDocumentClient;
    config: DynamoDBStorageConfig;
    fieldMapper: FieldMapper;

    constructor(config: DynamoDBStorageConfig, client?: DynamoDBClient) {
        const dbClient = client || new DynamoDBClient({});
        this.docClient = DynamoDBDocumentClient.from(dbClient);
        this.fieldMapper = new PrefixFieldMapper(config.fieldPrefix);
        this.config = config;
    }

    public async storeRecords(
        records: AsyncIterable<ReportRecord>,
        config: CommitMetadata
    ) {
        const { expressionAttributeNames, expressionAttributeValues, updateExpressionClauses } = 
            await this.buildExpressions(records);

        const command = this.createUpdateCommand(
            config,
            expressionAttributeNames,
            expressionAttributeValues,
            updateExpressionClauses
        );

        await this.docClient.send(command);
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
            const attributeName = `#attribute${suffix}`;
            const valueSubstitute = `:value${suffix}`;

            expressionAttributeNames[attributeName] = this.fieldMapper.toStorageFieldName(record.type);
            expressionAttributeValues[valueSubstitute] = record.value;

            return { attributeName, valueSubstitute };
        }
    }

    createUpdateCommand(
        config: CommitMetadata,
        expressionAttributeNames: Record<string, string>,
        expressionAttributeValues: Record<string, string | number>,
        updateExpressionClauses: string[]
    ) {
        const updateExpression = `SET commitTimestamp = :commitTimestamp, ${updateExpressionClauses.join(', ')}`;
        
        return new UpdateCommand({
            TableName: this.config.tableName,
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
