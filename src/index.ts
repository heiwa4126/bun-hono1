import { Hono } from "hono";

const app = new Hono();

app
	.get("/", (c) => {
		return c.text("Hello Hono!");
	})
	.get("/api/health", (c) => c.json({ status: "ok" }));

// systemd watchdog heartbeat（WatchdogSec=30 の場合、15秒ごと）
if (process.env.WATCHDOG_USEC) {
	const interval = Math.floor(parseInt(process.env.WATCHDOG_USEC) / 2 / 1000);
	setInterval(() => {
		Bun.spawn(["systemd-notify", "WATCHDOG=1"]);
	}, interval);
}

export default {
	port: 3000,
	hostname: "127.0.0.1",
	fetch: app.fetch,
};

// export default app;
