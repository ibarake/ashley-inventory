import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import getMutationType from "../utils/get-query";
import { InvData } from "@prisma/client";
import {
  inventoryItemMutation,
} from "../utils/queries";
import { handleRateLimit } from "~/utils/handle-rate-limit";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(
    request
  );

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }

  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }

      break;
    case "BULK_OPERATIONS_FINISH":
      const bulkOperationQuery = `
      query {
        node(id: "${(payload as any).admin_graphql_api_id}") {
          ... on BulkOperation {
            id
            status
            errorCode
            createdAt
            completedAt
            objectCount
            fileSize
            query
            url
            partialDataUrl
          }
        }
      }`

      const bulkOperationQueryStatus = await admin.graphql(bulkOperationQuery);

      const bulkOperationQueryStatusResponse = await bulkOperationQueryStatus.json();

      console.log(bulkOperationQueryStatusResponse.data.node);

      const mutationType = getMutationType(bulkOperationQueryStatusResponse.data.node);

      console.log("mutation type: ", mutationType);

      if (mutationType === "metafieldsSet") {
        const dbData: InvData[] = [];
        let offset = 0;
        let limit = 100;
        let batch;

        const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      }

      break;
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
