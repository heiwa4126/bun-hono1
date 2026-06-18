import { dlopen, FFIType } from "bun:ffi";
import { Hono } from "hono";

const app = new Hono();

app
	.get("/", (c) => {
		return c.text("Hello Hono!");
	})
	.get("/api/health", (c) => c.json({ status: "ok" }));

// 1. OS標準の systemd ライブラリを直接メモリに読み込む
let libsystemd: any;
try {
	libsystemd = dlopen("libsystemd.so.0", {
		sd_notify: {
			args: [FFIType.i32, FFIType.cstring],
			returns: FFIType.i32,
		},
	});
} catch (_err) {
	// MacやWindowsなど、systemdがないローカル環境では安全にスキップ
	console.warn("[systemd] libsystemd.so.0 not found. Skipping notify.");
}

// 2. 通知用ヘルパー関数
function notify(state: string) {
	if (!libsystemd || !process.env.NOTIFY_SOCKET) return;

	// 【修正】JavaScriptの文字列を、C言語が理解できるNull終端のBufferに変換する
	const cString = Buffer.from(state + "\0", "utf8");

	// 変換した cString を渡す
	const result = libsystemd.symbols.sd_notify(0, cString);

	if (result < 0) {
		console.error(`[systemd] Notification failed with code: ${result}`);
	}
}

// ==========================================
// 起動処理と Watchdog の設定
// ==========================================

// 起動完了を通知（これで systemctl start が完了状態になる）
notify("READY=1\nSTATUS=App is running natively via bun:ffi");

const watchdogUsec = process.env.WATCHDOG_USEC;
if (watchdogUsec) {
	const pingIntervalMs = Math.floor(parseInt(watchdogUsec, 10) / 1000 / 2);

	setInterval(() => {
		notify("WATCHDOG=1");
	}, pingIntervalMs);

	console.log(`[systemd] Native Watchdog started: Pinging every ${pingIntervalMs}ms`);
}

export default {
	port: process.env.NODE_ENV === "production" ? 63212 : 63211,
	hostname: "127.0.0.1",
	fetch: app.fetch,
};
