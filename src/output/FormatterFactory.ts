import { OutputFormats } from "processors/eslint/types.js";
import { JsonFormatter } from "./JsonFormatter.js";
import { CsvFormatter } from "./CsvFormatter.js";
import { OutputFormatter } from "./types.js";

// formatters/FormatterFactory.ts
export class FormatterFactory {
    static createFormatter(format: OutputFormats): OutputFormatter {
        switch (format) {
            case OutputFormats.Json:
                return new JsonFormatter();
            case OutputFormats.Csv:
                return new CsvFormatter();
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }
}