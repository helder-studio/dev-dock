import type { DevDockProps } from './DevDock';

export type { DevDockTab } from './core';
export type { DevDockProps } from './DevDock';

const noop = () => {};

/** Production stand-in: alias `@helder-studio/dev-dock` to `@helder-studio/dev-dock/noop`. */
export const devDock = {
  open: noop,
  close: noop,
  select: noop,
  getState: () => ({ open: false, tabId: null }),
  subscribe: () => noop,
};

export const dockLabel = () => '';

export function DevDock(_props: DevDockProps): null {
  return null;
}

export type { StorageTabOptions } from './StorageTab';
export type { StorageEntry, StorageLike } from './storage';

export function storageTab(options: { id?: string; title?: string }) {
  return { id: options.id ?? 'storage', title: options.title ?? 'Storage', render: () => null };
}
