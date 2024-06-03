import { WebSocketMessageReader, WebSocketMessageWriter, toSocket } from "vscode-ws-jsonrpc";
import { CloseAction, ErrorAction } from "vscode-languageclient";
import { MonacoLanguageClient } from "monaco-languageclient";
import { HELLO_LANG_EXTENSION, HELLO_LANG_ID } from '@/classes/constants';
import * as monaco from 'monaco-editor';

const LS_WS_URL = 'ws://localhost:30000/uvl'
export function connectToLs() {
    return new Promise((resolve, reject) => {
        const webSocket = new WebSocket(LS_WS_URL);
        webSocket.onopen = () => {
            console.log('LS WebSocket connection Open');
            const socket = toSocket(webSocket);
            const reader = new WebSocketMessageReader(socket);
            const writer = new WebSocketMessageWriter(socket);
            const languageClient = new MonacoLanguageClient({
                name: `${HELLO_LANG_ID} Language Client`,
                clientOptions: {
                    documentSelector: [HELLO_LANG_ID],
                    errorHandler: {
                        error: () => ({ action: ErrorAction.Continue }),
                        closed: () => ({ action: CloseAction.DoNotRestart })
                    }
                },
                connectionProvider: {
                    get: () => Promise.resolve({reader, writer}),
                },
            });

            languageClient.start();
            resolve(languageClient);
        }

        webSocket.onerror = (error) => {
            console.log('LS WebSocket connection Open');
            reject(error);
        }
    });
}



export const registerLanguage = () => {
    monaco.languages.register({
        id: HELLO_LANG_ID,
        aliases: [HELLO_LANG_ID],
        extensions: [HELLO_LANG_EXTENSION]
    });
}

export const createModel = () => monaco.editor.createModel(
    '',
    HELLO_LANG_ID,
    monaco.Uri.parse(
        `file:///hello-${Math.random()}${HELLO_LANG_EXTENSION}`
    )
);
