import http from "node:http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./shared/lib/logger.js";
import { connectDatabaseWithRetry, disconnectDatabase } from "./db/index.js";

const SHUTDOWN_TIMEOUT_MS = 10_000;

const server = http.createServer(app);
// Keep sockets alive longer than the upstream proxy's idle timeout to avoid sporadic 502s.
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

server.listen(env.port, env.host, () => {
  logger.info({ port: env.port, host: env.host, nodeEnv: env.nodeEnv }, "backend listening");
  void connectDatabaseWithRetry();
});

server.on("error", (err) => {
  logger.fatal({ err }, "http server error");
  process.exit(1);
});

let shuttingDown = false;

async function shutdown(reason: string, exitCode: number) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ reason }, "shutting down");

  const forceExit = setTimeout(() => {
    logger.error("shutdown timed out; forcing exit");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  await new Promise<void>((resolve) => {
    server.close(() => resolve());
    server.closeIdleConnections();
    setTimeout(() => server.closeAllConnections(), SHUTDOWN_TIMEOUT_MS / 2).unref();
  });

  await disconnectDatabase();
  clearTimeout(forceExit);
  logger.info("shutdown complete");
  process.exit(exitCode);
}

process.on("SIGTERM", () => void shutdown("SIGTERM", 0));
process.on("SIGINT", () => void shutdown("SIGINT", 0));
process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "unhandled promise rejection");
  void shutdown("unhandledRejection", 1);
});
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "uncaught exception");
  void shutdown("uncaughtException", 1);
});
