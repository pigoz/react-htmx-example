import pino from "pino";
import pretty from "pino-pretty";

export const logger = pino(pretty());
export type Logger = pino.Logger;
