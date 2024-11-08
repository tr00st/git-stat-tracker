import {describe, expect, test} from '@jest/globals'
import { sumMetricCounts } from './index'

describe('sumMetricCounts', () => {
    test('handles empty report', async () => {
        const results = await sumMetricCounts([]);
        expect((await results).totalErrors).toBe(0);
        expect((await results).totalWarnings).toBe(0);
    });
});