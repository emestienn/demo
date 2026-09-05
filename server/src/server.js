import http from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { initSockets } from "./sockets/index.js";
import { env } from "./config/env.js";

async function main() {
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin(origin, callback) {
        callback(null, env.isAllowedOrigin(origin));
      },
      credentials: true,
    },
  });
  initSockets(io);

  server.listen(env.PORT, () => {
    console.log(`[server] DONGNE API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error("[server] failed to start", err);
  process.exit(1);
});
