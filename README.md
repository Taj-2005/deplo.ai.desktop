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
| macOS | DMG and ZIP |
| Windows | NSIS installer |
| Linux | AppImage |

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

## macOS first launch

Local builds are not signed or notarized unless valid Apple Developer
credentials are configured. macOS may show a security warning for a downloaded
DMG.

For local testing:

1. Open the DMG.
2. Drag `Deplo.app` into `Applications`.
3. Control-click the app and select **Open**.
4. Confirm the macOS security prompt.

If macOS still blocks the local build, remove the quarantine attribute from the
copied application:

```bash
xattr -dr com.apple.quarantine /Applications/Deplo.app
```

For public distribution, configure an Apple Developer ID Application
certificate and notarization credentials. `electron-builder` supports the
standard environment variables:

```text
CSC_NAME
APPLE_ID
APPLE_APP_SPECIFIC_PASSWORD
APPLE_TEAM_ID
```

Never commit certificates, passwords, API keys, or other secrets to the
repository.

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
| `npm run start:desktop` | Launch the locally built desktop application |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |
| `npm run lint` | Run ESLint |

## License

This project is private and intended for the Deplo product team.
