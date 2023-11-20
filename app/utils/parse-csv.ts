import { parse } from "csv-parse";
import fs from "fs";

export async function parseCSVFromFile(filePath: string) {
  return new Promise(async (resolve) => {
    const records: {
      Handle: string;
      Title: number;
      Option1_Name: string;
      Option1_Value: string;
      Option2_Name: string;
      Option2_Value: string;
      Option3_Name: string;
      Option3_Value: string;
      SKU: string;
      HS_Code: string;
      COO: string;
      Location: string;
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
        Option1_Name: record[2],
        Option1_Value: record[3],
        Option2_Name: record[4],
        Option2_Value: record[5],
        Option3_Name: record[6],
        Option3_Value: record[7],
        SKU: record[8],
        HS_Code: record[9],
        COO: record[10],
        Location: record[11],
        Incoming: record[12],
        Unavailable: record[13],
        Committed: record[14],
        Available: record[15],
        On_hand: record[16],
        Fecha_Disponible: record[17],
      });
    }

    fs.rm(filePath, () => {
      return resolve(records);
    });
  });
}
