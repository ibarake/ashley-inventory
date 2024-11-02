import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import db from "../db.server";

export const action: ActionFunction = async ({ request }) => {
    console.log('Deleting all inv data');
    await db.invData.deleteMany({});
    console.log('Deleted all inv data');

    return redirect("/app/status-import");
};
