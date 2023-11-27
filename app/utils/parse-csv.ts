import { parse } from "csv-parse";
import fs from "fs";

export async function parseCSVFromFile(filePath: string) {
  return new Promise(async (resolve) => {
    const records: {
      Handle: string;
      Title: string;
      SKU: string;
      Incoming: string;
      Unavailable: string;
      Committed: string;
      Available: string;
      On_hand: string;
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
        Incoming: record[3],
        Unavailable: record[4],
        Committed: record[5],
        Available: record[6],
        On_hand: record[7],
        Fecha_Disponible: record[8],
      });
    }

    fs.rm(filePath, () => {
      return resolve(records);
    });
  });
}
