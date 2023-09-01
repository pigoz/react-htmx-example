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

type Page = (
  props: RouteProps
) => Response | JSX.Element | Promise<Response> | Promise<JSX.Element>;

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

  const props = {
    search: new URLSearchParams(match.query),
    formData: await req.formData().catch(() => new FormData()),
  };

  const response = await page(props);

  if (response instanceof Response) {
    return response;
  }

  const layout = await import(
    path.resolve(import.meta.dir, "pages/_layout.tsx")
  ).then((_) => _.Layout as Layout);

  // render layout only on non htmx requests
  const markup = JSON.parse(req.headers.get("Hx-Request") ?? "false")
    ? response
    : React.createElement(layout, {}, response);

  return new Response(renderToStaticMarkup(markup), {
    headers: { "Content-Type": "text/html" },
  });
}

function NotFound(statusText = "Not Found") {
  return new Response(new Blob(), { status: 404, statusText });
}

function ValidationError(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 422,
    headers: { "Content-Type": "application/json" },
  });
}

export function FormHandler<S extends Schema>(
  schema: S,
  handlers: {
    onSuccess: (formData: Infer<S>, props: RouteProps) => ReturnType<Page>;
    onError?: (
      errors: ValidationIssue[],
      props: RouteProps
    ) => ReturnType<Page>;
  }
) {
  return async function handler(props: RouteProps) {
    const result = await validate(schema, Object.fromEntries(props.formData));

    if ("issues" in result) {
      return handlers.onError
        ? handlers.onError(result.issues, props)
        : ValidationError(result.issues);
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
