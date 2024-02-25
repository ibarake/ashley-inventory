import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import getMutationType from "../utils/get-query";
import { statusData } from "@prisma/client";
import * as fs from 'fs';
import uploadFile from "../utils/upload-files";
import parseXML from "~/utils/parse-xml";
import {
  fileUploadMutation,
  updateVariantPrice,
  webhookSubscriptionCreate,
  bulkOperationRunMutation,
  bulkMutationQuery
} from "../utils/queries";

var path = require('path');  

type PartialStatusData = Pick<statusData, 'variantId' | 'price'>;

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
      const bulkOperationQueryStatus = await admin.graphql(bulkMutationQuery);

      console.log(bulkOperationQueryStatus)

      const bulkOperationQueryStatusResponse = await bulkOperationQueryStatus.json();

      console.log(bulkOperationQueryStatusResponse);

      console.log(bulkOperationQueryStatusResponse.data.node);

      const mutationType = getMutationType(bulkOperationQueryStatusResponse.data.node);

      console.log("mutation type: ", mutationType);

      if (mutationType === "productUpdate") {
        const dbData: PartialStatusData[] = [];
        let offset = 0;
        let limit = 100;
        let batch: PartialStatusData[];

        do {
          batch = await db.statusData.findMany({
            skip: offset,
            take: limit,
            select: {
              variantId: true,
              price: true
            }
          });
          dbData.push(...batch);
          offset += limit;
        } while (batch.length === limit);

        //creating Json from DB data
      const MutationInputs = dbData.map((item) => {
        const MutationVariables = { input: { id: `gid://shopify/productVariant/${item.variantId}`, price: item.price } };
        return MutationVariables;
      });
      //converting JSON to JSONL
      const mutationJSONL = MutationInputs.map(input => JSON.stringify(input)).join('\n');

      // Write the JSONL files
      const mutationFilePath = path.join(__dirname, 'mutationInputs.jsonl');
      fs.writeFileSync(mutationFilePath, mutationJSONL);
      // Create staged upload for metafieldUpdates.jsonl
      const fileMutation = await admin.graphql(fileUploadMutation);
      const fileMutationResponse = await fileMutation.json();

      // Extract necessary data from fileMutationResponse
      const { url, parameters } = fileMutationResponse.data.stagedUploadsCreate.stagedTargets[0];
      // Upload metafieldUpdates.jsonl to Google Cloud Storage
      const mutationUploadData = await uploadFile(url, parameters, mutationFilePath);
      // Parse the XML response from Google Cloud Storage
      const mutationJSONLResponse = await parseXML(mutationUploadData);
      // Extract the metafieldUpdates.jsonl file URL from the XML response
      const mutationUploadURL = mutationJSONLResponse.location;

      console.log(mutationUploadURL);

      const bulkOperationVariables = {
        variables: {
          mutation: updateVariantPrice,
          stagedUploadPath: parameters.find((param: any) => param.name === 'key')?.value,
        }
      };
      // Create a bulk operation to update metafields
      const bulkOperationMutation = await admin.graphql(bulkOperationRunMutation, bulkOperationVariables);
      const bulkOperationMutationResponse = await bulkOperationMutation.json();
      // Create a webhook subscription for the bulk operation
      const webhookSubscription = await admin.graphql(webhookSubscriptionCreate);
      const webhookSubscriptionResponse = await webhookSubscription.json();

      console.log(webhookSubscriptionResponse.data.webhookSubscriptionCreate.webhookSubscription);
      console.log(webhookSubscriptionResponse.data.webhookSubscriptionCreate.userErrors);
      console.log(bulkOperationMutationResponse.data.bulkOperationRunMutation.userErrors);
      console.log(bulkOperationMutationResponse.data.bulkOperationRunMutation.bulkOperation);

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