import FormData from 'form-data';
import axios from 'axios';
import * as fs from 'fs';

export default async function uploadFile(url: string, parameters: any, filePath: any) {
    // Create a new FormData object
    const formData = new FormData();
    formData.append('key', parameters.find((param: any) => param.name === 'key')?.value);
    formData.append('x-goog-credential', parameters.find((param : any) => param.name === 'x-goog-credential')?.value);
    formData.append('x-goog-algorithm', parameters.find((param: any) => param.name === 'x-goog-algorithm')?.value);
    formData.append('x-goog-date', parameters.find((param: any) => param.name === 'x-goog-date')?.value);
    formData.append('x-goog-signature', parameters.find((param: any) => param.name === 'x-goog-signature')?.value);
    formData.append('policy', parameters.find((param: any) => param.name === 'policy')?.value);
    formData.append('acl', parameters.find((param: any) => param.name === 'acl')?.value);
    formData.append('Content-Type', parameters.find((param: any) => param.name === 'Content-Type')?.value);
    formData.append('success_action_status', parameters.find((param: any) => param.name === 'success_action_status')?.value);
    formData.append('file', fs.createReadStream(filePath));

    try {
        // Make a POST request to the URL
        const upload = await axios(url, {
            method: 'POST',
            data: formData,
            headers: formData.getHeaders(),
        });
        
        return upload.data

    } catch (error) {
        console.error(error);
    }
}