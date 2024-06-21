import { languageServer } from 'codemirror-languageserver';

const serverUri = 'ws://localhost:30000/uvl';

export function getLanguageServer(){
    return languageServer({
        // WebSocket server uri and other client options.
        serverUri,
        rootUri: 'file:///',

        documentUri: `file:///featureModel.uvl`,
        languageId: 'uvl'
    });
}

