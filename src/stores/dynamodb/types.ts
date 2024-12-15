export interface DynamoDBStorageConfig {
    tableName: string;
    /**
     * String prefix used to avoid conflicts with built-in metadata fields.
     * Must be a non-empty string.
     * @example 'data_' //  produces 'data_fieldName'
     */
    fieldPrefix: string;
}

