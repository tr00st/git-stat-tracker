/**
 * Module containing an EsLint parser. Has tools for reading EsLint's JSON-format report files, and outputting them in
 * our object format. CLI can then output these in supported formats.
 * @module
 */

import { AnnotationRecord, KnownRecordTypes, NumericSummaryRecord, ReportRecord } from "../../types/index.js";
import { EslintMessageSeverity, EslintReportFileEntry, EslintReportMessageEntry } from "./types.js";


/**
 * Maps EsLint's severity values to our own message record types.
 */
const linterSeverityMap = {
    [EslintMessageSeverity.Warning]: KnownRecordTypes.LintWarning,
    [EslintMessageSeverity.Error]: KnownRecordTypes.LintError
}

/**
 * Processes ESLint report entries and generates summary metrics. Primary entrypoint for this module.
 * @param dataStream - Stream of ESLint report file entries to process
 * @param includeMessages - Whether to include individual lint messages in output
 * @returns AsyncIterable that yields annotation records for each lint message (if includeMessages=true) 
 *          and summary records for total warnings and errors
 */
export const sumMetricCounts = async function* (dataStream: AsyncIterable<EslintReportFileEntry> | EslintReportFileEntry[], includeMessages: boolean): AsyncIterable<ReportRecord> {
    let totalErrors = 0;
    let totalWarnings = 0;

    for await (const fileEntry of dataStream) {
        totalErrors += fileEntry.errorCount ?? 0;
        totalWarnings += fileEntry.warningCount ?? 0;
        if (includeMessages) {
            const messages: EslintReportMessageEntry[] = fileEntry.messages;
            for (const messageEntry of messages) {
                const outputMessageEntry: AnnotationRecord = {
                    type: linterSeverityMap[messageEntry.severity],
                    file: fileEntry.filePath,
                    startLine: messageEntry.line,
                    endLine: messageEntry.endLine,
                    startCol: messageEntry.column,
                    endCol: messageEntry.endColumn,
                    category: "Annotation",
                    message: messageEntry.message
                };
                yield outputMessageEntry;
            }
        }
    }
    yield {
        type: KnownRecordTypes.TotalLintWarnings,
        value: totalWarnings,
        category: "Summary",
        subcategory: "Numeric"
    };
    yield {
        type: KnownRecordTypes.TotalLintErrors,
        value: totalErrors,
        category: "Summary",
        subcategory: "Numeric"
    };
};

