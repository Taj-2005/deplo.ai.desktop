# Deplo

Deplo is a Next.js web application that can also run as a desktop app through
Electron. The Electron layer is a secure shell around the existing UI, so the
same routes, authentication flow, and API proxy are used in both environments.

## Web development

```bash
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000).

## Desktop development

```bash
npm run dev
```

This starts Next.js and opens the Electron window against the local development
server. The backend API remains configured through `API_URL`, just as it is for
the web app.

## Build desktop installers

```bash
npm run build:desktop
```

The command creates a Next.js standalone server, bundles it with Electron, and
writes platform installers to `dist/`. `electron-builder` targets macOS,
Windows, and Linux according to the current host configuration.

To run the packaged-style Electron shell against a locally built Next server:

```bash
npm run build:web
npm run start:desktop
```

### macOS first launch

Local builds are not signed unless a valid Apple Developer ID certificate is
available on the build machine. macOS may therefore block a downloaded DMG.
For local testing, open the DMG, move `Deplo.app` to Applications, then
Control-click the app and choose **Open**. If macOS still blocks the local
build, remove the download quarantine from the copied app:

```bash
xattr -dr com.apple.quarantine /Applications/Deplo.app
```

For public distribution, configure an Apple Developer ID Application
certificate and notarization credentials before running `npm run build:desktop`.
`electron-builder` will use the standard `CSC_NAME`, `APPLE_ID`,
`APPLE_APP_SPECIFIC_PASSWORD`, and `APPLE_TEAM_ID` environment variables.

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Electron Documentation](https://www.electronjs.org/docs/latest/)
- [electron-builder Documentation](https://www.electron.build/)
