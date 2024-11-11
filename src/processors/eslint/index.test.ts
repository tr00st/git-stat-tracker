import {describe, expect, test} from 'vitest'
import { EslintReportEntry, sumMetricCounts } from './index.js'

describe('sumMetricCounts', () => {
    test('handles empty report', async () => {
        const results = await sumMetricCounts([]);
        expect((await results).totalErrors).toBe(0);
        expect((await results).totalWarnings).toBe(0);
    });
    test('handles one-entry report', async () => {
        const results = await sumMetricCounts([
            {
                errorCount: 1,
                warningCount: 2
            }
        ]);
        expect((await results).totalErrors).toBe(1);
        expect((await results).totalWarnings).toBe(2);
    });
    test('handles three-entry report', async () => {
        const results = await sumMetricCounts([
            { errorCount: 1, warningCount: 2 },
            { errorCount: 2, warningCount: 3 },
            { errorCount: 3, warningCount: 4 },
        ]);
        expect((await results).totalErrors).toBe(6);
        expect((await results).totalWarnings).toBe(9);
    });
    test('handles hundred-entry report', async () => {
        const entries : EslintReportEntry[] = [];
        for (let i = 0; i < 100; i++) {
            entries.push({ errorCount: 1, warningCount: 2 });
        }
        const results = await sumMetricCounts(entries);
        expect((await results).totalErrors).toBe(100);
        expect((await results).totalWarnings).toBe(200);
    });
});
