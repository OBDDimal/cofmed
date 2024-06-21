import { CodeMirrorLanguageClient } from '@shopify/codemirror-language-client';

export async function getLanguageClient() {
    // This doesn't have to be liquid-language-server, it
    // theoretically could be tsserver.
    const worker = new Worker(
        new URL('./language-server-worker.ts', import.meta.url) //TODO get languageserverworker
    );

    // This is how you instantiate it
    const client = new CodeMirrorLanguageClient(worker);
    await client.start();

    // Demo junk to be replaced
    const filePath = `file:///featureModel.uvl`;

    // Here we add the client.extension for the file path.
    return client.extension(filePath);
}



