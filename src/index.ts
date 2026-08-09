import { notifyReady, startWatchdog } from "./systemd";

import app from "./app";

const port = Number.parseInt(process.env.PORT ?? "63211", 10);
const hostname = "127.0.0.1";

startWatchdog();

const server = Bun.serve({
	port,
	hostname,
	fetch: app.fetch
});
console.log(`bun-hono1 is running on http://${hostname}:${port}`);

notifyReady();

export default server;
