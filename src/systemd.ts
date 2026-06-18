import { dlopen, FFIType } from "bun:ffi";

// OS標準の systemd ライブラリをロード(systemd がない環境では安全にスキップ)
let libsystemd: any;
try {
	libsystemd = dlopen("libsystemd.so.0", {
		sd_notify: {
			args: [FFIType.i32, FFIType.cstring],
			returns: FFIType.i32,
			async: true, // スレッドプールで実行し、イベントループをブロックしない
		},
	});
} catch (err) {
	console.warn(`[systemd] libsystemd.so.0 not found. Skipping notify. Error: ${err}`);
}

/**
 * sd_notify でステート文字列を送信する。
 * await することで cString が GC される前に FFI 呼び出しが完了することを保証する。
 */
export async function notify(state: string): Promise<void> {
	if (!libsystemd || !process.env.NOTIFY_SOCKET) return;

	const cString = Buffer.from(state + "\0", "utf8");
	const result = await (libsystemd.symbols.sd_notify(0, cString) as Promise<number>);

	if (result < 0) {
		console.error(`[systemd] Notification failed with code: ${result}`);
	}
}

/**
 * Watchdog の heartbeat と SIGTERM ハンドラを登録する。
 * Bun.serve() の前後どちらで呼んでも安全。
 */
export function startWatchdog(): void {
	process.on("SIGTERM", async () => {
		await notify("STOPPING=1");
		process.exit(0);
	});

	const watchdogUsec = process.env.WATCHDOG_USEC;
	if (!watchdogUsec) return;

	const pingIntervalMs = Math.floor(parseInt(watchdogUsec, 10) / 1000 / 2);
	setInterval(() => {
		notify("WATCHDOG=1");
	}, pingIntervalMs);

	console.log(`[systemd] Native Watchdog started: Pinging every ${pingIntervalMs}ms`);
}

/**
 * サーバーがポートをバインドした後に呼び出す。
 * systemd に起動完了(READY=1)を通知する。
 */
export async function notifyReady(status = "App is running natively via bun:ffi"): Promise<void> {
	await notify(`READY=1\nSTATUS=${status}`);
}
