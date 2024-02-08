import { ActionFunction, redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  fileUploadMutation,
  variantMetafieldUpdate,
  webhookSubscriptionCreate,
  bulkOperationRunMutation
} from "../utils/queries";
import db from "../db.server";
import { InvData } from "@prisma/client";
import * as fs from 'fs';
import uploadFile from "../utils/upload-files";
import parseXML from "~/utils/parse-xml";

var path = require('path');    

type PartialInvData = Pick<InvData, 'variantId' | 'fechaDisponible'>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    const dbData: PartialInvData[] = [];
    let offset = 0;
    let limit = 500;
    let batch: PartialInvData[];

    do {
      batch = await db.invData.findMany({
        skip: offset,
        take: limit,
        select: {
          variantId: true,
          fechaDisponible: true
        }
      });
      dbData.push(...batch);
      offset += limit;
    } while (batch.length === limit);


    //creating Json from DB data
    const MetafieldSetInputs = dbData.map((item) => {
      const MutationVariables = { metafields: [ { key: "fecha_disponible", namespace: "custom", ownerId: `gid://shopify/ProductVariant/${item.variantId}`, type: "single_line_text_field", value: item?.fechaDisponible, }, ], };
      return MutationVariables;
    });
    //converting JSON to JSONL
    const metafieldJSONL = MetafieldSetInputs.map(input => JSON.stringify(input)).join('\n');

    // Write the JSONL files
    const metafieldFilePath = path.join(__dirname, 'metafieldUpdates.jsonl');
    fs.writeFileSync(metafieldFilePath, metafieldJSONL);
    // Create staged upload for metafieldUpdates.jsonl
    const fileMutation = await admin.graphql(fileUploadMutation);
    const fileMutationResponse = await fileMutation.json();

    // Extract necessary data from fileMutationResponse
    const { url, parameters } = fileMutationResponse.data.stagedUploadsCreate.stagedTargets[0];
    // Upload metafieldUpdates.jsonl to Google Cloud Storage
    const metafieldUploadData = await uploadFile(url, parameters, metafieldFilePath);
    // Parse the XML response from Google Cloud Storage
    const metafieldJSONLResponse = await parseXML(metafieldUploadData);
    // Extract the metafieldUpdates.jsonl file URL from the XML response
    const metafieldUploadURL = metafieldJSONLResponse.location;

    console.log(metafieldUploadURL);

    const bulkOperationVariables = {
      variables: {
        mutation: variantMetafieldUpdate,
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

    return redirect("/app/inventory-import");

  } catch (error) {
    console.error("Error in action function:", error);
    throw error; // or handle it as needed
  }
};
