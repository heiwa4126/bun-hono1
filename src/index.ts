import crypto from "crypto";
import fs from "fs";
import { Hono } from "hono";
import { DgramSocket } from "node-unix-socket";
import os from "os";
import path from "path";

const app = new Hono();

app
	.get("/", (c) => {
		return c.text("Hello Hono!");
	})
	.get("/api/health", (c) => c.json({ status: "ok" }));

let notifySocket: InstanceType<typeof DgramSocket> | null = null;

function getNotifySocket(): InstanceType<typeof DgramSocket> | null {
	if (notifySocket) return notifySocket;

	// クライアント側もbindが必要なので、プロセス固有の一時パスにbindする
	const bindPath = path.resolve(
		os.tmpdir(),
		`sd-notify-${process.pid}-${crypto.randomBytes(4).toString("hex")}.sock`,
	);
	try {
		fs.unlinkSync(bindPath);
	} catch (e) {
		// 既存ファイルがなければ無視
	}

	const socket = new DgramSocket();
	socket.bind(bindPath);

	// プロセス終了時にソケットファイルを掃除
	process.on("exit", () => {
		try {
			fs.unlinkSync(bindPath);
		} catch (e) {}
	});

	notifySocket = socket;
	return socket;
}

function sdNotify(message: string) {
	const target = process.env.NOTIFY_SOCKET;
	if (!target) return;

	const socket = getNotifySocket();
	if (!socket) return;

	const buf = Buffer.from(message);
	try {
		socket.sendTo(buf, 0, buf.length, target);
	} catch (err) {
		console.error("sd_notify failed:", err);
	}
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
