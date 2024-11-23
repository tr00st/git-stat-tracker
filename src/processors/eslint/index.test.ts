import {describe, expect, test} from 'vitest'
import { processReportEntries } from './index.js'
import { KnownRecordTypes } from '../../types/index.js';
import { EslintMessageSeverity, EslintReportFileEntry } from './types.js';
import { collapseAsyncGenerator } from './utils.js';

describe('processReportEntries', () => {
    test('handles empty report', async () => {
        const resultIterator = await processReportEntries([], false);
        
        const outputs = await collapseAsyncGenerator(resultIterator);
        
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
    test('handles report with messages, messages are included', async () => {
        const resultIterator = await processReportEntries([
            {
                errorCount: 1,
                warningCount: 2,
                filePath: 'index.js',
                messages: [{
                    message: 'Some dummy message',
                    severity: EslintMessageSeverity.Warning,
                    line: 1,
                    column: 2,
                    endLine: 3,
                    endColumn: 4
                }]
            }
        ], true);
        
        const outputs = await collapseAsyncGenerator(resultIterator);
        
        expect(outputs).toMatchObject([
            {
                category: "Annotation",
                endCol: 4,
                endLine: 3,
                file: "index.js",
                startCol: 2,
                startLine: 1,
                type: "LintWarning",
                message: 'Some dummy message'
            }, {
              type: KnownRecordTypes.TotalLintWarnings,
              value: 2,
              category: "Summary",
              subcategory: "Numeric"
            }, {
              type: KnownRecordTypes.TotalLintErrors,
              value: 1,
              category: "Summary",
              subcategory: "Numeric"
            },
        ]);
    });
    test('handles report with messages, but messages are excluded', async () => {
        const resultIterator = await processReportEntries([
            {
                errorCount: 1,
                warningCount: 2,
                filePath: 'index.js',
                messages: [{
                    message: 'Some dummy message',
                    severity: EslintMessageSeverity.Warning,
                    line: 0,
                    column: 0,
                    endLine: 0,
                    endColumn: 0
                }]
            }
        ], false);
        
        const outputs = await collapseAsyncGenerator(resultIterator);
        
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
    test('handles one-entry report', async () => {
        const resultIterator = await processReportEntries([
            {
                errorCount: 1,
                warningCount: 2,
                filePath: '',
                messages: []
            }
        ], false);
        
        const outputs = await collapseAsyncGenerator(resultIterator);
        
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
        const resultIterator = await processReportEntries([
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

        const outputs = await collapseAsyncGenerator(resultIterator);
        
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

        const resultIterator = await processReportEntries(entries, false);
        const outputs = await collapseAsyncGenerator(resultIterator);
        
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
