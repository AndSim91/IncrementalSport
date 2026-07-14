import type { AppView } from "../components/outlook-shell/AppRail";
import { Icon } from "../components/common/Icon";
import type { GameState } from "../game/types";

type OverviewViewName = Exclude<AppView, "mail" | "upgrades" | "events">;

const titles: Record<OverviewViewName, [string, string]> = {
  calendar: ["Calendario", "Lezioni di prova e appuntamenti della scuola"],
  contacts: ["Persone", "Contatti della campagna corrente"],
  statistics: ["Attività", "Riepilogo operativo dell'Ordine delle Onde"],
  settings: ["Impostazioni", "Dati locali e preferenze dell'applicazione"],
};

export function OverviewView({ view, state }: { view: OverviewViewName; state: GameState }) {
  const [title, subtitle] = titles[view];
  return (
    <main className="overview-view">
      <header><Icon name={view === "calendar" ? "calendar" : view === "contacts" ? "people" : view === "statistics" ? "tasks" : "settings"} /><div><h1>{title}</h1><p>{subtitle}</p></div></header>
      {view === "contacts" ? (
        <div className="data-table"><div className="table-row table-head"><span>Nome</span><span>Indirizzo</span><span>Stato</span></div>{state.contacts.map((contact) => <div className="table-row" key={contact.id}><strong>{contact.firstName} {contact.lastName}</strong><span>{contact.email}</span><span className={`status ${contact.status}`}>{contact.status}</span></div>)}</div>
      ) : null}
      {view === "statistics" ? (
        <div className="statistics-grid"><Stat label="Input registrati" value={state.statistics.inputs}/><Stat label="Email inviate" value={state.statistics.emailsSent}/><Stat label="Prove prenotate" value={state.statistics.trialsBooked}/><Stat label="Prove completate" value={state.statistics.trialsCompleted}/><Stat label="Nuovi iscritti" value={state.statistics.membersEnrolled}/><Stat label="Contatti acquisiti" value={state.statistics.contactsAcquired}/><Stat label="Eventi completati" value={state.statistics.eventsCompleted}/><Stat label="Euro incassati" value={`€ ${state.statistics.eurosEarned}`}/></div>
      ) : null}
      {view === "calendar" ? (
        <div className="calendar-sheet"><div className="calendar-title">Oggi</div>{state.scheduledTrials.length ? state.scheduledTrials.map((trial) => <div className="calendar-event" key={trial.id}><time>{new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit" }).format(trial.startsAt)}</time><div><strong>Lezione di prova</strong><span>{trial.status === "completed" ? "Completata" : "Pianificata"}</span></div></div>) : <p>Nessun appuntamento. Le prenotazioni generate dalle email appariranno qui.</p>}</div>
      ) : null}
      {view === "settings" ? (
        <div className="settings-sheet"><h2>Salvataggio locale</h2><p>I progressi sono salvati automaticamente in questo browser ogni 10 secondi. Nessun messaggio viene inviato e nessun dato viene trasmesso a servizi esterni.</p><dl><div><dt>Versione salvataggio</dt><dd>{state.version}</dd></div><div><dt>Ultimo salvataggio</dt><dd>{new Intl.DateTimeFormat("it-IT", { timeStyle: "medium" }).format(state.lastSavedAt)}</dd></div></dl></div>
      ) : null}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="stat-row"><span>{label}</span><strong>{value}</strong></div>;
}
