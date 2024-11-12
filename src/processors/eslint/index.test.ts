import {describe, expect, test} from 'vitest'
import { EslintReportFileEntry, sumMetricCounts } from './index.js'
import { KnownRecordTypes, ReportRecord } from 'types/reportRecords.js';

describe('sumMetricCounts', () => {
    test('handles empty report', async () => {
        const resultIterator = await sumMetricCounts([], false);
        
        const outputs = await iteratorToArray(resultIterator);
        
        expect(outputs).toMatchObject([
            {
              type: KnownRecordTypes.TotalLintWarnings,
              value: 0,
              category: "Summary",
              subcategory: "Numeric"
            }, {
              type: KnownRecordTypes.TotalLintErrors,
              value: 0,
              category: "Summary",
              subcategory: "Numeric"
            }
        ]);
    });
    test('handles one-entry report', async () => {
        const resultIterator = await sumMetricCounts([
            {
                errorCount: 1,
                warningCount: 2,
                filePath: '',
                messages: []
            }
        ], false);
        
        const outputs = await iteratorToArray(resultIterator);
        
        expect(outputs).toMatchObject([
            {
              type: KnownRecordTypes.TotalLintWarnings,
              value: 2,
              category: "Summary",
              subcategory: "Numeric"
            }, {
              type: KnownRecordTypes.TotalLintErrors,
              value: 1,
              category: "Summary",
              subcategory: "Numeric"
            }
        ]);
    });
    test('handles three-entry report', async () => {
        const resultIterator = await sumMetricCounts([
            {
                errorCount: 1,
                warningCount: 2,
                filePath: '',
                messages: []
            },
            {
                errorCount: 2,
                warningCount: 3,
                filePath: '',
                messages: []
            },
            {
                errorCount: 3,
                warningCount: 4,
                filePath: '',
                messages: []
            },
        ], false);

        const outputs = await iteratorToArray(resultIterator);
        
        expect(outputs).toMatchObject([
            {
              type: KnownRecordTypes.TotalLintWarnings,
              value: 9,
              category: "Summary",
              subcategory: "Numeric"
            }, {
              type: KnownRecordTypes.TotalLintErrors,
              value: 6,
              category: "Summary",
              subcategory: "Numeric"
            }
        ]);
    });
    test('handles hundred-entry report', async () => {
        const entries : EslintReportFileEntry[] = [];
        for (let i = 0; i < 100; i++) {
            entries.push({
                errorCount: 1,
                warningCount: 2,
                filePath: `dummyFile{i}.js`,
                messages: []
            });
        }

        const resultIterator = await sumMetricCounts(entries, false);
        const outputs = await iteratorToArray(resultIterator);
        
        expect(outputs).toMatchObject([
            {
              type: KnownRecordTypes.TotalLintWarnings,
              value: 200,
              category: "Summary",
              subcategory: "Numeric"
            }, {
              type: KnownRecordTypes.TotalLintErrors,
              value: 100,
              category: "Summary",
              subcategory: "Numeric"
            }
        ]);
    });
});
async function iteratorToArray(resultIterator: AsyncGenerator<ReportRecord>) {
    const outputs = [];
    for await (const result of resultIterator) {
        outputs.push(result);
    }
    return outputs;
}

