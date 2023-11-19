import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { login } from "../../shopify.server";
import indexStyles from "./style.css";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return json({ showForm: Boolean(login) });
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className="index">
      <div className="content">
        <h1>[your app]</h1>
        <p>
          Carga de inventario, fecha de entrega y estado para Ashley Colombia.
        </p>
        {showForm && (
          <Form method="post" action="/auth/login">
            <label>
              <span>Shop domain</span>
              <input type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button type="submit">Log in</button>
          </Form>
        )}
        <ul>
          <li>
            <strong>Carga inventario</strong>. el inventario se actualizara sin
            importar los datos actuales en shopify (sobreescrito).
          </li>
          <li>
            <strong>Archivo CSV solamente</strong>. Usar archivo descargado de
            drive.
          </li>
          <li>
            <strong>Carga de fecha disponible</strong>. La fecha disponible sera
            actualizada sin importar los datos actuales (sobreescrita).
          </li>
          <li>
            <strong>Carga de estado</strong>. El estado de los productos
            afectara la visibilidad de productos en la tienda.
          </li>
        </ul>
      </div>
    </div>
  );
}
