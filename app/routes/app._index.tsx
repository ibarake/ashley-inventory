import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
  Button
} from "@shopify/polaris";
import db from "../db.server";

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

export default function Index() {

  return (
    <Page title="Importación de columnas">
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card padding={{ xs: "800", sm: "1000" }}>
                <Text as="p" variant="headingMd">
                  <h1>Importación de columnas</h1>
                </Text>
              <InlineStack wrap={false} align="start">
                <Link to={"/app/inventory-import"}>
                  <Button variant="primary">Inventario y Fecha</Button>
                </Link>
                <Link to={"/app/status-import"}>
                  <Button>Precio y Estado</Button>
                </Link>
              </InlineStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}