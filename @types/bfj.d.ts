declare module "bfj" {
    export function walk(stream: NodeJS.ReadableStream, options: {
        bufferLength?: number,
        ndjson?: boolean,
        stringChunkSize?: number,
        yieldRate?: number
    }) : Promise<unknown>;
    export function match (
        stream: NodeJS.ReadableStream,
        selector: RegExp | string | ((key: string, value: unknown, depth: number) => boolean),
        options?: {
            minDepth?: number;
            numbers?: boolean;
            ndjson?: boolean;
            recursive?: boolean;
            yieldRate?: number;
            bufferLength?: number;
            highWaterMark?: number;
        }
    ) : NodeJS.ReadableStream<unknown>;
    export async function parse(
        stream: NodeJS.ReadableStream,
        options?: {
            reviver?: (key: string, value: unknown) => unknown;
            yieldRate?: number;
            ndjson?: boolean;
        }
    ): Promise<unknown>;

    export function unpipe(
        callback: (error: Error | null, result: unknown) => void,
        options?: {
            reviver?: (key: string, value: unknown) => unknown;
            discard?: number;
            yieldRate?: number;
        }
    ): NodeJS.WritableStream;

    export function read(
        path: string,
        options?: {
            reviver?: (key: string, value: unknown) => unknown;
            yieldRate?: number;
        }
    ): Promise<unknown>;

        
    export function eventify(
        data: unknown,
        options?: {
            promises?: 'resolve' | 'ignore';
            buffers?: 'toString' | 'ignore';
            maps?: 'object' | 'ignore';
            iterables?: 'array' | 'ignore';
            circular?: 'error' | 'ignore';
            yieldRate?: number;
        }
    ): NodeJS.EventEmitter;

    export function streamify(
        data: unknown,
        options?: {
            space?: string | number;
            promises?: 'resolve' | 'ignore';
            buffers?: 'toString' | 'ignore';
            maps?: 'object' | 'ignore';
            iterables?: 'array' | 'ignore';
            circular?: 'error' | 'ignore';
            yieldRate?: number;
            bufferLength?: number;
            highWaterMark?: number;
        }
    ): NodeJS.ReadableStream;

    export function stringify(
        data: unknown,
        options?: {
            space?: string | number;
            promises?: 'resolve' | 'ignore';
            buffers?: 'toString' | 'ignore';
            maps?: 'object' | 'ignore';
            iterables?: 'array' | 'ignore';
            circular?: 'error' | 'ignore';
            yieldRate?: number;
            bufferLength?: number;
            highWaterMark?: number;
        }
    ): Promise<string>;

    export function write(
        path: string,
        data: unknown,
        options?: {
            space?: string | number;
            promises?: 'resolve' | 'ignore';
            buffers?: 'toString' | 'ignore';
            maps?: 'object' | 'ignore';
            iterables?: 'array' | 'ignore';
            circular?: 'error' | 'ignore';
            yieldRate?: number;
            bufferLength?: number;
            highWaterMark?: number;
        }
    ): Promise<void>;

    export interface events {
        array: 'arr';
        object: 'obj';
        property: 'pro';
        string: 'str';
        stringChunk: 'str-chunk';
        number: 'num';
        literal: 'lit';
        endPrefix: 'end-';
        end: 'end';
        error: 'err';
        endArray: 'end-arr';
        endObject: 'end-obj';
        endLine: 'end-line';
        dataError: 'err-data';
    }
}
