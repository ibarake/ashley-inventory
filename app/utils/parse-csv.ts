import { parse } from "csv-parse";
import fs from "fs";

export async function parseCSVFromFile(filePath: string) {
  return new Promise(async (resolve) => {
    const records: {
      Id: string;
      Title: string;
      SKU: string | Number;
      Available: string | Number;
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
        Id: record[0],
        Title: record[1],
        SKU: record[2].toString(),
        Available: record[3],
        Fecha_Disponible: record[4],
      });
    }

    fs.rm(filePath, () => {
      return resolve(records);
    });
  });
}
