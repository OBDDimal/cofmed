import { CodeMirrorLanguageClient } from '@shopify/codemirror-language-client';

export async function getLanguageClient() {
    // This doesn't have to be liquid-language-server, it
    // theoretically could be tsserver.
    const worker = new Worker(
        new URL('./language-server-worker.ts', import.meta.url)
    );

    // This is how you instantiate it
    const client = new CodeMirrorLanguageClient(worker);
    await client.start();

    // Demo junk to be replaced
    const filePath = 'ws://localhost:30000/uvl'; //TODO find out correct path

    // Here we add the client.extension for the file path.
    return client.extension(filePath);
}



