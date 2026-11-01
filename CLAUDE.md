# @helder-studio/dev-dock

nShared rules, commands and conventions: @AGENTS.md

Shared floating dev panel for React Native QA builds; tools plug in as tabs. PDF: Phase 3
"Extract dev-dock".

## Layout

- `src/core.ts`: `DevDockTab` type, `dockLabel`, `devDock` open/close store (no RN imports).
- `src/DevDock.tsx`: draggable button (PanResponder + Animated) and Modal with a tab bar.
- `src/storage.ts` + `src/StorageTab.tsx`: `storageTab({ storage, listKeys })`; storage typed
  structurally (no dependency). Adapters can't list keys, so the user passes `listKeys`.
- `src/noop.ts`: same API, renders nothing.

## Decisions

- No package depends on dev-dock: tools export a structurally typed tab (`networkChaosTab`,
  `timewarpTab`) from their native entry, and users pass them to `<DevDock tabs>`.
- RN only for now; web DOM panel later (the tools' panels are RN components).

## Commands

`pnpm verify`, `pnpm changeset`.
