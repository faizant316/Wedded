/**
 * The app's own link scheme, from `scheme` in app.json: weddingapp://v/{slug}
 * opens a profile in the installed app. Keep the two in step.
 */
export const APP_SCHEME = 'weddingapp';

/** A path in the installed app, for "Open in the app" on the web. */
export function appLink(path: string): string {
  return `${APP_SCHEME}://${path.replace(/^\//, '')}`;
}
