import axios, { CancelToken } from 'axios';


export async function decisionPropagationFIDE(xml, selection = [], deselection = []) {
    try {
        const source = CancelToken.source();
        const timeout = setTimeout(() => {
            source.cancel();
            // Timeout Logic
        }, 450);
        const content = new TextEncoder().encode(xml);
        const data = await axios.post(`${import.meta.env.VITE_APP_DOMAIN_FEATUREIDESERVICE}propagation`,
            ({
                name: 'vue' + '.xml',
                selection: selection,
                deselection: deselection,
                content: Array.from(content)
            }), { cancelToken: source.token });
        clearTimeout(timeout);
        return data.data;
    } catch (e) {

    }
}

export async function pingFIDE() {
    try {
        const source = CancelToken.source();
        const timeout = setTimeout(() => {
            source.cancel();
            // Timeout Logic
        }, 450);
        let data = await axios.get(`${import.meta.env.VITE_APP_DOMAIN_FEATUREIDESERVICE}`, { cancelToken: source.token });
        clearTimeout(timeout);
        return true;
    } catch (e) {
        return false;
    }
}

export async function changeFileFormat(text, fileExtension, newFileExtension) {
    try {
        const content = new TextEncoder().encode(text);
        let response = await axios.post(`${import.meta.env.VITE_APP_DOMAIN_FEATUREIDESERVICE}convert`, {
            name: 'hello.' + fileExtension,
            typeOutput: [newFileExtension],
            content: Array.from(content)
        });
        let contentAsString = new TextDecoder().decode(Uint8Array.from(response.data.content[0]));

        if (contentAsString.trim().toLowerCase() === text.trim().toLowerCase()) {
            return 'bad';
        }
        return contentAsString;
    } catch (e) {
        return '';
    }
}
