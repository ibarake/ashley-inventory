import { ActionFunction } from "@remix-run/node";
import { InvData } from "@prisma/client"; // Add these imports
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { redirect } from "@remix-run/node";
import { handleRateLimit } from "~/utils/handle-rate-limit";
import { getProductVariant } from "~/utils/get-product-variant";

export const action: ActionFunction = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);
    const invdata: InvData[] = await db.invData.findMany();

    let count = 0;
    const BATCH_SIZE = 5; // Adjust batch size as needed
    for (let i = 0; i < invdata.length; i += BATCH_SIZE) {
      const batch = invdata.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((data) => {
          if (data.handle && data.sku) {
            count++;
            console.log(`Processing ${count}`);
            try {
              return getProductVariant(invdata, admin, data);
            } catch (error) {
              console.error(error);
            }
          }
        })
      );
    }

    console.log("completed");
    return redirect(`/app`);
  } catch (error) {
    console.error("Error in action function:", error);
    throw error; // or handle it as needed
  }
};
