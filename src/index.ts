import { Hono } from "hono";
import { connect } from "net";

const app = new Hono();

app
	.get("/", (c) => {
		return c.text("Hello Hono!");
	})
	.get("/api/health", (c) => c.json({ status: "ok" }));

function sdNotify(message: string) {
	const socketPath = process.env.NOTIFY_SOCKET;
	if (!socketPath) return;
	const sock = connect({ path: socketPath }, () => {
		sock.write(message);
		sock.end();
	});
	sock.on("error", (err) => {
		console.error("sd_notify failed:", err);
	});
}

// 起動完了をsystemdに通知（Type=notify必須）
sdNotify("READY=1");

// systemd watchdog heartbeat（WatchdogSec=60 の場合、30秒ごと）
if (process.env.WATCHDOG_USEC) {
	const interval = Math.floor(parseInt(process.env.WATCHDOG_USEC, 10) / 2 / 1000);
	setInterval(() => {
		sdNotify("WATCHDOG=1");
	}, interval);
}

export default {
	port: process.env.NODE_ENV === "production" ? 63212 : 63211,
	hostname: "127.0.0.1",
	fetch: app.fetch,
};
