/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, shell, session } = require("electron");
const { spawn } = require("node:child_process");
const path = require("node:path");

const isDevelopment = process.argv.includes("--dev");
const port = Number(process.env.PORT) || 3000;
let nextServer;

function getAppUrl() {
  return `http://127.0.0.1:${port}`;
}

function isHostedAppUrl(url) {
  const { hostname } = new URL(url);
  return hostname === "deplo.in" || hostname === "www.deplo.in";
}

function isAllowedAppNavigation(url) {
  const { hostname, origin } = new URL(url);
  if (origin === getAppUrl()) {
    return true;
  }

  // GitHub must remain in the Electron window during OAuth. The hosted app
  // domains are handled separately in will-navigate and mapped to localhost.
  return (
    hostname === "github.com" ||
    hostname.endsWith(".github.com")
  );
}

function startNextServer() {
  const serverPath = path.join(app.getAppPath(), ".next", "standalone", "server.js");

  nextServer = spawn(process.execPath, [serverPath], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      HOSTNAME: "127.0.0.1",
      PORT: String(port),
      API_URL: process.env.API_URL || "https://deplo-ai.onrender.com",
    },
    stdio: "inherit",
  });

  nextServer.on("error", (error) => {
    console.error("Unable to start the Next.js server:", error);
  });
}

async function waitForNextServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      await fetch(getAppUrl());
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  throw new Error(`Next.js server did not start at ${getAppUrl()}`);
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: "#0b0b0f",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });

  window.webContents.on("will-navigate", (event, url) => {
    if (isHostedAppUrl(url)) {
      const hostedUrl = new URL(url);
      event.preventDefault();
      void window.loadURL(
        `${getAppUrl()}${hostedUrl.pathname}${hostedUrl.search}${hostedUrl.hash}`,
      );
      return;
    }

    if (!isAllowedAppNavigation(url)) {
      event.preventDefault();
      void shell.openExternal(url);
    }
  });

  void window.loadURL(getAppUrl());
}

app.whenReady().then(async () => {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });

  if (!isDevelopment) {
    startNextServer();
    await waitForNextServer();
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (nextServer && !nextServer.killed) {
    nextServer.kill();
  }
});
