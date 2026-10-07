import * as ImagePicker from 'expo-image-picker';

export type MediaSource = 'library' | 'camera';

/** granted; denied (asking again shows the question); blocked (only Settings can change it). */
export type MediaAccess = 'granted' | 'denied' | 'blocked';

/**
 * Asks for the camera roll or the camera at the moment it's needed, after the
 * screen has said why. iPhones show the question once; after a no, the screen
 * offers Settings instead. Limited photo access counts as yes, since the
 * picker shows the clips they allowed.
 */
export async function askMediaAccess(source: MediaSource): Promise<MediaAccess> {
  try {
    const current =
      source === 'library'
        ? await ImagePicker.getMediaLibraryPermissionsAsync()
        : await ImagePicker.getCameraPermissionsAsync();
    if (current.granted) return 'granted';
    if (!current.canAskAgain) return 'blocked';
    const asked =
      source === 'library'
        ? await ImagePicker.requestMediaLibraryPermissionsAsync()
        : await ImagePicker.requestCameraPermissionsAsync();
    if (asked.granted) return 'granted';
    return asked.canAskAgain ? 'denied' : 'blocked';
  } catch {
    // No camera (a simulator) or no permission system (some browsers)
    return 'denied';
  }
}
