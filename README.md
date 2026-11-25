# Deplo Desktop

Deplo Desktop is the Electron distribution of the Deplo deployment platform.
It packages the existing Next.js application in a native desktop window while
preserving the web application’s routes, authentication, dashboard, and API
proxy.

## Highlights

- Next.js App Router interface
- Electron desktop shell for macOS, Windows, and Linux
- Secure renderer configuration with context isolation and sandboxing
- GitHub OAuth handled inside the desktop window
- Local standalone Next.js server bundled into production builds
- Deplo-branded macOS application icon and installer

## Requirements

- Node.js 20 or newer
- npm
- macOS, Windows, or Linux for development
- Xcode Command Line Tools on macOS when creating `.icns` assets or installers

## Installation

Install the project dependencies from the repository root:

```bash
npm install
```

## Development

### Run the web application

```bash
npm run dev:web
```

The web application is available at <http://localhost:3000>.

### Run the desktop application

```bash
npm run dev
```

This starts the Next.js development server and opens an Electron window at the
same local application. Changes to the Next.js source are reflected by the
development server.

### Environment configuration

The frontend uses the server-side `API_URL` value for backend requests. Create
an environment file for local development when a local backend is available:

```dotenv
API_URL=http://127.0.0.1:4000
NEXT_PUBLIC_APP_ENABLED=true
```

Packaged builds default to the deployed Deplo API:

```text
https://deplo-ai.onrender.com
```

Set `API_URL` before packaging if a different backend should be used.

## Production builds

### Build the standalone web output

```bash
npm run build:web
```

This runs `next build` and copies the static assets required by the Next.js
standalone server into `.next/standalone`.

### Build desktop installers

```bash
npm run build:desktop
```

Installers are written to `dist/`. The configured targets are:

| Platform | Output |
| --- | --- |
| macOS | DMG and ZIP (arm64) |
| Windows | NSIS installer |
| Linux | AppImage |

### Build an unsigned macOS DMG (Apple Silicon)

```bash
npm run build:mac
```

This runs `build:web` and then packages the desktop app for macOS, producing
an **unsigned, arm64-only** DMG and ZIP in `dist/`:

```text
dist/Deplo-<version>-arm64.dmg
dist/Deplo-<version>-arm64-mac.zip
```

No Apple Developer account, certificate, or notarization credentials are
required or used — `mac.identity`, `mac.notarize`, and `mac.gatekeeperAssess`
are explicitly disabled in the `build` config in `package.json`. This is
intended for development and testing distribution only; see
[macOS first launch](#macos-first-launch) for what end users need to do to
open an unsigned build, and the **Public distribution** note below for what
real App Store / Developer ID distribution would additionally require.

To run the packaged-style application locally after building the web output:

```bash
npm run build:web
npm run start:desktop
```

## Authentication

GitHub OAuth is routed through the Electron window:

1. The user selects **Launch App** or **Connect GitHub**.
2. The application opens the GitHub authorization flow.
3. GitHub redirects to the configured Deplo callback.
4. Electron maps the hosted callback back to the local bundled application.
5. The callback page stores the session token and routes to the dashboard or
   onboarding flow.

External websites unrelated to authentication continue to open in the system
browser.

The public landing page uses the `deplo://launch` protocol to open an
installed Deplo Desktop application. The packaged app registers this protocol
with macOS, Windows, and Linux and brings an existing app instance to the
foreground when the link is activated.

## macOS first launch

`npm run build:mac` (and `build:desktop` on macOS) produce an **unsigned**
build: no Apple Developer ID certificate and no notarization are applied.
This is a deliberate, free development/testing distribution setup. The app
is additionally **ad-hoc signed** after packaging (`electron/afterPack.cjs`,
`codesign --sign -`) — a free, local, no-identity signature that requires no
Apple account or certificate. It does not make Gatekeeper trust the app, but
it satisfies Apple Silicon's requirement that an arm64 binary carry *some*
signature, which is what keeps macOS from hard-blocking it outright.

### The two different Gatekeeper messages

- ***"Deplo.app" is damaged and can't be opened. You should move it to the
  Bin.*** — this means the arm64 binary has **no signature at all**. It
  should no longer happen on DMGs built after the ad-hoc-signing fix above;
  if you see it on an older downloaded build, re-download the latest release
  or use the `xattr` command below — there is no "Open Anyway" button for
  this specific message.
- ***"Deplo" cannot be opened because Apple cannot check it for malicious
  software*** (or *"...is from an unidentified developer"*) — this is the
  normal, expected warning for any unsigned-by-Apple app, including this
  ad-hoc-signed one, and **does** have an override.

### Installing and opening the DMG

1. Download or copy `Deplo-<version>-arm64.dmg`.
2. Double-click it to mount the disk image.
3. Drag `Deplo.app` into the `Applications` shortcut shown in the same
   window.
4. Eject the mounted DMG and open `Deplo` from `Applications` (Launchpad or
   Finder).
5. If macOS blocks the launch with the *"Apple cannot check it for malicious
   software"* message, go to **System Settings → Privacy & Security**, scroll to the
   bottom, and click **Open Anyway** next to the blocked-app notice, then
   confirm in the dialog that appears (you may be asked for your password or
   Touch ID). On older macOS versions, Control-click (or right-click) the app
   in `Applications`, choose **Open**, and confirm the prompt instead — only
   do either if you trust the source of this build.

### Optional: clearing the quarantine attribute manually

macOS tags every file downloaded from the internet (including a mounted DMG's
contents, once copied out) with a `com.apple.quarantine` extended attribute,
which is what triggers the Gatekeeper prompt above. If the **Open Anyway**
flow above doesn't resolve it, the quarantine attribute can be removed by hand
from a Terminal:

```bash
xattr -cr "/Applications/Deplo.app"
```

**Security implications — read before running this:** `xattr -cr` strips
**every** extended attribute from the app bundle, including the quarantine
flag, which is the same signal Gatekeeper uses to warn about *any*
unidentified or tampered software, not just this app. Running it tells macOS
to stop checking this specific copy entirely. Only run it against a build you
built yourself or otherwise fully trust — never run it against a DMG from an
untrusted or unexpected source as a way to "get past" a security warning.
This command is never run automatically by the build or by this
documentation; it is a manual, user-initiated opt-out.

### Public distribution (not configured here)

For a build that opens without any Gatekeeper prompt — e.g. distributing to
users outside your own machine — you would additionally need a paid Apple
Developer ID Application certificate and notarization credentials, supplied
to `electron-builder` via the standard environment variables:

```text
CSC_NAME
APPLE_ID
APPLE_APP_SPECIFIC_PASSWORD
APPLE_TEAM_ID
```

None of these are configured, required, or read by the current `build:mac`
script — `mac.identity: null`, `mac.notarize: false`, and
`mac.gatekeeperAssess: false` in `package.json`'s `build` config explicitly
disable signing, notarization, and the local Gatekeeper-assessment check for
every macOS build, regardless of what certificates may or may not be present
in the local keychain. Never commit certificates, passwords, API keys, or
other secrets to the repository.

## Validation commands

Run the project checks before submitting changes:

```bash
npm run typecheck
npm run lint
npm run build:web
```

`npm run lint` may report existing warnings from the Next.js application. The
command should complete without errors.

## Project structure

```text
app/                 Next.js routes and pages
components/          Shared UI components
context/             React application context
hooks/               Reusable React hooks
lib/                 Authentication, API, and shared utilities
public/              Static assets
electron/            Electron main process, preload, and app icon
scripts/             Build support scripts
```

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js and Electron together |
| `npm run dev:web` | Start only the Next.js development server |
| `npm run build:web` | Build the standalone Next.js application |
| `npm run build:desktop` | Build platform desktop installers |
| `npm run build:mac` | Build an unsigned macOS arm64 DMG + ZIP |
| `npm run start:desktop` | Launch the locally built desktop application |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |
| `npm run lint` | Run ESLint |

## License

This project is private and intended for the Deplo product team.
