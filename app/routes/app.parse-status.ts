import type { ActionFunction } from "@remix-run/node";
import { unstable_parseMultipartFormData } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { parseCSVFromFileStatus } from "~/utils/parse-csv-status";
import {
  allowedMimeTypes,
  isUploadedFile,
  uploadHandler,
} from "~/utils/upload-handler";
import db from "../db.server";
import { statusData } from "@prisma/client";

export const action: ActionFunction = async ({ request }) => {
  await db.statusData.deleteMany({});

  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  const file = formData.get("upload-file");

  if (!isUploadedFile(file) || file.type !== allowedMimeTypes.csv) {
    throw new Error("CSV files only");
  }

  const processBatch = async (batch: statusData[]) => {
    await db.statusData.createMany({
      data: batch.map((row) => ({
        id: row.id,
        variantId: row.variantId,
        title: row.title,
        color: row.color,
        sku: row.sku,
        status: row.status,
        price: row.price,
      })),
      skipDuplicates: true
    });
  };

  await parseCSVFromFileStatus(file.filepath, processBatch);

  return redirect("/app");
};
