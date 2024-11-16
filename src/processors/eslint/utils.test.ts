import {describe, expect, test} from 'vitest'
import { collapseAsyncGenerator } from './utils.js';

describe('collapseAsyncGenerator', () => {
    test('handles one null', async () => {
        const mockIterator = async function* () {
            yield null;
        };
        
        const outputs = await collapseAsyncGenerator(mockIterator());
        
        expect(outputs).toMatchObject([null]);
    });

    test('handles multiple values', async () => {
        const mockIterator = async function* () {
            yield 1;
            yield 2;
            yield 3;
        };
        
        const outputs = await collapseAsyncGenerator(mockIterator());
        
        expect(outputs).toEqual([1, 2, 3]);
    });

    test('handles empty generator', async () => {
        const mockIterator = async function* () {};
        
        const outputs = await collapseAsyncGenerator(mockIterator());
        
        expect(outputs).toEqual([]);
    });

    test('handles mixed types', async () => {
        const mockIterator = async function* () {
            yield 'string';
            yield 42;
            yield { key: 'value' };
            yield null;
            yield undefined;
        };
        
        const outputs = await collapseAsyncGenerator(mockIterator());
        
        expect(outputs).toEqual([
            'string',
            42,
            { key: 'value' },
            null,
            undefined
        ]);
    });

    test('handles delayed yields', async () => {
        const mockIterator = async function* () {
            yield 1;
            await new Promise(resolve => setTimeout(resolve, 10));
            yield 2;
            await new Promise(resolve => setTimeout(resolve, 10));
            yield 3;
        };
        
        const outputs = await collapseAsyncGenerator(mockIterator());
        
        expect(outputs).toEqual([1, 2, 3]);
    });

    test('handles error in generator', async () => {
        const mockIterator = async function* () {
            yield 1;
            throw new Error('Generator error');
        };
        
        await expect(collapseAsyncGenerator(mockIterator()))
            .rejects
            .toThrow('Generator error');
    });

    test('handles 1M entries with performance check', async () => {
        const startTime = performance.now();
        const expectedOutputs : number[] = [];
        const mockIterator = async function* () {
            for (let i = 0; i < 1_000_000; i++) {
                expectedOutputs.push(i);
                yield i;
            }
        };
        
        const outputs = await collapseAsyncGenerator(mockIterator());
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        expect(outputs).toHaveLength(1_000_000);
        expect(outputs[0]).toBe(0);
        expect(outputs[999_999]).toBe(999_999);
        expect(outputs).toEqual(expectedOutputs);
        
        expect(executionTime).toBeLessThan(5000); // 5 seconds max
    }, 10000); // Increase timeout to 10 seconds for this test

    test('handles alternating types with full validation', async () => {
        const expectedOutputs: Array<number | string> = [];
        const mockIterator = async function* () {
            for (let i = 0; i < 1000; i++) {
                const value = i % 2 === 0 ? i : `string-${i}`;
                expectedOutputs.push(value);
                yield value;
            }
        };
        
        const outputs = await collapseAsyncGenerator(mockIterator());
        
        expect(outputs).toHaveLength(1000);
        expect(outputs).toEqual(expectedOutputs);
    });

    test('handles async batch with delays and full validation', async () => {
        const expectedOutputs: number[] = [];
        const mockIterator = async function* () {
            for (let i = 0; i < 1000; i++) {
                if (i % 100 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 1));
                }
                expectedOutputs.push(i);
                yield i;
            }
        };
        
        const outputs = await collapseAsyncGenerator(mockIterator());
        
        expect(outputs).toHaveLength(1000);
        expect(outputs).toEqual(expectedOutputs);
    });
});

