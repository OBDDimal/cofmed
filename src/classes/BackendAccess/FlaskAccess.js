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

        console.log(formData.entries()[0]);

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

export async function registerHistory(files, historyName) {

    let formData = new FormData();
    for (let x = 0; x < files.length; x++) {
        let file = files[x];
        formData.append('files', file, file.name);
    }



    let data = await axios.post(`${import.meta.env.VITE_APP_DOMAIN_FLASKBACKEND}/register_history/${historyName}`, files,
        {
            headers: { 'Content-Type': files.type }
        });


    console.log(data.data)
    let data2 = await axios.post(`${import.meta.env.VITE_APP_DOMAIN_FLASKBACKEND}/history/${data.data}`, "",
        {
        });
    console.log(data2)
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
