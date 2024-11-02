import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
  Button,
  DataTable,
  type ColumnContentType,
  LegacyCard,
  Spinner
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useState } from "react";
import { bulkMutationQuery } from "~/utils/queries";
import type { statusData } from "@prisma/client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const bulkOperationQueryStatus = await admin.graphql(bulkMutationQuery);

  const bulkOperationQueryStatusResponse = await bulkOperationQueryStatus.json();

  const bulkOperationStatus = bulkOperationQueryStatusResponse.data.currentBulkOperation != null ?  bulkOperationQueryStatusResponse.data.currentBulkOperation.status : 'No hay operaciones en curso';

  console.log(bulkOperationQueryStatusResponse.data.currentBulkOperation);
  
  // Parámetros para la paginación
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = 100; // o el tamaño de página que prefieras

  // Calcula el valor de 'skip' para Prisma
  const skip = (page - 1) * pageSize;

  const batchData = await db.statusData.findMany({
    take: pageSize,
    skip: skip,
  });

  // Considera también devolver el total de registros para la paginación en el cliente
  const total = await db.statusData.count();

  return { batchData, total, bulkOperationStatus };
};

export default function StatusImport() {
  const [queryParams] = useSearchParams();
  const currentPage = Number(queryParams.get("page") || 1); // Add currentPage state
  const loaderData = useLoaderData<typeof loader>();

  const spinner = <Spinner accessibilityLabel="Spinner" size="small" />;
  
  const data = loaderData.batchData;
  const bulkOperationStatus = loaderData.bulkOperationStatus;
  const totalRows = loaderData.total; // Total de filas desde el servidor
  const [isSubmiting, setIsSubmiting] = useState(bulkOperationStatus === 'RUNNING' ? true : false);
  const [isSubmitingParse, setIsSubmitingParse] = useState(false);
  const totalPages = Math.ceil(totalRows / 100);

  const previousQuery = new URLSearchParams(queryParams);
  previousQuery.set("page", String(currentPage - 1));
  const nextQuery = new URLSearchParams(queryParams);
  nextQuery.set("page", String(currentPage + 1));

  const convertToFormData = (data: any) => {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    return formData;
  };

  const loaderFormData = convertToFormData(data);

  const fileUploader = useSubmit();

  const columnTypes: ColumnContentType[] = [
    "text",
    "text",
    "text",
    "text",
    "text",
    "text",
    "numeric"
  ];
  const headers = ["Product ID", "Variant ID", "Title", "Color", "Variant SKU", "status", "price"];

  const rows = data.map((element: statusData) => [
    element.id,
    element.variantId,
    element.title,
    element.color,
    element.sku,
    element.status,
    element.price,
  ]);

  const submitUpload = (formData: FormData) => {
    setIsSubmitingParse(true);
    fileUploader(formData, {
      action: "/app/parse-status",
      method: "post",
      encType: "multipart/form-data",
      navigate: false,
    });
    fetch('/app/status-fix', {
      method: 'POST'
    })
  };

  const submitUpdate = (loaderFormData: FormData) => {
    setIsSubmiting(true);
    fileUploader(loaderFormData, {
      action: "/app/update-status",
      method: "post",
      navigate: false,
    });
  };

  const deleteEverything = () => {
    setIsSubmiting(true);
    fileUploader(true, {
      action: "/app/delete-status",
      method: "post",
      navigate: false,
    });
    setIsSubmiting(false);
  }

  return (
    <Page title="Importación de columnas" backAction={{content: 'Products', url: '/app'}} primaryAction={{content: `Actualizar Shopify`, loading: isSubmiting, onAction: () => submitUpdate(loaderFormData) }} secondaryActions={[{ content: `Borrar BD`, loading: isSubmiting, onAction: () => deleteEverything() }]}>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card padding={{ xs: "800", sm: "1000" }}>
              <InlineStack wrap={false} align="space-between">
                <Text as="p" variant="headingMd">
                  Estado de la última importación
                </Text>
                <Text as="p" variant="headingMd">
                {isSubmiting ? "RUNNING" : bulkOperationStatus}{isSubmiting ? spinner : ""}
                </Text>
              </InlineStack>
            </Card>
            <Card padding={{ xs: "800", sm: "1000" }}>
              <InlineStack wrap={false} align="space-between">
                <Text as="p" variant="headingMd">
                  Carga aqui tu archivo a importar
                </Text>
                <Form
                  method="post"
                  encType="multipart/form-data"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    submitUpload(formData);
                  }}
                >
                  <div>
                    <label htmlFor="upload-file">
                      <input id="upload-file" name="upload-file" type="file" />
                      <button
                        type="submit"
                        className={`Polaris-Button Polaris-Button--pressable Polaris-Button--sizeMedium Polaris-Button--textAlignCenter ${ isSubmitingParse ? "Polaris-Button--disabled" : "Polaris-Button--variantPrimary"}`}
                        disabled={isSubmitingParse}
                      >
                       {isSubmitingParse ? spinner : "Cargar" }
                      </button>
                    </label>
                  </div>
                </Form>
              </InlineStack>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <LegacyCard>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px",
                }}
              >
                {currentPage === 1 && (
                  <Button disabled={currentPage === 1}>Anterior</Button>
                )}
                {currentPage > 1 && (
                  <Link to={`?${previousQuery.toString()}`}>
                    <Button disabled={currentPage === 1}>Anterior</Button>
                  </Link>
                )}
                {currentPage === totalPages && (
                  <Button disabled={currentPage === totalPages}>
                    Siguiente
                  </Button>
                )}
                {currentPage < totalPages && (
                  <Link to={`?${nextQuery.toString()}`}>
                    <Button disabled={currentPage === totalPages}>
                      Siguiente
                    </Button>
                  </Link>
                )}
              </div>
              <DataTable
                stickyHeader={true}
                columnContentTypes={columnTypes}
                headings={headers}
                rows={rows}
                footerContent={`Página ${currentPage} de ${totalPages} paginas. Visualizando registros ${
                  currentPage === totalPages ? totalRows - rows.length : rows.length * currentPage - rows.length
                } a ${
                  currentPage === totalPages ? totalRows : rows.length * currentPage
                } de ${totalRows} registros en total`}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px",
                }}
              >
                {currentPage === 1 && (
                  <Button disabled={currentPage === 1}>Anterior</Button>
                )}
                {currentPage > 1 && (
                  <Link to={`?${previousQuery.toString()}`}>
                    <Button disabled={currentPage === 1}>Anterior</Button>
                  </Link>
                )}
                {currentPage === totalPages && (
                  <Button disabled={currentPage === totalPages}>
                    Siguiente
                  </Button>
                )}
                {currentPage < totalPages && (
                  <Link to={`?${nextQuery.toString()}`}>
                    <Button disabled={currentPage === totalPages}>
                      Siguiente
                    </Button>
                  </Link>
                )}
              </div>
            </LegacyCard>
          </Layout.Section>
          <Layout.Section>
            <Button
              onClick={() => submitUpdate(loaderFormData)}
              variant="primary"
              tone="success"
              loading={isSubmiting}
            >
              {!isSubmiting ? "Actualizar shopify" : "Actualizando..."}
            </Button>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
