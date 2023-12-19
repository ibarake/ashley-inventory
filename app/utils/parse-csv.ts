import { parse } from "csv-parse";
import fs from "fs";

export async function parseCSVFromFile(filePath: string) {
  return new Promise(async (resolve) => {
    const records: {
      Handle: string;
      Title: string;
      SKU: string;
      Available: string;
      Status: string;
      Fecha_Disponible: string;
    }[] = [];
    const parser = fs.createReadStream(filePath).pipe(
      parse({
        delimiter: ",",
        from: 2, // skip csv header,
        cast: true,
      })
    );

    for await (const record of parser) {
      // Work with each record
      records.push({
        Handle: record[0],
        Title: record[1],
        SKU: record[2],
        Available: record[3],
        Status: record[4],
        Fecha_Disponible: record[5],
      });
    }

    fs.rm(filePath, () => {
      return resolve(records);
    });
  });
}
