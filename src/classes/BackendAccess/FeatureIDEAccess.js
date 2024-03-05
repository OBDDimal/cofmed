import axios, { CancelToken } from 'axios';
import { jsonToXML } from '@/services/xmlTranspiler.service';


export async function decisionPropagationFIDE(xml, selection = [], deselection = []) {
    try {
        const source = CancelToken.source();
        const timeout = setTimeout(() => {
            source.cancel();
            // Timeout Logic
        }, 500);
        const content = new TextEncoder().encode(xml);
        const data = await axios.post(`${import.meta.env.VITE_APP_DOMAIN_FEATUREIDESERVICE}propagation`,
            {
                name: 'vue' + '.xml',
                selection: selection,
                deselection: deselection,
                content: Array.from(content)
            }, { cancelToken: source.token });
        clearTimeout(timeout);
        return data.data;
    } catch (e) {
        return false;
    }
}

export async function pingFIDE() {
    try {
        const source = CancelToken.source();
        const timeout = setTimeout(() => {
            source.cancel();
            // Timeout Logic
        }, 500);
        let data = await axios.get(`${import.meta.env.VITE_APP_DOMAIN_FEATUREIDESERVICE}`, { cancelToken: source.token });
        clearTimeout(timeout);
        return true;
    } catch (e) {
        return false;
    }
}

export async function changeFileFormat(text, fileExtension, newFileExtension) {
    try {
        const source = CancelToken.source();
        const timeout = setTimeout(() => {
            source.cancel();
            // Timeout Logic
        }, 500);
        const content = new TextEncoder().encode(text);
        let response = await axios.post(`${import.meta.env.VITE_APP_DOMAIN_FEATUREIDESERVICE}convert`, {
            name: 'hello.' + fileExtension,
            typeOutput: [newFileExtension],
            content: Array.from(content)
        }, { cancelToken: source.token });
        clearTimeout(timeout);
        let contentAsString = new TextDecoder().decode(Uint8Array.from(response.data.content[0]));
        if (contentAsString.trim().toLowerCase() === text.trim().toLowerCase()) {
            return 'bad';
        }
        return contentAsString;
    } catch (e) {
        return '';
    }
}

export async function getFeatureStats(xml) {
    try {
        const source = CancelToken.source();
        const timeout = setTimeout(() => {
            source.cancel();
            // Timeout Logic
        }, 500);
        const content = new TextEncoder().encode(xml);
        let response = await axios.post(`${import.meta.env.VITE_APP_DOMAIN_FEATUREIDESERVICE}stats`, {
            name: 'vue.xml',
            content: Array.from(content)
        }, { cancelToken: source.token });
        clearTimeout(timeout);
        return response.data;
    } catch (e) {
        return undefined;
    }
}

export async function sliceFeatureModel(xml, featureToSlice) {
    try {
        const source = CancelToken.source();
        const timeout = setTimeout(() => {
            source.cancel();
            // Timeout Logic
        }, 500);
        const content = new TextEncoder().encode(xml);
        let response = await axios.post(`${import.meta.env.VITE_APP_DOMAIN_FEATUREIDESERVICE}slice`, {
            name: 'hello.xml',
            selection: [featureToSlice],
            content: Array.from(content)
        }, { cancelToken: source.token });
        clearTimeout(timeout);
        return response.data;
    } catch (e) {
        return undefined;
    }
}
