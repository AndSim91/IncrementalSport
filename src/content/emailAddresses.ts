export const MAIL_SENDER_ADDRESS = "genova@ludosport.net";

export const PROSPECT_EMAIL_PROVIDERS = [
  "cmail.com",
  "hotlook.it",
  "yabadabadoo.it",
  "gspot.com",
] as const;

export function createProspectEmail(localPart: string, sequence: number): string {
  const provider = PROSPECT_EMAIL_PROVIDERS[sequence % PROSPECT_EMAIL_PROVIDERS.length];
  return `${localPart}@${provider}`;
}
