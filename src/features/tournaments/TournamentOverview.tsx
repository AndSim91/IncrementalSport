import { useMemo } from "react";
import { Icon } from "../../components/common/Icon";
import { TOURNAMENT_DEFINITIONS, TOURNAMENT_LEVEL_ORDER } from "../../content/tournaments";
import {
  getContactPreparation,
  hasCompletedCourseX,
} from "../../game/athleteStats";
import { GAME_CONFIG } from "../../game/config";
import type { GameState, TournamentResult } from "../../game/types";
import {
  findUpcomingTournament,
  formatTournamentCountdown,
  getLatestResultForLevel,
  getUpcomingDelegationContactIds,
  monthShortLabel,
} from "./tournamentPresentation";

interface TournamentOverviewProps {
  state: GameState;
  onOpenResult: (result: TournamentResult) => void;
}

export function TournamentOverview({ state, onOpenResult }: TournamentOverviewProps) {
  const upcoming = findUpcomingTournament(state);
  const upcomingDefinition = upcoming ? TOURNAMENT_DEFINITIONS[upcoming.level] : undefined;
  const qualification = state.tournaments.qualification;
  const delegationContactIds = getUpcomingDelegationContactIds(state, upcoming);
  const qualifiedIds = useMemo(
    () => new Set(delegationContactIds),
    [delegationContactIds],
  );
  const collaboratorsByContactId = useMemo(
    () => new Map(state.collaborators.map((entry) => [entry.contactId, entry])),
    [state.collaborators],
  );
  const delegation = useMemo(() => {
    const contactsById = new Map(state.contacts.map((contact) => [contact.id, contact]));
    const source = delegationContactIds
      .map((contactId) => contactsById.get(contactId))
      .filter((contact) => contact !== undefined);
    return source.map((contact) => {
      const forms = collaboratorsByContactId.get(contact.id)?.forms ?? contact.forms;
      const preparation = getContactPreparation(contact, forms);
      const visible = hasCompletedCourseX(forms);
      const standard = upcomingDefinition?.standard ?? 0;
      const readiness = standard > 0
        ? Math.min(100, Math.round(((preparation.arena + preparation.style) / 2 / standard) * 100))
        : 100;
      return { contact, preparation, readiness, visible };
    });
  }, [collaboratorsByContactId, delegationContactIds, state.contacts, upcomingDefinition]);
  const required = GAME_CONFIG.tournamentMinimumMembers;
  const isReady = delegation.length >= required;

  return (
    <div className="tournament-overview">
      <section className="next-tournament" aria-labelledby="next-tournament-title">
        <div className="next-tournament-name">
          <span className="next-tournament-icon"><Icon name="trophy" /></span>
          <span>
            <small>Prossimo evento</small>
            <strong id="next-tournament-title">{upcomingDefinition?.label ?? "Stagione completata"}</strong>
          </span>
        </div>
        <div className="next-tournament-countdown">
          <small>Inizia tra</small>
          <strong>{upcoming ? formatTournamentCountdown(upcoming.occursAt - state.automation.lastProcessedAt) : "—"}</strong>
          <span>{upcomingDefinition
            ? `${upcomingDefinition.calendarMonth.toString().padStart(2, "0")} ${monthShortLabel[upcomingDefinition.calendarMonth]} · STAGIONE ${upcoming?.season}`
            : "Nessun evento in programma"}</span>
        </div>
        <div className={isReady ? "next-tournament-ready is-ready" : "next-tournament-ready"}>
          <span aria-hidden="true">{isReady ? "✓" : "!"}</span>
          <strong>{isReady ? "Delegazione pronta" : "Delegazione incompleta"}</strong>
          <b>{delegation.length}/{required}</b>
          <small>qualificati</small>
        </div>
      </section>

      <div className="tournament-overview-grid">
        <section className="season-schedule" aria-labelledby="season-schedule-title">
          <h2 id="season-schedule-title">Calendario della stagione</h2>
          <div className="season-schedule-head" aria-hidden="true">
            <span>Mese</span><span>Torneo</span><span>Stato</span><span>Standard</span><span>Progresso stagione</span>
          </div>
          {TOURNAMENT_LEVEL_ORDER.map((level, levelIndex) => {
            const definition = TOURNAMENT_DEFINITIONS[level];
            const completed = getLatestResultForLevel(state.tournaments.results, level);
            const missed = [...state.tournaments.missedTournaments]
              .reverse()
              .find((entry) => entry.level === level);
            const isNext = upcoming?.level === level;
            const isQualified = qualification?.level === level;
            const status = completed
              ? `Completato · stagione ${completed.season}`
              : missed
                ? "Non disputato"
                : isNext
                  ? "Prossimo"
                  : isQualified
                    ? `${qualification.contactIds.length} qualificati`
                    : "In attesa";
            const rowClass = [
              "season-schedule-row",
              completed ? "is-completed" : "",
              isNext ? "is-next" : "",
              completed ? "is-clickable" : "",
            ].filter(Boolean).join(" ");
            return (
              <button
                key={level}
                type="button"
                className={rowClass}
                disabled={!completed}
                onClick={() => completed && onOpenResult(completed)}
                aria-label={completed ? `Apri i risultati di ${definition.label}, stagione ${completed.season}` : undefined}
              >
                <time><strong>{definition.calendarMonth.toString().padStart(2, "0")}</strong><small>{monthShortLabel[definition.calendarMonth]}</small></time>
                <span className="schedule-name"><strong>{definition.label}</strong></span>
                <span className="schedule-status"><i aria-hidden="true" />{status}</span>
                <span className="schedule-standard">{definition.standard ? `Standard ${definition.standard}` : "Standard interno"}</span>
                <span className="schedule-progress" aria-label={`Tappa ${levelIndex + 1} di ${TOURNAMENT_LEVEL_ORDER.length}`}>
                  {TOURNAMENT_LEVEL_ORDER.map((entry, index) => <i key={entry} className={index <= levelIndex && (completed || isNext) ? "active" : ""} />)}
                </span>
              </button>
            );
          })}
        </section>

        <section className="qualified-team" aria-labelledby="qualified-team-title">
          <header><h2 id="qualified-team-title">Qualificati</h2><span>{delegation.length} atleti</span></header>
          <div className="qualified-team-head" aria-hidden="true"><span>#</span><span>Atleta</span><span>Arena</span><span>Stile</span></div>
          <div className="qualified-team-list">
            {delegation.map(({ contact, preparation, visible }, index) => (
              <div key={contact.id}>
                <b>{index + 1}</b>
                <span><strong>{contact.firstName} {contact.lastName}</strong><small>{qualifiedIds.has(contact.id) ? "Delegazione" : "Idoneo"}</small></span>
                <strong>{visible ? preparation.arena.toFixed(3) : "???"}</strong>
                <strong>{visible ? preparation.style.toFixed(3) : "???"}</strong>
              </div>
            ))}
            {delegation.length === 0 ? <p>Nessun atleta idoneo.</p> : null}
          </div>
          {delegation.length > 0 ? (
            <footer>
              <strong>Media squadra</strong>
              <span>{delegation.some((entry) => !entry.visible) ? "???" : (delegation.reduce((sum, entry) => sum + entry.preparation.arena, 0) / delegation.length).toFixed(3)}</span>
              <span>{delegation.some((entry) => !entry.visible) ? "???" : (delegation.reduce((sum, entry) => sum + entry.preparation.style, 0) / delegation.length).toFixed(3)}</span>
            </footer>
          ) : null}
        </section>
      </div>

      <section className="delegation-form" aria-labelledby="delegation-form-title">
        <h2 id="delegation-form-title">Forma della delegazione</h2>
        <div>
          {delegation.map(({ contact, readiness }) => (
            <span key={contact.id}>
              <small>{contact.firstName} {contact.lastName}</small>
              <i><b style={{ width: `${readiness}%` }} /></i>
              <strong>{readiness}%</strong>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
