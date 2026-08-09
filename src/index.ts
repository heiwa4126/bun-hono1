import { Hono } from "hono";
import { notifyReady, startWatchdog } from "./systemd";

const app = new Hono();

app
	.get("/hello", (c) => {
		return c.text("Hello Hono!");
	})
	.get("/health", (c) => c.json({ status: "ok" }))
	.post("/echo", async (c) => {
		const payload = await c.req.text();
		return c.json({ timestamp: Date.now(), payload });
	});

startWatchdog();

const port = Number.parseInt(process.env.PORT ?? "63211", 10);
const hostname = "127.0.0.1";

const server = Bun.serve({
	port,
	hostname,
	fetch: app.fetch
});
console.log(`bun-hono1 is running on http://${hostname}:${port}`);

notifyReady();

export default server;
