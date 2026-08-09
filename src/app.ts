import { Hono } from "hono";

export const app = new Hono()
	.get("/hello", (c) => {
		return c.text("Hello Hono!");
	})
	.get("/health", (c) => c.json({ status: "ok" }))
	.post("/echo", async (c) => {
		const payload = await c.req.text();
		return c.json({ timestamp: Date.now(), payload });
	});

export default app;
