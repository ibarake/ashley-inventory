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
import { create } from "domain";

interface DataRow {
  Id: string;
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
  const batchData = typedData.map((row) => ({
    id: row.Id,
    title: row.Title,
    sku: row.SKU,
    disponible: safeNumberConversion(row.Available),
    fechaDisponible: row.Fecha_Disponible,
  }));
  const createInvDataPromises = await db.invData.createMany({
    data: [...batchData],
    skipDuplicates: true,
  });

  return redirect("/app");
};
