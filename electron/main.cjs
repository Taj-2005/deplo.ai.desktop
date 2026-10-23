/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, shell, session } = require("electron");
const { spawn } = require("node:child_process");
const path = require("node:path");

const isDevelopment = process.argv.includes("--dev");
const port = Number(process.env.PORT) || 3000;
let nextServer;
let mainWindow;
let pendingDeepLink;

function getDeepLinkPath(url) {
  try {
    const deepLink = new URL(url);
    if (deepLink.protocol !== "deplo:") return "/";
    return deepLink.pathname === "/dashboard" ? "/dashboard" : "/";
  } catch {
    return "/";
  }
}

function handleDeepLink(url) {
  if (!url) return;
  if (!mainWindow) {
    pendingDeepLink = url;
    return;
  }
  void mainWindow.loadURL(`${getAppUrl()}${getDeepLinkPath(url)}`);
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
}

if (process.platform === "darwin") {
  app.on("open-url", (event, url) => {
    event.preventDefault();
    handleDeepLink(url);
  });
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

app.on("second-instance", (_event, commandLine) => {
  handleDeepLink(commandLine.find((argument) => argument.startsWith("deplo://")));
});

function getAppUrl() {
  return `http://127.0.0.1:${port}`;
}

function isHostedAppUrl(url) {
  const { hostname } = new URL(url);
  return hostname === "deplo.in" || hostname === "www.deplo.in";
}

function isProductionApiUrl(url) {
  return new URL(url).hostname === "deplo-ai.onrender.com";
}

function isLocalAppUrl(url) {
  const parsedUrl = new URL(url);
  return (
    (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1") &&
    parsedUrl.port === String(port)
  );
}

function getLocalAppUrl(url) {
  const localUrl = new URL(url);
  return `${getAppUrl()}${localUrl.pathname}${localUrl.search}${localUrl.hash}`;
}

function isAllowedAppNavigation(url) {
  const { hostname, origin } = new URL(url);
  if (origin === getAppUrl() || isLocalAppUrl(url)) {
    return true;
  }

  // GitHub must remain in the Electron window during OAuth. The hosted app
  // domains are handled separately in will-navigate and mapped to localhost.
  return (
    hostname === "github.com" ||
    hostname.endsWith(".github.com")
  );
}

function navigateInApp(url) {
  if (isLocalAppUrl(url)) {
    void mainWindow.loadURL(getLocalAppUrl(url));
    return true;
  }

  if (isHostedAppUrl(url)) {
    const hostedUrl = new URL(url);
    void mainWindow.loadURL(
      `${getAppUrl()}${hostedUrl.pathname}${hostedUrl.search}${hostedUrl.hash}`,
    );
    return true;
  }

  if (isProductionApiUrl(url)) {
    void mainWindow.loadURL(url);
    return true;
  }

  if (isAllowedAppNavigation(url)) {
    void mainWindow.loadURL(url);
    return true;
  }

  return false;
}

function handleNavigation(event, url) {
  if (new URL(url).origin === getAppUrl()) {
    return;
  }

  if (
    isLocalAppUrl(url) ||
    isHostedAppUrl(url) ||
    isProductionApiUrl(url) ||
    isAllowedAppNavigation(url)
  ) {
    event.preventDefault();
    navigateInApp(url);
    return;
  }

  if (!isAllowedAppNavigation(url)) {
    event.preventDefault();
    void shell.openExternal(url);
  }
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
  mainWindow = new BrowserWindow({
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

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("deplo://")) {
      handleDeepLink(url);
      return { action: "deny" };
    }
    if (
      isHostedAppUrl(url) ||
      isProductionApiUrl(url) ||
      isAllowedAppNavigation(url)
    ) {
      navigateInApp(url);
      return { action: "deny" };
    }
    if (url.startsWith("https://") || url.startsWith("http://")) {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    handleNavigation(event, url);
  });

  mainWindow.webContents.on("will-redirect", (event, url) => {
    handleNavigation(event, url);
  });

  void mainWindow.loadURL(getAppUrl());
}

app.whenReady().then(async () => {
  if (!gotSingleInstanceLock) return;

  if (isDevelopment && process.platform === "darwin") {
    app.setAsDefaultProtocolClient("deplo", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  } else {
    app.setAsDefaultProtocolClient("deplo");
  }

  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });

  if (!isDevelopment) {
    startNextServer();
    await waitForNextServer();
  }

  createWindow();
  handleDeepLink(
    pendingDeepLink ||
      process.argv.find((argument) => argument.startsWith("deplo://")),
  );

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
