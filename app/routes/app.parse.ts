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
import { InvData } from "@prisma/client";

export const action: ActionFunction = async ({ request }) => {
  await db.invData.deleteMany({});

  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  const file = formData.get("upload-file");

  if (!isUploadedFile(file) || file.type !== allowedMimeTypes.csv) {
    throw new Error("CSV files only");
  }

  const processBatch = async (batch: InvData[]) => {
    await db.invData.createMany({
      data: batch.map((row) => ({
        variantId: row.variantId,
        inventoryId: row.inventoryId,
        title: row.title,
        color: row.color,
        sku: row.sku,
        fechaDisponible: row.fechaDisponible,
      })),
      skipDuplicates: true
    });
  };

  await parseCSVFromFile(file.filepath, processBatch);

  return redirect("/app/inventory-import");
};
