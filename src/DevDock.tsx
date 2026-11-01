import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { type DevDockTab, devDock, dockLabel, sameStatuses } from './core';

export interface DevDockProps {
  /** Off: renders nothing. Pass something like `__DEV__ || Config.QA_BUILD`. */
  enabled: boolean;
  tabs: DevDockTab[];
}

function useStatuses(tabs: DevDockTab[]): (string | null)[] {
  const latest = useRef(tabs);
  latest.current = tabs;
  const read = () => latest.current.map((tab) => tab.status?.() ?? null);
  const [statuses, setStatuses] = useState(read);
  // An inline `tabs={[...]}` array is new on every render: re-subscribe only when the ids change.
  const ids = tabs.map((tab) => tab.id).join('|');
  // biome-ignore lint/correctness/useExhaustiveDependencies: `ids` stands for the tab list
  useEffect(() => {
    // Tools like network-chaos notify on every request; re-render only when a status changes.
    const refresh = () =>
      setStatuses((prev) => {
        const next = read();
        return sameStatuses(prev, next) ? prev : next;
      });
    refresh();
    const unsubscribers = latest.current.map((tab) => tab.subscribe?.(refresh));
    return () => {
      for (const unsubscribe of unsubscribers) unsubscribe?.();
    };
  }, [ids]);
  return statuses;
}

/** One draggable button for all dev tools; tap it to open their tabs. Core RN primitives only. */
export function DevDock({ enabled, tabs }: DevDockProps) {
  if (!enabled || tabs.length === 0) return null;
  return <Dock tabs={tabs} />;
}

function Dock({ tabs }: { tabs: DevDockTab[] }) {
  const dock = useSyncExternalStore(devDock.subscribe, devDock.getState);
  const statuses = useStatuses(tabs);
  const active = statuses.some(Boolean);
  const position = useRef(new Animated.ValueXY({ x: 12, y: 96 })).current;
  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => position.extractOffset(),
      onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_e, gesture) => {
        position.flattenOffset();
        if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) devDock.open();
      },
    }),
  ).current;
  const current = tabs.find((tab) => tab.id === dock.tabId) ?? tabs[0];
  const label = dockLabel(statuses);

  return (
    <>
      <Animated.View
        {...responder.panHandlers}
        accessibilityRole="button"
        accessibilityLabel={`${label}. Open dev tools`}
        style={[
          styles.button,
          { backgroundColor: active ? '#d93025' : '#3c4043' },
          { transform: position.getTranslateTransform() },
        ]}
      >
        <Text style={styles.buttonText} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
      <Modal visible={dock.open} animationType="slide" onRequestClose={devDock.close}>
        <SafeAreaView style={styles.panel}>
          <View style={styles.header}>
            <ScrollView horizontal contentContainerStyle={styles.tabs}>
              {tabs.map((tab, i) => {
                const selected = tab.id === current?.id;
                return (
                  <Pressable
                    key={tab.id}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    onPress={() => devDock.select(tab.id)}
                    style={[styles.tab, selected && styles.tabOn]}
                  >
                    <Text style={selected ? styles.tabTextOn : undefined}>
                      {tab.title}
                      {statuses[i] ? ' •' : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable accessibilityRole="button" onPress={devDock.close} hitSlop={12}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>
          <View style={styles.body}>{current?.render()}</View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
    elevation: 9999,
    maxWidth: 280,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  panel: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#dadce0',
  },
  tabs: { gap: 8 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    minHeight: 40,
    justifyContent: 'center',
  },
  tabOn: { backgroundColor: '#1a73e8' },
  tabTextOn: { color: '#fff', fontWeight: '600' },
  close: { color: '#1a73e8', fontWeight: '600' },
  body: { flex: 1 },
});
