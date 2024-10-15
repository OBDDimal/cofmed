import axios, { CancelToken } from 'axios';

var data;

let pyodide = await loadPyodide();

async function loadAndRunPython() {
    try {
        

        let pythonCode = await fetch("backend/app.py").then(res => res.text());
        
        
        await pyodide.runPythonAsync(pythonCode);
    } catch (error) {
        console.error("Fehler beim Laden und Ausführen des Python-Codes:", error);
    }
}


await loadAndRunPython();

/*
async function convertFileToBytes(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result));
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}


async function convertFileListToArray(fileList) {
    let filesArray = [];
    
    for (let i = 0; i < fileList.length; i++) {
        let file = fileList[i];
        const fileBytes = await convertFileToBytes(file);
        const filePath = `/tmp/${file.name}`;
        
        
        pyodide.FS.writeFile(filePath, fileBytes);
        
        filesArray.push({
            name: file.name,
            path: filePath, 
            size: file.size,
            type: file.type
        });
    }

    return filesArray;
}
*/


async function callPythonFunction(funcName, ...args) {
    try {
       
        let pythonFunc = pyodide.globals.get(funcName);
        let result = pythonFunc(...args); 
        
        return result;
    } catch (error) {
        console.error("Fehler beim Aufruf der Python-Funktion:", error);
        return null;
    }
}






let ident = '';

export async function decisionPropagationFL(file, selection = [], deselection = []) {
    
    if (ident === '') {

       

        let formData = new FormData();
        let length = file.target.files.length;
        let files = file.target.files;

        for (let x = 0; x < length; x++) {
            formData.append('files[]', file[x]);
        }


        let data = await callPythonFunction('register_file', formData);




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
        
        let data = await callPythonFunction('view_history', ident);

        let jsData = data.toJs();

        
        

        let obj = Object.fromEntries(jsData);


        obj.mapping = Object.fromEntries(obj.mapping);
        
        
        return obj;
    } catch (e) {
        return undefined;
    }
}


export async function registerHistory(files, historyName) {
    try {

        
        for (let i = 0; i < files.length; i++){
            let fileText = await files[i].text();
            pyodide.FS.writeFile(`/tmp/${files[i].name}`, fileText);
        }

        
        

        
        //let data = await callPythonFunction('register_history', historyName, convertFileListToArray(files));
        let data = await callPythonFunction('register_history', historyName);

        
        return data
    } catch (e) {
        return undefined;
    }
}

export async function getExample() {
    try {
        
               
        const fileUrls = [
            "backend/testdata/fiasco-2018-02-09_09-07-43.dimacs",
            "backend/testdata/fiasco-2018-02-09_09-07-44.dimacs",
            "backend/testdata/fiasco-2018-02-09_09-07-45.dimacs"
        ];
          
        try {
            
            for (let url of fileUrls) {
                const response = await fetch(url);
            
            
                if (!response.ok) {
                    throw new Error(`HTTP-Fehler! Status: ${response.status} für ${url}`);
                }
            
            
                const fileText = await response.text();
            
            
                const fileName = url.split("/").pop();
            
            
                pyodide.FS.writeFile(`/tmp/${fileName}`, fileText);
            
            }
        
           
        
        } catch (error) {
            console.error("Fehler beim Laden der Dateien:", error);
        }
        
        

        
        
        let data = await callPythonFunction('get_example');

        return data;
    } catch (e) {
        return undefined;
    }
}


export async function decisionPropagationMulti(ident, features, versions) {
    try {
        
        let data = await callPythonFunction('configure', ident, features, versions);

        
        let jsData = data.toJs();

        


        let obj = Object.fromEntries(jsData);

        return obj
    } catch (e) {
        return undefined;
    }
}





































