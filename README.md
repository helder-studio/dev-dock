<div align="center">

# @helder-studio/dev-dock

**One floating button for all your dev tools.**

A draggable dev panel for React Native QA builds. Network Chaos, Timewarp and your own tools plug in
as tabs, and the button shows what's active.

[![npm](https://img.shields.io/npm/v/@helder-studio/dev-dock?color=cb3837&logo=npm)](https://www.npmjs.com/package/@helder-studio/dev-dock)
[![bundle size](https://img.shields.io/bundlejs/size/@helder-studio/dev-dock?label=min%2Bgzip)](https://bundlejs.com/?q=@helder-studio/dev-dock)
[![CI](https://github.com/helder-studio/dev-dock/actions/workflows/ci.yml/badge.svg)](https://github.com/helder-studio/dev-dock/actions/workflows/ci.yml)
[![provenance](https://img.shields.io/badge/npm-provenance-2ea44f?logo=sigstore)](https://www.npmjs.com/package/@helder-studio/dev-dock#provenance)
[![license](https://img.shields.io/npm/l/@helder-studio/dev-dock?color=blue)](./LICENSE)

<!-- demo GIF -->

</div>

```sh
npm install @helder-studio/dev-dock
```

## Why

Every dev tool wants its own floating button. Three tools later, half the screen is badges. Dev Dock
gives them one button and one panel, and the button still tells you at a glance that the network is
flaky and the clock is on New Year's Eve.

## Quick start

```tsx
import { DevDock } from '@helder-studio/dev-dock';
import { NetworkChaos, networkChaosTab } from '@helder-studio/network-chaos';
import { timewarpTab } from '@helder-studio/timewarp';

const qa = __DEV__ || Config.QA_BUILD;

<NetworkChaos enabled={qa} storage={storage} badge={false}>
  <App />
  <DevDock enabled={qa} tabs={[networkChaosTab, timewarpTab]} />
</NetworkChaos>;
```

## Features

- 🧲 **One draggable button**: shows every active tool's status, e.g. `🛠 flaky · Time warped: 31 Dec`
- 🗂️ **Tabs**: each tool brings its own panel
- 🧩 **Bring your own tool**: a tab is a plain object, no dependency on dev-dock needed
- 🎛️ **Open from code**: `devDock.open('timewarp')` from a shake handler or your dev menu
- 🪶 **Core React Native only**: no Reanimated or Gesture Handler peer dependency, about 1.3 kB
- 🚫 **Production-safe**: `enabled={false}` renders nothing, and `/noop` drops it from release bundles

## Your own tab

```tsx
import type { DevDockTab } from '@helder-studio/dev-dock';

const featureFlagsTab: DevDockTab = {
  id: 'flags',
  title: 'Flags',
  status: () => (flags.overridden() ? `${flags.overrides().length} flags` : null),
  subscribe: flags.subscribe, // optional: refreshes the status
  render: () => <FlagsPanel />,
};
```

## API

| Export                     | What it does                                 |
| -------------------------- | -------------------------------------------- |
| `<DevDock enabled tabs />` | the button and panel                         |
| `devDock.open(tabId?)`     | opens the panel, on a tab if given           |
| `devDock.close()`          | closes it                                    |
| `DevDockTab`               | `{ id, title, status?, subscribe?, render }` |

## Coming soon

- Web version with a DOM panel
- Remember the button position across restarts

## Support

If this saves you time, you can buy me a coffee on Ko-fi. It keeps the helder-studio libraries maintained.

<a href="https://ko-fi.com/gorian" target="_blank" rel="noopener">
  <img src="https://storage.ko-fi.com/cdn/kofi3.png?v=6" alt="Support me on Ko-fi" height="40">
</a>

## License

[MIT](./LICENSE) © helder-studio
