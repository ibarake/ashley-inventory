import type { ActionFunction } from "@remix-run/node";
import { unstable_parseMultipartFormData } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { parseCSVFromFile } from "~/utils/parse-csv";
import {
  allowedMimeTypes,
  isUploadedFile,
  uploadHandler,
} from "~/utils/upload-handler";
import db from "../db.server";
import { csvQueue } from "~/utils/queue";

export const action: ActionFunction = async ({ request }) => {
  await db.invData.deleteMany({});

  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  const file = formData.get("upload-file");

  if (!isUploadedFile(file) || file.type !== allowedMimeTypes.csv) {
    throw new Error("CSV files only");
  }

  console.log('Enqueuing CSV data for background processing');
  csvQueue.add({ filepath: file.filepath, callbackfnc: parseCSVFromFile });

  return redirect("/app/inventory-import");
};
