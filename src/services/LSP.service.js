import { languageServer } from 'codemirror-languageserver';
import { WebSocketTransport } from '@open-rpc/client-js';

const serverUri = 'ws://localhost:30000/uvl';
const transport = new WebSocketTransport(serverUri);

export function getLanguageServer(){
    return languageServer({
        // WebSocket server uri and other client options.
        serverUri,
        rootUri: 'file:///',

        documentUri: `file:///${filename}`,
        languageId: 'uvl'
    });
}

