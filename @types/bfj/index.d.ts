import { Readable } from "stream"

export function walk(stream: NodeJS.ReadableStream, options: {
    bufferLength?: number,
    ndjson?: boolean,
    stringChunkSize?: number,
    yieldRate?: number
}) : Promise<any>;
export function match (
    stream: NodeJS.ReadableStream,
    selector: RegExp | string | ((key: string, value: any, depth: number) => boolean),
    options?: {
        minDepth?: number;
        numbers?: boolean;
        ndjson?: boolean;
        recursive?: boolean;
        yieldRate?: number;
        bufferLength?: number;
        highWaterMark?: number;
    }
) : NodeJS.ReadableStream<any>;
export async function parse(
    stream: NodeJS.ReadableStream,
    options?: {
        reviver?: (key: string, value: any) => any;
        yieldRate?: number;
        ndjson?: boolean;
    }
): Promise<any>;

export function unpipe(
    callback: (error: Error | null, result: any) => void,
    options?: {
        reviver?: (key: string, value: any) => any;
        discard?: number;
        yieldRate?: number;
    }
): NodeJS.WritableStream;

export function read(
    path: string,
    options?: {
        reviver?: (key: string, value: any) => any;
        yieldRate?: number;
    }
): Promise<any>;

    
export function eventify(
    data: any,
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
    data: any,
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
    data: any,
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
    data: any,
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

