import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as path from "path";
import { tracer, log, Logger, SpanStatusCode } from "./logger";
import type { Infer, Schema, ValidationIssue } from "@decs/typeschema";
import { validate } from "@decs/typeschema";

const router = new Bun.FileSystemRouter({
  style: "nextjs",
  dir: "./pages",
});

export interface RouteProps {
  search: URLSearchParams;
  formData: FormData;
}

type Layout = React.FunctionComponent<{}>;

type Page = React.FunctionComponent<RouteProps>;

type PageModule = {
  GET?: Page;
  POST?: Page;
  PUT?: Page;
  PATCH?: Page;
  DELETE?: Page;
};

const LoggerContext = React.createContext<Logger>(log);

export function useLogger() {
  return React.useContext(LoggerContext);
}

async function handle(req: Request): Promise<Response> {
  const match = router.match(req);
  const method = req.method;
  const pathname = new URL(req.url).pathname;

  log.info({ method, pathname }, "<- IN");

  if (pathname.startsWith("/static")) {
    return new Response(Bun.file("." + pathname));
  }

  if (!match) {
    return NotFound();
  }

  const pageModule = (await import(match.filePath)) as PageModule;

  // @ts-expect-error 'string' can't be used to index type 'PageModule'
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
    formData: await req.formData().catch(() => new FormData()),
  });

  const layout = await import(
    path.join(path.dirname(match.filePath), "_layout.tsx")
  ).then((_) => _.Layout as Layout);

  // render layout only on non htmx requests
  const markup = JSON.parse(req.headers.get("Hx-Request") ?? "false")
    ? pageElement
    : React.createElement(layout, {}, pageElement);

  return new Response(renderToStaticMarkup(markup), {
    headers: { "Content-Type": "text/html" },
  });
}

function NotFound(statusText = "Not Found") {
  return new Response(new Blob(), { status: 404, statusText });
}

export function FormHandler<S extends Schema>(
  schema: S,
  handlers: {
    onSuccess: (formData: Infer<S>, props: RouteProps) => ReturnType<Page>;
    onError: (errors: ValidationIssue[], props: RouteProps) => ReturnType<Page>;
  }
) {
  return async function handler(props: RouteProps) {
    const result = await validate(schema, props.formData);

    if ("issues" in result) {
      return handlers.onError(result.issues, props);
    } else {
      return handlers.onSuccess(result.data, props);
    }
  };
}

const server = Bun.serve({
  fetch(req: Request) {
    return tracer.startActiveSpan("request", async (span) => {
      const response = handle(req)
        .then((res) => {
          log.info(
            {
              status: res.status,
              ...(res.statusText ? { statusText: res.statusText } : {}),
              contentType: res.headers.get("Content-Type"),
            },
            "-> OUT"
          );
          return res;
        })
        .catch((error) => {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: String(error),
          });
          log.error({ err: error }, "Error");
          throw error;
        });

      return response.finally(() => span.end());
    });
  },
  port: 1337,
});

log.info(
  { hostname: server.hostname, port: server.port },
  "Server listening on"
);
