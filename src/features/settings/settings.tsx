import * as SystemUI from 'expo-system-ui';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import {
  PALETTE_IDS,
  PaletteContext,
  SchemeContext,
  TextScaleContext,
  Themes,
  type PaletteId,
  type Scheme,
} from '@/constants/theme';
import { setHapticsEnabled } from '@/lib/haptics';
import { readSetting, StorageKeys, writeSetting } from '@/lib/storage';

export type Appearance = 'system' | 'light' | 'dark';
export type TextSize = 'default' | 'large' | 'xlarge';

export const APPEARANCES: Appearance[] = ['system', 'light', 'dark'];
export const TEXT_SIZES: TextSize[] = ['default', 'large', 'xlarge'];

/** How much bigger each in-app text size draws, on top of the phone's own setting. */
export const TEXT_SCALES: Record<TextSize, number> = { default: 1, large: 1.12, xlarge: 1.25 };

type SettingsValue = {
  /** What the person picked in Settings > Appearance. */
  appearance: Appearance;
  setAppearance: (appearance: Appearance) => void;
  /** The scheme actually in use: the pick, or the phone's own for "system". */
  scheme: Scheme;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  haptics: boolean;
  setHaptics: (on: boolean) => void;
  /** Settings > Appearance > Colour. */
  palette: PaletteId;
  setPalette: (palette: PaletteId) => void;
};

const SettingsContext = createContext<SettingsValue | null>(null);

function oneOf<T extends string>(value: string | null, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

/**
 * The app's own settings, saved on this phone (vision S16: Profile and
 * settings): appearance (automatic, light or dark), the colour palette, text
 * size and haptics. Provides the palette, colour scheme and text scale to
 * every screen.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [appearance, setAppearanceState] = useState<Appearance>(() =>
    oneOf(readSetting(StorageKeys.appearance), APPEARANCES, 'system'),
  );
  const [textSize, setTextSizeState] = useState<TextSize>(() =>
    oneOf(readSetting(StorageKeys.textSize), TEXT_SIZES, 'default'),
  );
  const [haptics, setHapticsState] = useState(() => readSetting(StorageKeys.haptics) !== 'off');
  const [palette, setPaletteState] = useState<PaletteId>(() =>
    oneOf(readSetting(StorageKeys.palette), PALETTE_IDS, 'classic'),
  );

  const scheme: Scheme =
    appearance === 'system' ? (system === 'dark' ? 'dark' : 'light') : appearance;

  useEffect(() => {
    setHapticsEnabled(haptics);
  }, [haptics]);

  // The window behind the app (seen during rotations and sheet animations).
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(Themes[palette][scheme].bg).catch(() => {});
  }, [palette, scheme]);

  const setAppearance = useCallback((next: Appearance) => {
    setAppearanceState(next);
    void writeSetting(StorageKeys.appearance, next);
  }, []);
  const setTextSize = useCallback((next: TextSize) => {
    setTextSizeState(next);
    void writeSetting(StorageKeys.textSize, next);
  }, []);
  const setHaptics = useCallback((on: boolean) => {
    setHapticsState(on);
    void writeSetting(StorageKeys.haptics, on ? 'on' : 'off');
  }, []);
  const setPalette = useCallback((next: PaletteId) => {
    setPaletteState(next);
    void writeSetting(StorageKeys.palette, next);
  }, []);

  const value = useMemo<SettingsValue>(
    () => ({
      appearance,
      setAppearance,
      scheme,
      textSize,
      setTextSize,
      haptics,
      setHaptics,
      palette,
      setPalette,
    }),
    [
      appearance,
      setAppearance,
      scheme,
      textSize,
      setTextSize,
      haptics,
      setHaptics,
      palette,
      setPalette,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      <PaletteContext.Provider value={palette}>
        <SchemeContext.Provider value={scheme}>
          <TextScaleContext.Provider value={TEXT_SCALES[textSize]}>
            {children}
          </TextScaleContext.Provider>
        </SchemeContext.Provider>
      </PaletteContext.Provider>
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used inside SettingsProvider');
  }
  return context;
}
