import type { CampaignEmail } from "../game/types";
import { buildEmailHtmlSource } from "./finalEmail";

export const EMAIL_STRUCTURE_INPUTS = 12;

export function getEmailBuildSource(email: CampaignEmail): string {
  if (email.presentationLevel <= 2) return email.body;
  return buildEmailHtmlSource({
    subject: email.subject,
    body: email.body,
    presentationLevel: email.presentationLevel,
  });
}

export function getEmailBuildLength(email: CampaignEmail): number {
  return getEmailBuildSource(email).length;
}

function getStructureInputBudget(sourceLength: number): number {
  return Math.min(EMAIL_STRUCTURE_INPUTS, Math.max(1, sourceLength));
}

export function getEmailStructureProgress(email: CampaignEmail): number {
  const sourceLength = getEmailBuildLength(email);
  if (sourceLength === 0) return 0;
  const budget = getStructureInputBudget(sourceLength);
  return Math.min(
    100,
    Math.round((Math.min(email.revealedCharacters, budget) / budget) * 100),
  );
}

export function getEmailTextRevealCount(email: CampaignEmail): number {
  if (email.body.length === 0) return 0;
  const sourceLength = getEmailBuildLength(email);
  const budget = getStructureInputBudget(sourceLength);
  if (email.revealedCharacters <= budget) return 0;

  const textInputBudget = sourceLength - budget;
  if (textInputBudget <= 0) return email.body.length;

  return Math.min(
    email.body.length,
    Math.round(
      ((email.revealedCharacters - budget) / textInputBudget) * email.body.length,
    ),
  );
}
