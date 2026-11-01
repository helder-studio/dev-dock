/** Any `@helder-studio/storage` adapter, typed structurally so dev-dock needs no dependency. */
export interface StorageLike {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

export interface StorageEntry {
  key: string;
  value: string | null;
}

/**
 * Reads every key `listKeys` returns, sorted, optionally filtered by a case-insensitive search
 * over keys and values. Keys that fail to read come back with a `null` value.
 */
export async function loadEntries(
  storage: StorageLike,
  listKeys: () => readonly string[] | Promise<readonly string[]>,
  search = '',
): Promise<StorageEntry[]> {
  const keys = [...(await listKeys())].sort();
  const entries = await Promise.all(
    keys.map(async (key) => {
      try {
        return { key, value: await storage.getItem(key) };
      } catch {
        return { key, value: null };
      }
    }),
  );
  const q = search.trim().toLowerCase();
  return q
    ? entries.filter(
        (e) => e.key.toLowerCase().includes(q) || (e.value ?? '').toLowerCase().includes(q),
      )
    : entries;
}

/** Pretty-prints JSON values; returns other text unchanged. */
export function formatValue(value: string | null): string {
  if (value === null) return '(empty)';
  try {
    const parsed = JSON.parse(value) as unknown;
    return typeof parsed === 'object' && parsed !== null ? JSON.stringify(parsed, null, 2) : value;
  } catch {
    return value;
  }
}

/** One-line preview for the list. */
export function previewValue(value: string | null, max = 80): string {
  const flat = value === null ? '(empty)' : value.replace(/\s+/g, ' ');
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
}

/**
 * Before saving an edit: if the stored value was JSON, the new text must be valid JSON too.
 * Returns an error message, or `null` when it's fine to save.
 */
export function validateEdit(original: string | null, edited: string): string | null {
  if (original === null) return null;
  try {
    JSON.parse(original);
  } catch {
    return null; // not JSON before: any text is fine
  }
  try {
    JSON.parse(edited);
    return null;
  } catch {
    return 'This value was JSON; the edit is not valid JSON.';
  }
}
