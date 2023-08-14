import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as path from "path";

const router = new Bun.FileSystemRouter({
  style: "nextjs",
  dir: "./pages",
  // origin: "http://localhost",
  assetPrefix: "public/",
});

type Layout = React.FunctionComponent<{}>;

type Page = React.FunctionComponent<{ search: URLSearchParams }>;

type PageModule = {
  GET?: Page;
  POST?: Page;
  PUT?: Page;
  PATCH?: Page;
  DELETE?: Page;
};

async function handle(req: Request): Promise<Response> {
  const match = router.match(req);
  const method = req.method;

  if (!match) {
    return NotFound();
  }

  console.log(match);
  console.log(router.origin);

  const pageModule = (await import(match.filePath)) as PageModule;

  // @ts-ignore
  const page = pageModule[method] as Page | undefined;

  if (!page) {
    return NotFound(`${match.filePath} doesn't handle '${method}' method`);
  }

  const pageElement = React.createElement(page, {
    search: new URLSearchParams(match.query),
  });

  // TODO handle nested layouts
  const layout = await import(
    path.join(path.dirname(match.filePath), "_layout.tsx")
  ).then((_) => _.Layout as Layout);

  // render layout only on GET requests
  const markup =
    req.method === "GET"
      ? React.createElement(layout, {}, pageElement)
      : pageElement;

  return new Response(renderToStaticMarkup(markup), {
    headers: { "Content-Type": "text/html" },
  });
}

function NotFound(statusText = "Not Found") {
  return new Response(new Blob(), { status: 404, statusText });
}

Bun.serve({
  fetch(req: Request) {
    return handle(req);
  },
  port: 1337,
});
