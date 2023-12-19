import type { ActionFunction } from "@remix-run/node";
import { unstable_parseMultipartFormData } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { parseCSVFromFile } from "~/utils/parse-csv";
import {
  allowedMimeTypes,
  isUploadedFile,
  uploadHandler,
} from "~/utils/upload-handler";
import db from "../db.server";

interface DataRow {
  Handle: string;
  Title: string;
  SKU: string;
  Available: Number;
  Status: string;
  Fecha_Disponible: string;
}

export const action: ActionFunction = async ({ request }) => {
  await db.invData.deleteMany({});

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const file = formData.get("upload-file");

  if (!isUploadedFile(file)) return null;

  let rawData: unknown;
  if (file.type === allowedMimeTypes.csv) {
    rawData = await parseCSVFromFile(file.filepath);
  } else {
    throw new Error("CSV files only");
    return null;
  }

  // Assert that rawData is an array of DataRow objects
  if (
    !Array.isArray(rawData) ||
    !rawData.every((row) => typeof row === "object")
  ) {
    throw new Error("Invalid data format");
  }
  const typedData = rawData as DataRow[];

  const safeNumberConversion = (value: String | Number) => {
    const number = Number(value);
    return isNaN(number) ? 0 : number;
  };

  const batchSize = 10;

  for (let i = 0; i < typedData.length; i += batchSize) {
    const batch = typedData.slice(i, i + batchSize);

    await db.invData.createMany({
      data: batch.map((dataRow) => ({
        sku: dataRow.SKU,
        title: dataRow.Title,
        handle: dataRow.Handle,
        disponible: Number(dataRow.Available),
        estado: dataRow.Status,
        fechaDisponible: dataRow.Fecha_Disponible,
      })),
    });

    const createInvDataPromises = batch.map(async (dataRow) => {
      const existingRecord = await db.invData.findUnique({
        where: { sku: dataRow.SKU.toString() },
      });
      if (!existingRecord) {
        return db.invData.create({
          data: {
            sku: dataRow.SKU.toString(),
            title: dataRow.Title,
            handle: dataRow.Handle,
            disponible: safeNumberConversion(dataRow.Available),
            estado: dataRow.Status,
            fechaDisponible: dataRow.Fecha_Disponible,
          },
        });
      } else {
        console.log(`Record with SKU ${dataRow.SKU} already exists. Updating.`);
        return db.invData.updateMany({
          where: { sku: dataRow.SKU.toString() },
          data: {
            title: dataRow.Title,
            handle: dataRow.Handle,
            disponible: safeNumberConversion(dataRow.Available),
            estado: dataRow.Status,
            fechaDisponible: dataRow.Fecha_Disponible,
          },
        });
      }
    });

    // Wait for the current batch of create operations to complete
    await Promise.all(createInvDataPromises);
  }
  return redirect("/app");
};
