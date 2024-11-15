

export enum EslintMessageSeverity {
    Warning = 1,
    Error = 2
}
export interface EslintReportMessageEntry {
    message: string;
    severity: EslintMessageSeverity;
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
}
export interface EslintReportFileEntry {
    filePath: string;
    errorCount: number;
    warningCount: number;
    messages: EslintReportMessageEntry[];
}

export enum OutputFormats {
    Json = "json",
    Csv = "csv"
};

export interface CliArguments {
    inputFile?: string,
    outputFormat?: OutputFormats,
    outputFile: string,
    includeMessages: boolean
};