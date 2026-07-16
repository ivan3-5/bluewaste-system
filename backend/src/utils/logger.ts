import pino from "pino";
import { env } from "../config/env";

// pino-pretty uses worker threads which are not supported in serverless
// environments (Vercel). Guard against both NODE_ENV and VERCEL flags.
const isLocalDevelopment =
  env.NODE_ENV === "development" && !process.env.VERCEL;

export const logger = pino({
  level: env.NODE_ENV === "test" ? "silent" : "info",
  transport: isLocalDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
        },
      }
    : undefined,
});
