import { parse } from "csv-parse";
import fs from "fs";
import { statusData } from "@prisma/client";

const BATCH_SIZE = 500; // Adjust this based on your needs

const safeNumberConversion = (value: String) => {
  const number = parseInt(value.toString(), 10);
  return isNaN(number) ? parseInt("0") : number;
};

export async function parseCSVFromFileStatus(filePath: string, processBatch: (batch: statusData[]) => Promise<void>): Promise<void> {
  return new Promise(async (resolve) => {
    const parser = fs.createReadStream(filePath).pipe(
      parse({
        delimiter: ",",
        from: 2, // skip csv header,
        cast: true,
      })
    );

    let batch: statusData[] = [];

  for await (const record of parser) {
    console.log(record.toString())
    const dataRow: statusData = {
      id: record[0].toString(),
      variantId: record[1].toString(),
      title: record[2].toString(),
      color: record[3].toString(),
      sku: record[4].toString(),
      status: record[5].toString(),
      price: safeNumberConversion(record[6].toString()),
    };

    batch.push(dataRow);

    if (batch.length >= BATCH_SIZE) {
      await processBatch(batch);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await processBatch(batch);
  }

  await fs.promises.rm(filePath); // Remove the file
  });
}
