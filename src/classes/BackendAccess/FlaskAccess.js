import axios, { CancelToken } from 'axios';

let ident = '';

export async function decisionPropagationFL(file, selection = [], deselection = []) {
    if (ident === '') {

        let formData = new FormData();
        let length = file.target.files.length;
        let files = file.target.files;

        for (let x = 0; x < length; x++) {
            formData.append('files[]', file[x]);
        }


        const source = CancelToken.source();
        const timeout = setTimeout(() => {
            source.cancel();
            // Timeout Logic
        }, 450);

        let data = await axios.post(`${import.meta.env.VITE_APP_DOMAIN_FLASKBACKEND}register_formula`, formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
                cancelToken: source.token
            });
        clearTimeout(timeout);
    }
}

export async function pingFL() {
    try {
        const source = CancelToken.source();
        const timeout = setTimeout(() => {
            source.cancel();
            // Timeout Logic
        }, 450);
        await axios.get(`${import.meta.env.VITE_APP_DOMAIN_FLASKBACKEND}`, { cancelToken: source.token });
        clearTimeout(timeout);
        return true;
    } catch (e) {
        return false;
    }
}

export async function getFeaturesAndVersionFromHistory(ident) {
    try {
        const source = CancelToken.source();
        const timeout = setTimeout(() => {
            source.cancel();
            // Timeout Logic
        }, 2000);

        let data = await axios.post(`${import.meta.env.VITE_APP_DOMAIN_FLASKBACKEND}/history/${ident}`, '',
            { cancelToken: source.token });

        clearTimeout(timeout);
        return data.data;
    } catch (e) {
        return undefined;
    }
}


export async function registerHistory(files, historyName) {
    try {

        let formData = new FormData();
        for (let x = 0; x < files.length; x++) {
            let file = files[x];
            formData.append('files', file, file.name);
        }

        for (const value of formData.entries()) {
            console.log(value);
        }

        const source = CancelToken.source();
        const timeout = setTimeout(() => {
            source.cancel();
            // Timeout Logic
        }, 5000);

        let data = await axios.post(`${import.meta.env.VITE_APP_DOMAIN_FLASKBACKEND}/register_history/${historyName}`, files,
            {
                headers: { 'Content-Type': files.type },
                cancelToken: source.token
            });

        clearTimeout(timeout);
        return data.data;
    } catch (e) {
        return undefined;
    }
}

export async function getExample() {
    try {
                const source = CancelToken.source();
        const timeout = setTimeout(() => {
            source.cancel();
            // Timeout Logic
        }, 5000);

        let data = await axios.get(`${import.meta.env.VITE_APP_DOMAIN_FLASKBACKEND}/example`,
            {
                cancelToken: source.token
            });

        clearTimeout(timeout);
        return data.data;
    } catch (e) {
        return undefined;
    }
}


export async function decisionPropagationMulti(ident, features, versions) {
    try {
        const source = CancelToken.source();
        const timeout = setTimeout(() => {
            source.cancel();
            // Timeout Logic
        }, 5000);

        let data = await axios.post(`${import.meta.env.VITE_APP_DOMAIN_FLASKBACKEND}/history/${ident}/configure`, {
                config: features,
                versions: versions
            },
            { cancelToken: source.token });

        clearTimeout(timeout);
        return data.data;
    } catch (e) {
        return undefined;
    }
}
