import { ActionFunction, redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  fileUploadMutation,
  statusUpdate,
  webhookSubscriptionCreate,
  bulkOperationRunMutation
} from "../utils/queries";
import db from "../db.server";
import { statusData } from "@prisma/client";
import * as fs from 'fs';
import uploadFile from "../utils/upload-files";
import parseXML from "~/utils/parse-xml";

var path = require('path');

type PartialStatusData = Pick<statusData, 'id' | 'status'>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    const dbData: PartialStatusData[] = [];
    let offset = 0;
    let limit = 500;
    let batch: PartialStatusData[];

    do {
      batch = await db.statusData.findMany({
        skip: offset,
        take: limit,
        select: {
          id: true,
          status: true
        }
      });
      dbData.push(...batch);
      offset += limit;
    } while (batch.length === limit);


    //creating Json from DB data
    const MutationInputs = dbData.map((item) => {
      const MutationVariables = { input: { id: `gid://shopify/ProductVariant/${item.id}`, status: String(item.status).toUpperCase(), }, };
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
        mutation: statusUpdate,
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

    return redirect("/app/status-import");

  } catch (error) {
    console.error("Error in action function:", error);
    throw error; // or handle it as needed
  }
};
