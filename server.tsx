import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as path from "path";
import * as crypto from "crypto";
import { Logger, logger } from "./logger";

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

async function handle(log: Logger, req: Request): Promise<Response> {
  const match = router.match(req);
  const method = req.method;

  log.info({ method, path: new URL(req.url).pathname }, "Request");

  if (!match) {
    return NotFound();
  }

  const pageModule = (await import(match.filePath)) as PageModule;

  // @ts-ignore
  const page = pageModule[method] as Page | undefined;

  if (!page) {
    return NotFound(`${match.filePath} doesn't handle '${method}' method`);
  }

  log.info(
    {
      filePath: path.relative(import.meta.dir, match.filePath),
      export: method,
    },
    "Router match"
  );

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

const server = Bun.serve({
  fetch(req: Request) {
    const id = crypto.randomUUID();
    const _logger = logger.child({ "trace-id": id });
    const res = handle(_logger, req).then((res) => {
      _logger.info(
        {
          status: res.status,
          ...(res.statusText ? { statusText: res.statusText } : {}),
          contentType: res.headers.get("Content-Type"),
        },
        "Response"
      );
      return res;
    });
    return res;
  },
  port: 1337,
});

logger.info(
  { hostname: server.hostname, port: server.port },
  "Server listening on"
);
