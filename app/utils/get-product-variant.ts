import { InvData } from "@prisma/client";
import { handleRateLimit } from "./handle-rate-limit";
import {
  GetVariantAndMetafield,
  variantMetafieldUpdate,
  inventoryItemMutation,
  statusUpdate,
} from "./queries";
import { AdminApiContext } from "node_modules/@shopify/shopify-app-remix/build/ts/server/clients";
import { RestResources } from "@shopify/shopify-api/rest/admin/2023-10";

export const getProductVariant = async (
  data: InvData[],
  admin: AdminApiContext<RestResources>,
  dbData: InvData
): Promise<void> => {
  const queryVariables: { variables: { handle: String } } = {
    variables: {
      handle: String(dbData.handle),
    },
  };
  console.log(dbData.handle);
  const queryResponse = await handleRateLimit(admin.graphql, [
    GetVariantAndMetafield,
    queryVariables,
  ]);

  const queryData = await queryResponse.json();

  // Check if the product returned from Shopify is not null
  if (!queryData.data.productByHandle) {
    console.error(`Product with handle ${dbData.handle} not found in Shopify.`);
    return; // Skip further processing for this product handle
  }

  const variant = queryData.data.productByHandle.variants.edges.find(
    (item: any) => item.node.sku === dbData.sku
  );

  // Check if 'variant' is undefined or null before accessing its properties
  if (!variant || !variant.node) {
    console.error(`No variant found for SKU: ${dbData.sku}`);
    return;
  }

  console.log(`got variant ${variant.node.sku}`);

  const variantId = variant.node.id;

  const MutationVariables = {
    variables: {
      metafields: [
        {
          key: "fecha_disponible",
          namespace: "custom",
          ownerId: `${variantId}`,
          type: "single_line_text_field",
          value: data.find(
            (item: { handle: string }) => item.handle === dbData.handle
          )?.fechaDisponible,
        },
      ],
    },
  };

  console.log(`updating variant ${variant.node.sku}`);
  await handleRateLimit(admin.graphql, [
    variantMetafieldUpdate,
    MutationVariables,
  ]);
  console.log(
    "variant fecha updated with",
    MutationVariables.variables.metafields[0].value
  );
  const inventoryItemId = variant.node.inventoryItem.id;

  const inventoryItemMutationVariables = {
    variables: {
      input: {
        reason: "correction",
        setQuantities: [
          {
            inventoryItemId,
            locationId: "gid://shopify/Location/76335710517",
            quantity: data.find((item) => item.handle === dbData.handle)
              ?.disponible,
          },
        ],
      },
    },
  };

  await handleRateLimit(admin.graphql, [
    inventoryItemMutation,
    inventoryItemMutationVariables,
  ]);

  console.log(
    "inventory disponible updated with",
    inventoryItemMutationVariables.variables.input.setQuantities[0].quantity
  );

  const statusVariables = {
    variables: {
      input: {
        id: queryData.data.productByHandle.id,
        status: String(dbData.estado).toUpperCase(),
      },
    },
  };

  await handleRateLimit(admin.graphql, [statusUpdate, statusVariables]);

  console.log(
    "product status updated with",
    statusVariables.variables.input.status
  );
};
