import { Hono } from "hono";
import { spawnSync } from "node:child_process";

const app = new Hono();

app
	.get("/", (c) => {
		return c.text("Hello Hono!");
	})
	.get("/api/health", (c) => c.json({ status: "ok" }));

function sdNotify(args: string[]) {
	if (!process.env.NOTIFY_SOCKET) return;
	const result = spawnSync("/usr/bin/systemd-notify", args, { stdio: "ignore" });
	if (result.error || result.status !== 0) {
		console.error("sd_notify failed:", result.error ?? `exit ${result.status}`);
	}
}

// 起動完了をsystemdに通知（Type=notify 必須）
sdNotify(["--ready", `--pid=${process.pid}`]);

// systemd watchdog heartbeat（WATCHDOG_USEC の半分周期で送信）
const watchdogUsec = parseInt(process.env.WATCHDOG_USEC ?? "", 10);
const watchdogPid = parseInt(process.env.WATCHDOG_PID ?? "", 10);
if (
	Number.isFinite(watchdogUsec) &&
	watchdogUsec > 0 &&
	(Number.isNaN(watchdogPid) || watchdogPid === process.pid)
) {
	const intervalMs = Math.max(1000, Math.floor(watchdogUsec / 2 / 1000));
	setInterval(() => {
		sdNotify(["--watchdog", `--pid=${process.pid}`]);
	}, intervalMs).unref();
}

export default {
	port: process.env.NODE_ENV === "production" ? 63212 : 63211,
	hostname: "127.0.0.1",
	fetch: app.fetch,
};
