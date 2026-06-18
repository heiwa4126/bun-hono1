import { Hono } from "hono";
import notify from "sd-notify";

const app = new Hono();

app
	.get("/", (c) => {
		return c.text("Hello Hono!");
	})
	.get("/api/health", (c) => c.json({ status: "ok" }));

// 起動完了をsystemdに通知
notify.ready();

// systemd watchdog heartbeat
const watchdogInterval = notify.watchdogInterval();
if (watchdogInterval > 0) {
	notify.startWatchdogMode(Math.floor(watchdogInterval / 2));
}

export default {
	port: process.env.NODE_ENV === "production" ? 63212 : 63211,
	hostname: "127.0.0.1",
	fetch: app.fetch,
};
