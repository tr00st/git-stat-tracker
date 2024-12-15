export interface FieldMapper {
    toStorageFieldName(attributeName: string): string;
    fromStorageFieldName(storageFieldName: string): string;
}

export class PrefixFieldMapper implements FieldMapper {
    constructor(private prefix: string) {
        if (prefix === null) {
            throw new Error("Prefix cannot be null");
        }
        if (prefix.length < 1) {
            throw new Error("Prefix cannot be empty");
        }
    }

    toStorageFieldName(attributeName: string): string {
        return [this.prefix, attributeName].join("");
    }

    fromStorageFieldName(storageFieldName: string): string {
        if (!this.isDataField(storageFieldName)) {
            throw new Error(`Field name '${storageFieldName}' is not a data field`);
        }

        return storageFieldName.substring(this.prefix.length);
    }
    
    isDataField(fieldName: string): boolean {
        if (fieldName === null) {
            return false;
        }
        
        if (typeof(fieldName) === 'undefined') {
            return false;
        }

        return fieldName.startsWith(this.prefix);
    }
}