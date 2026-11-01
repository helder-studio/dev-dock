import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { DevDockTab } from './core';
import {
  formatValue,
  loadEntries,
  previewValue,
  type StorageEntry,
  type StorageLike,
  validateEdit,
} from './storage';

export interface StorageTabOptions {
  storage: StorageLike;
  /** Lists the keys, e.g. `() => AsyncStorage.getAllKeys()` or `() => mmkv.getAllKeys()`. */
  listKeys: () => readonly string[] | Promise<readonly string[]>;
  /** Tab title. Default `'Storage'`. */
  title?: string;
  /** Tab id, when you add more than one storage tab. Default `'storage'`. */
  id?: string;
}

/** A dev-dock tab to search, view, edit and delete stored keys on the device. */
export function storageTab(options: StorageTabOptions): DevDockTab {
  return {
    id: options.id ?? 'storage',
    title: options.title ?? 'Storage',
    render: () => <StoragePanel {...options} />,
  };
}

function StoragePanel({ storage, listKeys }: StorageTabOptions) {
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState<StorageEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const refresh = useCallback(() => {
    loadEntries(storage, listKeys, search).then(setEntries, (e: unknown) =>
      setError(e instanceof Error ? e.message : String(e)),
    );
  }, [storage, listKeys, search]);
  useEffect(refresh, [refresh]);

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.row}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search keys and values"
          accessibilityLabel="Search keys and values"
          style={[styles.input, styles.flex]}
          autoCapitalize="none"
        />
        <Pressable accessibilityRole="button" onPress={refresh} hitSlop={8} style={styles.button}>
          <Text style={styles.buttonText}>Refresh</Text>
        </Pressable>
      </View>
      {error && <Text style={styles.error}>Could not list keys: {error}</Text>}
      {entries?.length === 0 && <Text style={styles.muted}>No keys.</Text>}
      {entries?.map((entry) => (
        <View key={entry.key} style={styles.entry}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: open === entry.key }}
            onPress={() => setOpen(open === entry.key ? null : entry.key)}
          >
            <Text style={styles.key}>{entry.key}</Text>
            {open !== entry.key && <Text style={styles.muted}>{previewValue(entry.value)}</Text>}
          </Pressable>
          {open === entry.key && (
            <Editor
              entry={entry}
              onSave={async (value) => {
                await storage.setItem(entry.key, value);
                refresh();
              }}
              onDelete={async () => {
                await storage.removeItem(entry.key);
                setOpen(null);
                refresh();
              }}
            />
          )}
        </View>
      ))}
    </ScrollView>
  );
}

function Editor({
  entry,
  onSave,
  onDelete,
}: {
  entry: StorageEntry;
  onSave: (value: string) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [text, setText] = useState(() => formatValue(entry.value));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const invalid = validateEdit(entry.value, text);
  return (
    <View style={styles.editor}>
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={`Value of ${entry.key}`}
        style={[styles.input, styles.code]}
      />
      {invalid && <Text style={styles.error}>{invalid}</Text>}
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: Boolean(invalid) }}
          disabled={Boolean(invalid)}
          onPress={() => void onSave(text)}
          style={[styles.button, invalid ? styles.disabled : undefined]}
        >
          <Text style={styles.buttonText}>Save</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => (confirmDelete ? void onDelete() : setConfirmDelete(true))}
          style={[styles.button, styles.danger]}
        >
          <Text style={styles.buttonText}>{confirmDelete ? 'Tap again to delete' : 'Delete'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
  input: { borderWidth: 1, borderColor: '#dadce0', borderRadius: 8, padding: 10, minHeight: 44 },
  code: { fontFamily: 'Courier', fontSize: 12, minHeight: 120, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    paddingHorizontal: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  danger: { backgroundColor: '#d93025' },
  disabled: { opacity: 0.5 },
  entry: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#dadce0',
  },
  key: { fontFamily: 'Courier', fontWeight: '600' },
  editor: { gap: 8, marginTop: 8 },
  muted: { color: '#5f6368', fontSize: 12 },
  error: { color: '#d93025' },
});
