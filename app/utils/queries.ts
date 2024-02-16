export const bulkOperationRunQuery = `
      mutation {
        bulkOperationRunQuery(
        query: """
          {
            products {
              edges {
                node {
                  id
                  variants{
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
                  metafields{
                    edges {
                      node {
                        id
                        key
                        value
                      }
                    }
                  }
                }
              }
            }
          }
          """
        ) {
          bulkOperation {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }
      `;

export const bulkOperationQuery = `query {
  currentBulkOperation {
    id
    status
    errorCode
    createdAt
    completedAt
    objectCount
    fileSize
    url
    partialDataUrl
  }
}`;

export const bulkMutationQuery = `query {
  currentBulkOperation(type: MUTATION) {
     id
     status
     errorCode
     createdAt
     completedAt
     objectCount
     fileSize
     url
     partialDataUrl
  }
 }`

export const bulkOperationMutation = `mutation bulkOperationRunMutation($mutation: String!, $stagedUploadPath: String!) {
  bulkOperationRunMutation(mutation: $mutation, stagedUploadPath: $stagedUploadPath) {
    bulkOperation {
      id
      status
    }
    userErrors {
      field
      message
    }
  }
}`;

export const fileUploadMutation = `mutation {
  stagedUploadsCreate(input:{
    resource: BULK_MUTATION_VARIABLES,
    filename: "bulk_op_vars",
    mimeType: "text/jsonl",
    httpMethod: POST
  }){
    userErrors{
      field,
      message
    },
    stagedTargets{
      url,
      resourceUrl,
      parameters {
        name,
        value
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
    userErrors {
      field
      message
    }
    inventoryAdjustmentGroup {
      createdAt
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
        }
      }`;

export const updateVariantPrice = `
mutation productVariantUpdate($input: ProductVariantInput!) {
  productVariantUpdate(input: $input) {
    productVariant {
      id
      title
      price
    }
    userErrors {
      field
      message
    }
  }
}
`;

export const webhookSubscriptionCreate = `mutation {
  webhookSubscriptionCreate(
    topic: BULK_OPERATIONS_FINISH
    webhookSubscription: {
      format: JSON,
      callbackUrl: "${process.env.SHOPIFY_APP_URL}/webhooks"}
  ) {
    userErrors {
      field
      message
    }
    webhookSubscription {
      id
    }
  }
}
`

export const bulkOperationRunMutation = `
mutation bulkOperationRunMutation($mutation: String!, $stagedUploadPath: String!) {
  bulkOperationRunMutation(
    mutation: $mutation,
    stagedUploadPath: $stagedUploadPath) {
    bulkOperation {
      id
      url
      status
    }
    userErrors {
      message
      field
    }
  }
}
`;