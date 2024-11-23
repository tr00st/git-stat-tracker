/**
 * Collapses an async generator down to an array of entries.
 * @param generator An async generator to be collapsed.
 * @returns The array output by the generator provided.
 * @typeParam Type The type of items yielded by the generator and contained in the output array.
 */
export async function collapseAsyncGenerator<Type>(generator: AsyncGenerator<Type>) {
    const output = [];
    for await (const item of generator) {
        output.push(item);
    }
    return output;
}
