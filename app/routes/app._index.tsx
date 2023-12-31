import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
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
import { InvData, PrismaPromise } from "@prisma/client";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const find: PrismaPromise<InvData[]> = db.invData.findMany();

  return find;
};

export default function Index() {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const data = useLoaderData<typeof loader>();

  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("requestId");

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
    "numeric",
    "text",
  ];
  const headers = [
    "sku",
    "handle",
    "title",
    "fechaDisponible",
    "disponible",
    "estado",
  ];
  const rows = data.map((element: any) => [
    element.sku,
    element.handle,
    element.title,
    element.fechaDisponible,
    element.disponible,
    element.estado,
    // Add new data fields here
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
    <Page>
      <ui-title-bar title="Ashley inventory import">
        <button variant="primary">Ver importaciones</button>
        <button>Descargar plantilla</button>
      </ui-title-bar>
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
              <DataTable
                stickyHeader={true}
                columnContentTypes={columnTypes}
                headings={headers}
                rows={rows}
                footerContent={`Showing ${rows.length} of ${rows.length} results`}
              />
            </LegacyCard>
          </Layout.Section>
          <Layout.Section>
            <Button
              onClick={() => submitUpdate(loaderFormData)}
              variant="primary"
              tone="success"
              loading={isSubmiting}
            >
              {isSubmiting ? "Actualizar shopify" : "Actualizando..."}
            </Button>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
