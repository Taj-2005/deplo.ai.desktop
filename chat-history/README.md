# Deplo Desktop Development History

This directory contains the desktop-only prompt-verification record for Deplo.
It documents how the existing Next.js client was packaged as an Electron
application, how the desktop navigation and GitHub OAuth flows were corrected,
and how each request was refined into an implementation-ready prompt.

The history is intentionally separate from the Deplo CLI export. It does not
copy or represent the CLI project's raw transcripts.

## Verification report

- [Desktop prompt verification report](./deplo-desktop-prompt-verification.html)
- The report was updated on **23 October 2026**.
- It contains five source requests, five refined prompts, implementation
  evidence, acceptance criteria, and a prompt-quality verification standard.

## Project repository

- [Deplo Desktop repository](https://github.com/Taj-2005/deplo.ai.desktop)
- [Main branch](https://github.com/Taj-2005/deplo.ai.desktop/tree/main)
- [Desktop chat-history branch](https://github.com/Taj-2005/deplo.ai.desktop/tree/chat-history/desktop-chat-history)
- [All phase commits](https://github.com/Taj-2005/deplo.ai.desktop/commits/chat-history/desktop-chat-history)

## What the desktop history covers

- Electron main process, preload bridge, sandboxing, and secure renderer
  configuration.
- Next.js standalone server startup and desktop packaging.
- `deplo://launch` protocol registration and single-instance behavior.
- In-app handling for local routes, hosted callbacks, and authentication.
- Deplo macOS icon generation, DMG validation, and unsigned-build guidance.
- Production GitHub OAuth startup, callback preservation, and local callback
  routing.
- The Phase 22 fix that lets GitHub's internal redirects proceed naturally
  without an Electron navigation loop.
- Public README, troubleshooting, validation, and release documentation.

## Prompt-quality standard

The refined prompts in the report are designed to be scored consistently.
Each one includes:

1. Repository or feature scope.
2. Intended behavior and user-visible outcome.
3. Technical, security, or compatibility constraints.
4. Edge cases and non-goals where they affect correctness.
5. Observable acceptance criteria.
6. Validation commands or manual verification steps.
7. Evidence connecting the request to the implementation.

## Auditable implementation phases

The table below follows the `chat-history/desktop-chat-history` branch and
contains all 23 phase commits.

| Phase | Commit | Scope |
| --- | --- | --- |
| 1 | [`da48e89`](https://github.com/Taj-2005/deplo.ai.desktop/commit/da48e89) | Establish project foundation |
| 2 | [`9b6b8aa`](https://github.com/Taj-2005/deplo.ai.desktop/commit/9b6b8aa) | Configure application shell and metadata |
| 3 | [`c738b11`](https://github.com/Taj-2005/deplo.ai.desktop/commit/c738b11) | Build landing experience |
| 4 | [`b74836d`](https://github.com/Taj-2005/deplo.ai.desktop/commit/b74836d) | Implement authentication and onboarding |
| 5 | [`ad28eda`](https://github.com/Taj-2005/deplo.ai.desktop/commit/ad28eda) | Add dashboard workspace |
| 6 | [`d735971`](https://github.com/Taj-2005/deplo.ai.desktop/commit/d735971) | Add documentation portal |
| 7 | [`9c4109c`](https://github.com/Taj-2005/deplo.ai.desktop/commit/9c4109c) | Add shared data and service utilities |
| 8 | [`769af7a`](https://github.com/Taj-2005/deplo.ai.desktop/commit/769af7a) | Add supporting pages and providers |
| 9 | [`8a411e9`](https://github.com/Taj-2005/deplo.ai.desktop/commit/8a411e9) | Add product and integration assets |
| 10 | [`e7ee433`](https://github.com/Taj-2005/deplo.ai.desktop/commit/e7ee433) | Package the Electron desktop application |
| 11 | [`6f9bd88`](https://github.com/Taj-2005/deplo.ai.desktop/commit/6f9bd88) | Add authentication flow |
| 12 | [`5f04c82`](https://github.com/Taj-2005/deplo.ai.desktop/commit/5f04c82) | Document desktop application workflow |
| 13 | [`bf6ecc0`](https://github.com/Taj-2005/deplo.ai.desktop/commit/bf6ecc0) | Add desktop prompt-verification history |
| 14 | [`482e0f9`](https://github.com/Taj-2005/deplo.ai.desktop/commit/482e0f9) | Refine desktop history report |
| 15 | [`577fdb7`](https://github.com/Taj-2005/deplo.ai.desktop/commit/577fdb7) | Open the desktop app from the landing page |
| 16 | [`fab5fb4`](https://github.com/Taj-2005/deplo.ai.desktop/commit/fab5fb4) | Keep authentication inside the desktop window |
| 17 | [`358fc81`](https://github.com/Taj-2005/deplo.ai.desktop/commit/358fc81) | Handle OAuth redirects inside Electron |
| 18 | [`cc677ad`](https://github.com/Taj-2005/deplo.ai.desktop/commit/cc677ad) | Route localhost OAuth callbacks into Electron |
| 19 | [`79c6140`](https://github.com/Taj-2005/deplo.ai.desktop/commit/79c6140) | Use production OAuth configuration on desktop |
| 20 | [`3909452`](https://github.com/Taj-2005/deplo.ai.desktop/commit/3909452) | Keep production OAuth startup inside Electron |
| 21 | [`57fc8ea`](https://github.com/Taj-2005/deplo.ai.desktop/commit/57fc8ea) | Preserve the registered GitHub callback URL |
| 22 | [`5b60c0c`](https://github.com/Taj-2005/deplo.ai.desktop/commit/5b60c0c) | Allow GitHub OAuth redirects to complete |
| 23 | [`093d6cc`](https://github.com/Taj-2005/deplo.ai.desktop/commit/093d6cc) | Strengthen the desktop prompt-verification report |

## Validation status

The latest desktop work was validated with:

```text
npm run typecheck
npm run lint
node --check electron/main.cjs
npm run build:web
npm run build:desktop
```

The lint command completes with one documented pre-existing warning related to
internal navigation through `window.location.assign()`.
