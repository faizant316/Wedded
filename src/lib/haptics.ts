import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptics only where the vision puts them (§4 Motion): chip select, Save on,
// inquiry sent, account created. Nothing on the web, and nothing when turned
// off in Settings (SettingsProvider keeps this in step).
let enabled = Platform.OS !== 'web';

export function setHapticsEnabled(on: boolean) {
  enabled = Platform.OS !== 'web' && on;
}

/** A light tick, for picking a chip or a row. */
export function selectionHaptic() {
  if (enabled) void Haptics.selectionAsync().catch(() => {});
}

/** A soft tap, for Save turning on. */
export function saveHaptic() {
  if (enabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** The success pattern, for an inquiry sent or an account created. */
export function successHaptic() {
  if (enabled) {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }
}
