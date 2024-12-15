import { expect, describe, it } from 'vitest';
import { PrefixFieldMapper } from './fieldMapping';

describe('PrefixFieldMapper', () => {
    describe('constructor', () => {
        it('should create a new instance with the given prefix', () => {
            const mapper = new PrefixFieldMapper('test_');
            expect(mapper).toBeInstanceOf(PrefixFieldMapper);
            expect(mapper.prefix).toBe('test_');
        });
        it('should throw an error when prefix is null', () => {
            expect(() => new PrefixFieldMapper(null)).toThrow('Prefix cannot be null');
        });
        it('should throw an error when prefix is empty', () => {
            expect(() => new PrefixFieldMapper('')).toThrow('Prefix cannot be empty');
        })
    });

    describe('toStorageFieldName', () => {
        const mapper = new PrefixFieldMapper('test_');

        it('should return the attribute with prefix added', () => {
            expect(mapper.toStorageFieldName('testField')).toBe('test_testField');
        });

        it('should handle double-prefixing fine', () => {
            expect(mapper.toStorageFieldName('test_testField')).toBe('test_test_testField');
        });

        it('should handle special characters in the prefix', () => {
            const mapper = new PrefixFieldMapper('test_$£%_');
            expect(mapper.toStorageFieldName('field')).toBe('test_$£%_field');
        });
        
        it('should handle special characters in field names', () => {
            expect(mapper.toStorageFieldName('$£%_field')).toBe('test_$£%_field');
        });

        it('should handle emoji in the prefix', () => {
            const mapper = new PrefixFieldMapper('🙂_');
            expect(mapper.toStorageFieldName('field')).toBe('🙂_field');
        });

        it('should handle emoji in field names', () => {
            expect(mapper.toStorageFieldName('🙂')).toBe('test_🙂');
        });

        it('should handle empty field names', () => {
            expect(mapper.toStorageFieldName('')).toBe('test_');
        });

        it('should handle partial prefix matches correctly', () => {
            expect(mapper.toStorageFieldName('te_field')).toBe('test_te_field');
        });
    });

    describe('fromStorageFieldName', () => {
        const mapper = new PrefixFieldMapper('test_');
        it('should return the attribute name without the prefix', () => {
            expect(mapper.fromStorageFieldName('test_testField')).toBe('testField');
        });

        it('should handle double-prefixing fine', () => {
            expect(mapper.fromStorageFieldName('test_test_testField')).toBe('test_testField');
        });

        it('should handle special characters in the prefix', () => {
            const mapper = new PrefixFieldMapper('test_$£%_');
            expect(mapper.fromStorageFieldName('test_$£%_field')).toBe('field');
        });

        it('should handle special characters in field names', () => {
            expect(mapper.fromStorageFieldName('test_$£%_field')).toBe('$£%_field');
        });

        it('should handle emoji in the prefix', () => {
            const mapper = new PrefixFieldMapper('🙂_');
            expect(mapper.fromStorageFieldName('🙂_field')).toBe('field');
        });

        it('should handle emoji in field names', () => {
            expect(mapper.fromStorageFieldName('test_🙂')).toBe('🙂');
        });

        it('should handle empty field names', () => {
            expect(mapper.fromStorageFieldName('test_')).toBe('');
        });

        it('should handle partial prefix matches correctly', () => {
            expect(mapper.fromStorageFieldName('test_te_field')).toBe('te_field');
        });
    });

    describe('isDataField', () => {
        const mapper = new PrefixFieldMapper('test_');
        it('should return true for fields that start with the prefix', () => {
            expect(mapper.isDataField('test_field')).toBe(true);
        });

        it('should handle special characters in the prefix', () => {
            const mapper = new PrefixFieldMapper('test_$£%_');
            expect(mapper.isDataField('test_$£%_field')).toBe(true);
        })

        it('should handle special characters in field names', () => {
            expect(mapper.isDataField('test_$£%_field')).toBe(true);
        })

        it('should handle emoji field names', () => {
            expect(mapper.isDataField('test_🙂')).toBe(true);
        })

        it('should handle emoji prefixes', () => {
            const mapper = new PrefixFieldMapper('🙂_');
            expect(mapper.isDataField('🙂_field')).toBe(true);
        });

        it('should return true for fields that have the prefix twice', () => {
            expect(mapper.isDataField('test_test_field')).toBe(true);
        });

        it('should return false for fields that do not start with the prefix', () => {
            expect(mapper.isDataField('other_field')).toBe(false);
        });

        it('should return true for fields that are just the prefix - ie: empty field name', () => {
            expect(mapper.isDataField('test_')).toBe(true);
        });

        it('should return false for empty field names', () => {
            expect(mapper.isDataField('')).toBe(false);
        });

        it('should return false for null field names', () => {
            expect(mapper.isDataField(null)).toBe(false);
        });

        it('should return false for undefined field names', () => {
            expect(mapper.isDataField(undefined)).toBe(false);
        });

        it('should return false if prefix isn\'t at the start', () => {
            expect(mapper.isDataField('field_test_wrong_place')).toBe(false);
        })
    });
});
