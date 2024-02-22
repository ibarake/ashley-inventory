import { parse } from "csv-parse";
import fs from "fs";
import { InvData } from "@prisma/client";

const BATCH_SIZE = 500; // Adjust this based on your needs

export async function parseCSVFromFile(filePath: string, processBatch: (batch: InvData[]) => Promise<void>): Promise<void> {
  return new Promise(async (resolve) => {
    const parser = fs.createReadStream(filePath).pipe(
      parse({
        delimiter: ",",
        from: 2, // skip csv header,
        cast: true,
      })
    );

    let batch: InvData[] = [];

  for await (const record of parser) {
    const dataRow: InvData = {
      variantId: record[0].toString(),
      inventoryId: record[1].toString(),
      title: record[2].toString(),
      color: record[3].toString(),
      sku: record[4].toString(),
      fechaDisponible: record[5] === "#N/A" ? "" : record[5].toString(),
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
