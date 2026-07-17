import { EMAIL_TEMPLATES, resolveEmailTemplateCopy } from "../content/emailTemplates";
import type { CampaignEmail, InboxMessage, Contact } from "./types";
import { makeGameId } from "./ids";

export function createCampaign(
  contact: Contact,
  campaignIndex: number,
  now: number,
  senderName: string,
  presentationLevel: CampaignEmail["presentationLevel"] = 0,
  orderName = "Ordine delle Onde",
  city = "Genova",
): CampaignEmail {
  const template = EMAIL_TEMPLATES[campaignIndex % EMAIL_TEMPLATES.length];
  const copy = resolveEmailTemplateCopy(
    template,
    contact.firstName,
    senderName,
    presentationLevel,
    orderName,
    city,
  );
  return {
    id: makeGameId("email", now, campaignIndex),
    contactId: contact.id,
    templateId: template.id,
    subject: copy.subject,
    body: copy.body,
    revealedCharacters: 0,
    createdAt: now,
    presentationLevel,
    status: "writing",
  };
}

export function createWelcomeMessage(now: number): InboxMessage {
  return {
    id: makeGameId("message", now, "welcome"),
    sender: "Sistema Oggetto: Nuovi Iscritti",
    subject: "Benvenuto! Inizia da qui",
    preview: "Completa il messaggio aperto: ogni tasto inserisce il prossimo carattere.",
    receivedAt: now,
    tone: "system",
    unread: true,
  };
}
