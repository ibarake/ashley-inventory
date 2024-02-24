import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import db from "../db.server";

export const action: ActionFunction = async ({ request }) => {
  const deleteStatus = db.statusData.deleteMany({});

  return redirect("/app/status-import");
};
