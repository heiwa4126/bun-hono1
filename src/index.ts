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
			async: true, // スレッドプールで実行し、イベントループをブロックしない
		},
	});
} catch (_err) {
	// MacやWindowsなど、systemdがないローカル環境では安全にスキップ
	console.warn("[systemd] libsystemd.so.0 not found. Skipping notify.");
}

// 2. 通知用ヘルパー関数（async化：cStringをawait完了まで保持してGCを防ぐ）
async function notify(state: string): Promise<void> {
	if (!libsystemd || !process.env.NOTIFY_SOCKET) return;

	const cString = Buffer.from(state + "\0", "utf8");

	// async: true により Promise<number> を返す。await で完了を待つことで cString の GC も防ぐ
	const result = await (libsystemd.symbols.sd_notify(0, cString) as Promise<number>);

	if (result < 0) {
		console.error(`[systemd] Notification failed with code: ${result}`);
	}
}

// ==========================================
// 起動処理と Watchdog の設定
// ==========================================

// 3. SIGTERM 受信時に STOPPING=1 を送信してから終了
process.on("SIGTERM", async () => {
	await notify("STOPPING=1");
	process.exit(0);
});

const watchdogUsec = process.env.WATCHDOG_USEC;
if (watchdogUsec) {
	const pingIntervalMs = Math.floor(parseInt(watchdogUsec, 10) / 1000 / 2);

	setInterval(() => {
		notify("WATCHDOG=1");
	}, pingIntervalMs);

	console.log(`[systemd] Native Watchdog started: Pinging every ${pingIntervalMs}ms`);
}

// 1. Bun.serve() を明示的に呼び出してポートバインド完了を確認してから READY=1 を送信
const server = Bun.serve({
	port: process.env.NODE_ENV === "production" ? 63212 : 63211,
	hostname: "127.0.0.1",
	fetch: app.fetch,
});

await notify("READY=1\nSTATUS=App is running natively via bun:ffi");

export default server;
