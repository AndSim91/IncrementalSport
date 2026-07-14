import { selectAvailableContacts, selectUnreadMessages } from "../../game/selectors";
import type { GameState } from "../../game/types";
import { Icon } from "../common/Icon";

const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

export type MailFolder = "inbox" | "sent";

export function FolderPane({
  state,
  folder,
  onSelectFolder,
}: {
  state: GameState;
  folder: MailFolder;
  onSelectFolder: (folder: MailFolder) => void;
}) {
  const sent = state.statistics.emailsSent;
  return (
    <aside className="folder-pane">
      <div className="pane-heading"><strong>Cartelle</strong><Icon name="plus" /><Icon name="search" /></div>
      <button type="button" className={folder === "inbox" ? "folder active" : "folder"} onClick={() => onSelectFolder("inbox")}><Icon name="mail" /><span>Posta in arrivo</span><b>{selectUnreadMessages(state)}</b></button>
      <button type="button" className={folder === "sent" ? "folder active" : "folder"} onClick={() => onSelectFolder("sent")}><Icon name="send" /><span>Posta inviata</span><b>{sent || ""}</b></button>
      <div className="folder-rule" />
      <div className="resource-row"><Icon name="contact" /><span>Contatti</span><b>{selectAvailableContacts(state)}</b></div>
      <div className="resource-row"><Icon name="people" /><span>Iscritti</span><b>{state.school.activeMembers}</b></div>
      <div className="resource-row"><Icon name="coin" /><span>Disponibilità</span><b>{euro.format(state.school.euros)}</b></div>
      <div className="folder-note">{state.school.name}</div>
    </aside>
  );
}
