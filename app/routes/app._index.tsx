import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { unstable_parseMultipartFormData } from "@remix-run/node";
import { json } from "@remix-run/node";
import { parseCSVFromFile } from "~/utils/parse-csv";
import { parseXLSXFromFile } from "~/utils/parse-xlsx";
import {
  allowedMimeTypes,
  isUploadedFile,
  uploadHandler,
} from "~/utils/upload-handler";
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  InlineStack,
  DataTable,
  ColumnContentType,
  LegacyCard,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const find = db.uploadData.findMany({
    // Returns all inventory fields
    include: {
      invData: {
        select: {
          sku: true,
          title: true,
          handle: true,
          location: true,
          disponible: true,
          enMano: true,
          fechaDisponible: true,
          UploadData: true,
          uploadDataId: true,
        },
      },
    },
  });

  return find;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const file = formData.get("upload-file");

  if (!isUploadedFile(file)) return null;

  if (file.type === allowedMimeTypes.xlsx) {
    const rawData = await parseCSVFromFile(file.filepath);
    console.log(rawData);

    return rawData;
  } else {
    const data = await parseCSVFromFile(file.filepath);
    return json(data);
  }
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
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
    "title",
    "handle",
    "location",
    "disponible",
    "enMano",
    "fechaDisponible",
  ];
  const rows = data[0].invData.map((element) => [
    element.sku,
    element.title,
    element.handle,
    element.location,
    element.disponible,
    element.enMano,
    element.fechaDisponible,
    // Add new data fields here
  ]);

  const submitUpload = (formData: FormData) => {
    fileUploader(formData, {
      method: "post",
      encType: "multipart/form-data",
      action: "",
      navigate: false,
    });
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
                columnContentTypes={columnTypes}
                headings={headers}
                rows={rows}
              />
            </LegacyCard>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
