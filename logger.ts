import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { trace, context, isSpanContextValid } from "@opentelemetry/api";
import pretty from "pino-pretty";
import pino from "pino";

function getOutputStream() {
  if (process.env.NODE_ENV !== "production") {
    return pretty({
      colorize: true,
      ignore: "trace_flags,trace_id",
    });
  }

  return process.stdout;
}

export function _setup() {
  const provider = new NodeTracerProvider();
  provider.register();

  const tracer = trace.getTracer("webapp");
  return { tracer, getActiveSpan: () => trace.getActiveSpan() };
}

function mixin(_context: object, _level: number) {
  const span = trace.getSpan(context.active());

  if (!span) {
    return {};
  }

  const spanContext = span.spanContext();

  if (!isSpanContextValid(spanContext)) {
    return {};
  }

  const record = {
    trace_id: spanContext.traceId,
    span_id: spanContext.spanId,
    trace_flags: `0${spanContext.traceFlags.toString(16)}`,
  };

  return record;
}

const setup = _setup();

export const log = pino({ mixin }, getOutputStream());
export type Logger = pino.Logger;

export const tracer = setup.tracer;
export const getActiveSpan = setup;
