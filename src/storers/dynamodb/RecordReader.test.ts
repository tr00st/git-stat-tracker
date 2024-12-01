import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RecordReader } from './RecordReader.js';
import { createReadStream, ReadStream } from 'fs';
import { ReportRecord, SummaryRecord } from '../../types';
import { PassThrough } from 'stream';

// Mock the fs module
vi.mock('fs');

describe('RecordReader', () => {
    // Sample test data
    const sampleRecord: SummaryRecord = {
        type: '',
        category: 'Summary',
        subcategory: 'Numeric',
        value: 0
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('readRecords', () => {
        it('should successfully read records from a file', async () => {
            const mockStream = new PassThrough();
            mockStream.pipe = vi.fn().mockReturnThis();
            
            Object.defineProperty(mockStream, Symbol.asyncIterator, {
                value: async function* () {
                    yield sampleRecord;
                }
            });
            
            vi.mocked(createReadStream).mockReturnValue(mockStream as unknown as ReadStream);

            const records: ReportRecord[] = [];
            for await (const record of RecordReader.readRecords('test.json')) {
                records.push(record);
            }

            expect(records).toHaveLength(1);
            expect(records[0]).toEqual(sampleRecord);
            expect(createReadStream).toHaveBeenCalledWith('test.json');
        });

        it('should handle empty files', async () => {
            const mockStream = new PassThrough();
            mockStream.pipe = vi.fn().mockReturnThis();
            
            Object.defineProperty(mockStream, Symbol.asyncIterator, {
                value: async function* () {
                    // Empty generator
                }
            });
            
            vi.mocked(createReadStream).mockReturnValue(mockStream as unknown as ReadStream);

            const records: ReportRecord[] = [];
            for await (const record of RecordReader.readRecords('empty.json')) {
                records.push(record);
            }

            expect(records).toHaveLength(0);
        });

        it('should handle file read errors', async () => {
            const mockError = new Error('File read error');
            vi.mocked(createReadStream).mockImplementation(() => {
                throw mockError;
            });

            await expect(async () => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                for await (const _ of RecordReader.readRecords('error.json')) {
                    // Should not reach here
                    expect.unreachable('Should throw an error');
                }
            }).rejects.toThrow('File read error');
        });
    });

    describe('bulkReadRecords', () => {
        it('should read records from multiple files', async () => {
            const mockStream = new PassThrough();
            mockStream.pipe = vi.fn().mockReturnThis();
            
            Object.defineProperty(mockStream, Symbol.asyncIterator, {
                value: async function* () {
                    yield sampleRecord;
                }
            });
            
            vi.mocked(createReadStream).mockReturnValue(mockStream as unknown as ReadStream);

            const files = ['file1.json', 'file2.json'];
            const records: ReportRecord[] = [];
            
            for await (const record of RecordReader.bulkReadRecords(files)) {
                records.push(record);
            }

            expect(records).toHaveLength(2);
            expect(records).toEqual([sampleRecord, sampleRecord]);
            expect(createReadStream).toHaveBeenCalledTimes(2);
            expect(createReadStream).toHaveBeenCalledWith('file1.json');
            expect(createReadStream).toHaveBeenCalledWith('file2.json');
        });

        it('should handle errors in bulk reading', async () => {
            const mockStream = new PassThrough();
            mockStream.pipe = vi.fn().mockReturnThis();
            
            Object.defineProperty(mockStream, Symbol.asyncIterator, {
                // eslint-disable-next-line require-yield
                value: async function* () {
                    throw new Error('Read error');
                }
            });
            
            vi.mocked(createReadStream).mockReturnValue(mockStream as unknown as ReadStream);

            await expect(async () => {
                for await (const _ of RecordReader.bulkReadRecords(['file1.json'])) {
                    // Should not reach here
                }
            }).rejects.toThrow('Read error');
        });
    });
});
