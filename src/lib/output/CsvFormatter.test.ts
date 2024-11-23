import { describe, it, expect, beforeEach } from 'vitest';
import { CsvFormatter } from './CsvFormatter.js';
import { KnownRecordTypes, ReportRecord } from '../../types/index.js';
import { PassThrough } from 'node:stream';

describe('CsvFormatter', () => {
    let formatter: CsvFormatter;// Mock the Writable stream
    let outputStream: PassThrough;
    let output: string;
    
    beforeEach(() => {
        formatter = new CsvFormatter();
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
        expect(output).toBe(`${KnownRecordTypes.TotalLintErrors},42\n`);
    });

    it('should ignore non-summary records', async () => {
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
        expect(output).toBe(`${KnownRecordTypes.TotalLintErrors},42\n`);
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
        expect(output).toBe(
            `${KnownRecordTypes.TotalLintErrors},42\n` +
            `${KnownRecordTypes.TotalLintErrors},10\n` +
            `${KnownRecordTypes.TotalLintErrors},15\n`
        );
    });

    it('should handle empty record array', async () => {
        await formatter.formatRecords([], outputStream);
        expect(output).toBe('');
    });
});
