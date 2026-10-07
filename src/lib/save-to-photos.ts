import * as MediaLibrary from 'expo-media-library';

/**
 * Keeps a clip recorded in the app in the phone's Photos, as the Camera app
 * would, so it isn't lost if posting fails. Asks only to add to Photos, never
 * to look through them. False when that isn't allowed or the save fails.
 */
export async function saveToPhotos(uri: string): Promise<boolean> {
  try {
    const { granted } = await MediaLibrary.requestPermissionsAsync(true, []);
    if (!granted) return false;
    await MediaLibrary.Asset.create(uri);
    return true;
  } catch {
    return false;
  }
}
