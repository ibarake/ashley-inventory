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

export default function Index() {

  return (
    <Page title="Importación de columnas" backAction={{content: 'Products', url: '/app'}}>
        <h1>Carga de estado</h1>
    </Page>
  );
}
