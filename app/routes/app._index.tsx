import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Outlet,
  useActionData,
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
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const body = await request.formData();
  const file = body.get("fileUpload");

  return file;
};

export default function Index() {
  const data = useActionData<typeof action>();

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
                <Form method="post">
                  <input type="file" id="fileUpload" name="fileUpload" />
                  <button className="Polaris-Button Polaris-Button--primary">
                    <span className="Polaris-Button__Content">
                      <span className="Polaris-Button__Text">Cargar</span>
                    </span>
                  </button>
                </Form>
              </InlineStack>
            </Card>
          </Layout.Section>
          <Layout.Section>{data ? `${data}` : "esperando..."}</Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
