/**
 * A stored E.164 number for display: "+15305550101" becomes "(530) 555-0101".
 * Numbers outside the US and Canada (India, the UK) stay in their + form.
 */
export function formatPhone(e164: string): string {
  const us = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return us ? `(${us[1]}) ${us[2]}-${us[3]}` : e164;
}
