export async function collapseAsyncGenerator<Type>(generator: AsyncGenerator<Type>) {
    const output = [];
    for await (const item of generator) {
        output.push(item);
    }
    return output;
}
