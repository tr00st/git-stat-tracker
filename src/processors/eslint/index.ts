#!/usr/bin/env node
import { AnnotationRecord, KnownRecordTypes, NumericSummaryRecord, ReportRecord } from "../../types/index.js";
import { EslintMessageSeverity, EslintReportFileEntry, EslintReportMessageEntry } from "./types.js";


const linterSeverityMap = {
    [EslintMessageSeverity.Warning]: KnownRecordTypes.LintWarning,
    [EslintMessageSeverity.Error]: KnownRecordTypes.LintError
}

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

