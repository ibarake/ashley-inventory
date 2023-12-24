export const GetVariantAndMetafield = `
    query GetVariantMetafield($handle: String!) {
      productByHandle(handle: $handle) {
        id
        variants(first: 10) {
          edges {
            node {
              id
              sku
              inventoryItem {
                id
              }
            }
          }
        }
      }
    }
      `;

export const variantMetafieldUpdate = `
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            value
          }
        }
      }
        `;

export const inventoryItemMutation = `
        mutation inventorySetOnHandQuantities($input: InventorySetOnHandQuantitiesInput!) {
          inventorySetOnHandQuantities(input: $input) {
            inventoryAdjustmentGroup {
              reason
              changes {
                name
                delta
              }
            }
          }
        }
      `;

export const statusUpdate = `
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }`;
