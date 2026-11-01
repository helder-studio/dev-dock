import { describe, expect, it } from 'vitest';
import { formatValue, loadEntries, previewValue, validateEdit } from './storage';

function memory(initial: Record<string, string>) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => {
      if (k === 'broken') throw new Error('read failed');
      return map.get(k) ?? null;
    },
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    keys: () => [...map.keys(), 'broken'],
  };
}

describe('loadEntries', () => {
  it('reads keys sorted, survives failing reads and filters by key or value', async () => {
    const s = memory({ 'b:theme': 'dark', 'a:user': '{"name":"Ada"}' });
    expect(await loadEntries(s, s.keys)).toEqual([
      { key: 'a:user', value: '{"name":"Ada"}' },
      { key: 'b:theme', value: 'dark' },
      { key: 'broken', value: null },
    ]);
    expect((await loadEntries(s, async () => s.keys(), 'ADA')).map((e) => e.key)).toEqual([
      'a:user',
    ]);
    expect((await loadEntries(s, s.keys, 'theme')).map((e) => e.key)).toEqual(['b:theme']);
  });
});

describe('formatting', () => {
  it('pretty-prints JSON objects and leaves other text alone', () => {
    expect(formatValue('{"a":1}')).toBe('{\n  "a": 1\n}');
    expect(formatValue('42')).toBe('42');
    expect(formatValue('plain')).toBe('plain');
    expect(formatValue(null)).toBe('(empty)');
  });

  it('previews on one line with a cap', () => {
    expect(previewValue('{\n "a": 1\n}')).toBe('{ "a": 1 }');
    expect(previewValue('x'.repeat(100), 10)).toBe(`${'x'.repeat(10)}…`);
    expect(previewValue(null)).toBe('(empty)');
  });
});

describe('validateEdit', () => {
  it('keeps JSON values valid JSON', () => {
    expect(validateEdit('{"a":1}', '{"a":2}')).toBe(null);
    expect(validateEdit('{"a":1}', '{"a":')).toMatch(/not valid JSON/);
    expect(validateEdit('plain', 'anything {')).toBe(null);
    expect(validateEdit(null, 'new')).toBe(null);
  });
});
