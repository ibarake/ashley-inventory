import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import db from "../db.server";

export const action: ActionFunction = async ({ request }) => {
  console.log('Deleting all status data');
  const deleteStatus = await db.statusData.deleteMany({});
  console.log('Deleted all status data');

  return redirect("/app/status-import");
};
