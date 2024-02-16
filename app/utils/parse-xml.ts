import { parseStringPromise } from 'xml2js';

export default async function parseXML(xmlString: string) {
    try {
        const result = await parseStringPromise(xmlString);
        const location = result.PostResponse.Location[0];
        const bucket = result.PostResponse.Bucket[0];
        return { location, bucket };
    } catch (error) {
        console.error("Error parsing XML:", error);
        throw error; // Or handle it as needed
    }
}
