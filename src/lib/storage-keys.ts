export const StorageKeys = {
  locale: 'settings.locale',
  /** Where to search from and how far, as JSON (src/features/location). */
  searchLocation: 'settings.searchLocation',
  /** Settings > Appearance: system, light or dark. */
  appearance: 'settings.appearance',
  /** Settings > Text size: default, large or xlarge. */
  textSize: 'settings.textSize',
  /** Settings > Haptics: "off" turns them off. */
  haptics: 'settings.haptics',
  /** My Wedding planner, as JSON (src/features/planner). */
  weddingPlan: 'planner.wedding',
} as const;
