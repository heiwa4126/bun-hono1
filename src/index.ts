import { execFile } from "child_process";
import { Hono } from "hono";

const app = new Hono();

app
	.get("/", (c) => {
		return c.text("Hello Hono!");
	})
	.get("/api/health", (c) => c.json({ status: "ok" }));

// systemdへ通知を送るヘルパー関数
function sendSystemd(args: string[]) {
	// systemd環境以外（ローカル開発時など NOTIFY_SOCKET が無い場合）は何もしない
	if (!process.env.NOTIFY_SOCKET) return;

	// OS標準のコマンドを直接実行する
	execFile("systemd-notify", args, (error) => {
		// コマンドが失敗してもNode.js自体は止めず、ログだけ残す
		if (error) {
			console.error("[systemd] Notification failed:", error.message);
		}
	});
}

// ==========================================
// 1. 起動完了をsystemdに通知（ステータス文字付き）
// ==========================================
sendSystemd(["--ready", "--status=Server is running"]);

// ==========================================
// 2. Watchdog（ハートビート）のセットアップ
// ==========================================
// systemd側から WATCHDOG_USEC (マイクロ秒) という環境変数が渡されます
const watchdogUsec = process.env.WATCHDOG_USEC;

if (watchdogUsec) {
	// マイクロ秒(μs) → ミリ秒(ms) に変換し、余裕を持って制限時間の「半分」の間隔でPingを打つ
	const pingIntervalMs = Math.floor(parseInt(watchdogUsec, 10) / 1000 / 2);

	setInterval(() => {
		sendSystemd(["WATCHDOG=1"]);
	}, pingIntervalMs);

	console.log(`[systemd] Watchdog started: Pinging every ${pingIntervalMs}ms`);
}

export default {
	port: process.env.NODE_ENV === "production" ? 63212 : 63211,
	hostname: "127.0.0.1",
	fetch: app.fetch,
};
