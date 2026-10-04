import { closeSync, openSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const lockPath = join(projectRoot, ".agncy-dev.lock");
const nextPath = join(projectRoot, ".next");
const require = createRequire(import.meta.url);

function isRunning(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function readLock() {
  try {
    return JSON.parse(readFileSync(lockPath, "utf8"));
  } catch {
    return null;
  }
}

function acquireLock() {
  try {
    const descriptor = openSync(lockPath, "wx");
    writeFileSync(descriptor, JSON.stringify({ ownerPid: process.pid }));
    closeSync(descriptor);
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("EEXIST")) throw error;
    const lock = readLock();
    if (isRunning(lock?.ownerPid) || isRunning(lock?.childPid)) {
      console.error("Agncy dev server is already running. Reuse the existing server instead of starting another one.");
      process.exit(1);
    }
    unlinkSync(lockPath);
    acquireLock();
  }
}

function releaseLock() {
  const lock = readLock();
  if (lock?.ownerPid === process.pid) {
    try { unlinkSync(lockPath); } catch { /* already removed */ }
  }
}

acquireLock();
rmSync(nextPath, { recursive: true, force: true });

const nextBin = require.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, "dev"], { cwd: projectRoot, stdio: "inherit" });
writeFileSync(lockPath, JSON.stringify({ ownerPid: process.pid, childPid: child.pid }));

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
process.on("exit", releaseLock);
child.on("error", (error) => {
  console.error(error);
  releaseLock();
  process.exit(1);
});
child.on("exit", (code) => {
  releaseLock();
  process.exit(code ?? 1);
});
