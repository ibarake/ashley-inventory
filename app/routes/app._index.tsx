import type { LoaderFunctionArgs } from "@remix-run/node";
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
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
  DataTable,
  ColumnContentType,
  LegacyCard,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { InvData, PrismaPromise } from "@prisma/client";

interface DataRow {
  SKU: string;
  Title: string;
  Handle: string;
  Location: string;
  Available: number; // Assuming it's a number
  On_hand: number; // Assuming it's a number
  Fecha_Disponible: string;
  // Add other fields as necessary
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const find: PrismaPromise<InvData[]> = db.invData.findMany();

  return find;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const file = formData.get("upload-file");

  if (!isUploadedFile(file)) return null;

  let rawData: unknown;
  if (file.type === allowedMimeTypes.xlsx) {
    rawData = await parseXLSXFromFile(file.filepath);
  } else {
    rawData = await parseCSVFromFile(file.filepath);
  }

  // Assert that rawData is an array of DataRow objects
  if (
    !Array.isArray(rawData) ||
    !rawData.every((row) => typeof row === "object")
  ) {
    throw new Error("Invalid data format");
  }
  const typedData = rawData as DataRow[];

  const safeNumberConversion = (value: String | Number) => {
    const number = Number(value);
    return isNaN(number) ? 0 : number;
  };

  const batchSize = 50;
  for (let i = 0; i < typedData.length; i += batchSize) {
    const batch = typedData.slice(i, i + batchSize);
    const createInvDataPromises = batch.map(async (dataRow) => {
      const existingRecord = await db.invData.findUnique({
        where: { sku: dataRow.SKU.toString() },
      });
      if (!existingRecord) {
        return db.invData.create({
          data: {
            sku: dataRow.SKU.toString(),
            title: dataRow.Title,
            handle: dataRow.Handle,
            location: dataRow.Location,
            disponible: safeNumberConversion(dataRow.Available),
            enMano: safeNumberConversion(dataRow.On_hand),
            fechaDisponible: dataRow.Fecha_Disponible,
          },
        });
      } else {
        console.log(`Record with SKU ${dataRow.SKU} already exists. Updating.`);
        return db.invData.updateMany({
          where: { sku: dataRow.SKU.toString() },
          data: {
            title: dataRow.Title,
            handle: dataRow.Handle,
            location: dataRow.Location,
            disponible: safeNumberConversion(dataRow.Available),
            enMano: safeNumberConversion(dataRow.On_hand),
            fechaDisponible: dataRow.Fecha_Disponible,
          },
        });
      }
    });

    // Wait for the current batch of create operations to complete
    await Promise.all(createInvDataPromises);
  }
  return json(typedData);
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
    "handle",
    "title",
    "fechaDisponible",
    "disponible",
    "enMano",
    "location",
  ];
  const rows = data.map((element) => [
    element.sku,
    element.handle,
    element.title,
    element.fechaDisponible,
    element.disponible,
    element.enMano,
    element.location,
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
