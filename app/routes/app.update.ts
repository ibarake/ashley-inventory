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

    let count = 0;
    const BATCH_SIZE = 4; // Adjust batch size as needed
    let page = 0;

    const processInvData = async () => {
      while (true) {
        const invdata: InvData[] = await db.invData.findMany({
          skip: page * BATCH_SIZE,
          take: BATCH_SIZE,
        });

        if (invdata.length === 0) break;

        await Promise.all(
          invdata.map((data) => {
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
        page++;
      }

      console.log("completed");
    };

    processInvData(); // Start the background process

    return redirect(`/app`);
  } catch (error) {
    console.error("Error in action function:", error);
    throw error; // or handle it as needed
  }
};
