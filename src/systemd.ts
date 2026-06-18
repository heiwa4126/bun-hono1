import { dlopen, FFIType } from "bun:ffi";

// FFI のシンボル型を厳密に定義
interface SystemdLib {
	symbols: {
		sd_notify: (unset_environment: number, state: Uint8Array) => number;
	};
}

let libsystemd: SystemdLib | null = null;

try {
	libsystemd = dlopen("libsystemd.so.0", {
		sd_notify: {
			args: [FFIType.i32, FFIType.cstring],
			returns: FFIType.i32,
			// async: true は削除。メインスレッドで同期実行させ、
			// イベントループのハングアップを systemd が検知できるようにします。
		},
	}) as unknown as SystemdLib;
} catch (err) {
	console.warn(`[systemd] libsystemd.so.0 not found. Skipping notify. Error: ${err}`);
}

/**
 * sd_notify でステート文字列を同期的に送信する。
 */
export function notify(state: string): void {
	// SOCKET が環境変数にない、またはライブラリがない場合は即リターン
	if (!libsystemd || !process.env.NOTIFY_SOCKET) return;

	// C言語が理解できる Null終端のバイト配列(Buffer)に変換
	// 末尾に \n を添えておくのが systemd プロトコルのベストプラクティス
	const cString = Buffer.from(state + "\n\0", "utf8");

	// 同期実行するため、結果はダイレクトに number で返ってきます
	const result = libsystemd.symbols.sd_notify(0, cString);

	if (result < 0) {
		console.error(`[systemd] Notification failed with code: ${result}`);
	}
}

/**
 * Watchdog の heartbeat と SIGTERM ハンドラを登録する。
 */
export function startWatchdog(): void {
	process.on("SIGTERM", () => {
		// 終了処理も同期で行う方がプロセス終了間際の挙動として安全です
		notify("STOPPING=1");
		process.exit(0);
	});

	const watchdogUsec = process.env.WATCHDOG_USEC;
	if (!watchdogUsec) return;

	// 指定された秒数の半分の周期でハートビートを送信
	const pingIntervalMs = Math.floor(parseInt(watchdogUsec, 10) / 1000 / 2);

	setInterval(() => {
		// もしイベントループが死んでいたら、このタイマー自体が呼ばれなくなり
		// 正しく systemd の Watchdog タイムアウトがトリガーされます
		notify("WATCHDOG=1");
	}, pingIntervalMs);

	console.log(`[systemd] Native Watchdog started: Pinging every ${pingIntervalMs}ms`);
}

/**
 * サーバーがポートをバインドした後に呼び出す。
 */
export function notifyReady(status = "App is running natively via bun:ffi"): void {
	notify(`READY=1\nSTATUS=${status}`);
}
