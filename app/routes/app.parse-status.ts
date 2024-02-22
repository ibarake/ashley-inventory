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

export const action: ActionFunction = async ({ request }) => {
  await db.statusData.deleteMany({});

  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  const file = formData.get("upload-file");

  if (!isUploadedFile(file) || file.type !== allowedMimeTypes.csv) {
    throw new Error("CSV files only");
  }


  await parseCSVFromFileStatus(file.filepath, processBatch);

  // New logic to enforce status rules for repeated IDs
  // Find IDs with at least one 'active' status
  const recordsWithActiveStatus = await db.statusData.findMany({
    where: {
      status: 'Active',
    },
    select: {
      id: true, // Select only the ID
    },
  });

  // Extract unique IDs
  const uniqueActiveIds = Array.from(new Set(recordsWithActiveStatus.map(record => record.id)));

  // Update all entries for these IDs to 'active' status, if not already
  await db.statusData.updateMany({
    where: {
      id: {
        in: uniqueActiveIds,
      },
      status: {
        not: 'Active',
      },
    },
    data: {
      status: 'Active',
    },
  });

  return redirect("/app/status-import");
};
