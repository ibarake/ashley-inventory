import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  useFetcher,
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
  ProgressBar,
  ColumnContentType,
  LegacyCard,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Parámetros para la paginación
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = 100; // o el tamaño de página que prefieras

  // Calcula el valor de 'skip' para Prisma
  const skip = (page - 1) * pageSize;

  const batchData = await db.invData.findMany({
    take: pageSize,
    skip: skip,
  });

  // Considera también devolver el total de registros para la paginación en el cliente
  const total = await db.invData.count();

  return { batchData, total };
};

export default function inventoryImport() {
  const [queryParams] = useSearchParams();
  const [isSubmiting, setIsSubmiting] = useState(false);
  const currentPage = Number(queryParams.get("page") || 1); // Add currentPage state
  const loaderData = useLoaderData<typeof loader>();

  const data = loaderData.batchData;
  const totalRows = loaderData.total; // Total de filas desde el servidor
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
    "numeric",
  ];
  const headers = ["id", "sku", "title", "fechaDisponible", "disponible"];

  const rows = data.map((element: any) => [
    element.id,
    element.sku,
    element.title,
    element.fechaDisponible,
    element.disponible,
  ]);

  const submitUpload = (formData: FormData) => {
    setIsSubmiting(true);
    fileUploader(formData, {
      action: "parse",
      method: "post",
      encType: "multipart/form-data",
      navigate: false,
    });
    setIsSubmiting(false);
  };

  const submitUpdate = (loaderFormData: FormData) => {
    setIsSubmiting(true);
    fileUploader(loaderFormData, {
      action: "update",
      method: "post",
      navigate: false,
    });
    setIsSubmiting(false);
  };

  return (
    <Page title="Importación de columnas" backAction={{content: 'Products', url: '/app'}} primaryAction={{content: "Actualizar shopify", disabled: isSubmiting, onAction: () => submitUpdate(loaderFormData) }}>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
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
                        className="Polaris-Button Polaris-Button--primary"
                        disabled={isSubmiting}
                      >
                        Cargar
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
                  rows.length * currentPage - rows.length
                } a ${
                  rows.length * currentPage
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
