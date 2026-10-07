/** Browsers have no Photos to save to (expo-media-library is phone-only). */
export async function saveToPhotos(): Promise<boolean> {
  return false;
}
