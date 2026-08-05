import { Hono } from "hono";
import { notifyReady, startWatchdog } from "./systemd";

const app = new Hono();

app
	.get("/hello", (c) => {
		return c.text("Hello Hono!");
	})
	.get("/health", (c) => c.json({ status: "ok" }));

startWatchdog();

console.log(process.env);
console.log(process.env.NODE_ENV);

const port = process.env.NODE_ENV === "production" ? 63212 : 63211;

const hostname = "127.0.0.1";

const server = Bun.serve({
	port,
	hostname,
	fetch: app.fetch
});
console.log(`bun-hono1 is running on http://${hostname}:${port}`);

notifyReady();

export default server;
