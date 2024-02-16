import {
  Link,
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
  Button
} from "@shopify/polaris";

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
                <Link url={"/app/inventory-import"}>
                  <Button variant="primary">Fecha</Button>
                </Link>
                <Link url={"/app/status-import"}>
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