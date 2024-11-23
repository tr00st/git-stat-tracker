import { Transform, TransformCallback } from "stream";

export class TypedTransform<T> extends Transform {
    constructor(options = {}) {
        super({
            ...options,
            objectMode: true
        });
    }

    _transform(chunk: { value: T; }, _encoding: string, callback: TransformCallback) {
        try {
            const typedData: T = chunk.value;
            this.push(typedData);
            callback();
        } catch (error) {
            if (error instanceof Error) {
                callback(error);
            } else if (typeof error === 'string') {
                callback(new Error(error));
            } else {
                callback(new Error('An unknown error occurred'));
            }
        }
    }
}
