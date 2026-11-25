const { execFileSync } = require("node:child_process");
const path = require("node:path");

/**
 * Ad-hoc code-signs the packaged .app so Apple Silicon's Gatekeeper doesn't
 * hard-block it as "damaged" — an arm64 binary with literally no signature
 * fails that check outright, unlike Intel builds which only get the
 * softer "unidentified developer" prompt. `codesign --sign -` is a local,
 * free, ad-hoc signature: no Apple Developer account, certificate, or
 * notarization involved, and it does not identify the developer. The app
 * is still quarantined on download and still shows a Gatekeeper prompt —
 * just the normal "Open Anyway" one instead of "is damaged".
 */
module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") return;

  const appPath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);

  execFileSync("codesign", ["--force", "--deep", "--sign", "-", appPath], {
    stdio: "inherit",
  });
};
