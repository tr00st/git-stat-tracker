import { describe, it, expect, beforeEach } from 'vitest';
import { JsonFormatter } from './JsonFormatter.js';
import { KnownRecordTypes, ReportRecord } from 'types/index.js';
import { PassThrough } from 'node:stream';

describe('JsonFormatter', () => {
    let formatter: JsonFormatter;// Mock the Writable stream
    let outputStream: PassThrough;
    let output: string;
    
    beforeEach(() => {
        formatter = new JsonFormatter();
        outputStream = new PassThrough();
        output = '';
        outputStream.on('data', (chunk) => {
            output += chunk.toString();
        });
    });

    it('should write numeric summary records to CSV format', async () => {
        const records: ReportRecord[] = [
            {
                category: 'Summary',
                subcategory: 'Numeric',
                value: 42,
                type: KnownRecordTypes.TotalLintErrors
            }
        ];

        await formatter.formatRecords(records, outputStream);
        const result = JSON.parse(output);
        expect(result).toEqual(records);
    });

    it('should include non-summary records', async () => {
        const records: ReportRecord[] = [
            {
                category: 'Summary',
                subcategory: 'Numeric',
                value: 42,
                type: KnownRecordTypes.TotalLintErrors
            },
            {
                category: 'Annotation',
                type: 'SomeFake',
                file: 'example.js',
                startLine: 0,
                endLine: 0,
                startCol: 0,
                endCol: 5
            }
        ];

        await formatter.formatRecords(records, outputStream);
        const result = JSON.parse(output);
        
        expect(result).toEqual(records);
    });

    it('should process multiple records correctly', async () => {
        const records: ReportRecord[] = [
            {
                category: 'Summary',
                subcategory: 'Numeric',
                value: 42,
                type: KnownRecordTypes.TotalLintErrors
            },
            {
                category: 'Summary',
                subcategory: 'Numeric',
                value: 10,
                type: KnownRecordTypes.TotalLintErrors
            },
            {
                category: 'Summary',
                subcategory: 'Numeric',
                value: 15,
                type: KnownRecordTypes.TotalLintErrors
            }
        ];

        await formatter.formatRecords(records, outputStream);
        const result = JSON.parse(output);
        
        expect(result).toEqual(records);
    });

    it('should handle empty record array', async () => {
        await formatter.formatRecords([], outputStream);
        
        const result = JSON.parse(output);
        
        expect(result).toEqual([]);
    });
});
