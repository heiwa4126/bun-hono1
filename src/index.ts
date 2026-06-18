import { Hono } from "hono";
import { notifyReady, startWatchdog } from "./systemd";

const app = new Hono();

app
	.get("/", (c) => {
		return c.text("Hello Hono!");
	})
	.get("/api/health", (c) => c.json({ status: "ok" }));

startWatchdog();

const server = Bun.serve({
	port: process.env.NODE_ENV === "production" ? 63212 : 63211,
	hostname: "127.0.0.1",
	fetch: app.fetch,
});

await notifyReady();

export default server;
