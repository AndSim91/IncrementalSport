import { MAIL_SENDER_ADDRESS } from "../../content/emailAddresses";
import { selectSentEmailStatus } from "../../game/selectors";
import type { CampaignEmail, GameState } from "../../game/types";
import { Icon } from "../common/Icon";
import { EMAIL_PRESENTATION_LEVELS } from "../../content/emailPresentation";
import { CampaignEmailContent } from "./CampaignEmailContent";

export function SentMailDetail({ state, email }: { state: GameState; email: CampaignEmail }) {
  const contact = state.contacts.find((candidate) => candidate.id === email.contactId);
  const status = selectSentEmailStatus(state, email);
  return (
    <main className="sent-mail-detail">
      <div className="detail-toolbar"><button type="button" disabled><Icon name="trash" /> Elimina</button></div>
      <div className="sent-heading"><div><span>Stato della campagna · {EMAIL_PRESENTATION_LEVELS[email.presentationLevel].label}</span><strong className={`campaign-status ${status.toLocaleLowerCase("it-IT").replaceAll(" ", "-")}`}>{status}</strong></div><time>{email.sentAt ? new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(email.sentAt) : ""}</time></div>
      <div className="sent-fields"><div><span>Da:</span><strong>{MAIL_SENDER_ADDRESS}</strong></div><div><span>A:</span><strong className={contact ? `rarity-address rarity-${contact.rarity}` : undefined}>{contact?.firstName} {contact?.lastName} &lt;{contact?.email}&gt;</strong></div><div><span>Oggetto:</span><strong>{email.subject}</strong></div></div>
      <article><CampaignEmailContent email={email} /></article>
    </main>
  );
}
