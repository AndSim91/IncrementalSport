import { useMemo, useState } from "react";
import { TOURNAMENT_DEFINITIONS, getNextTournamentLevel } from "../../content/tournaments";
import type {
  TournamentMatch,
  TournamentParticipant,
  TournamentPodiumEntry,
  TournamentResult,
} from "../../game/types";
import {
  knockoutStageLabel,
  levelShortLabel,
  participantName,
} from "./tournamentPresentation";

const KNOCKOUT_STAGE_ORDER: TournamentMatch["stage"][] = [
  "round64",
  "round32",
  "round16",
  "quarterfinal",
  "semifinal",
  "final",
];

interface TournamentResultsProps {
  result: TournamentResult;
  results: readonly TournamentResult[];
  onSelectResult: (resultId: string) => void;
  onBackToOverview: () => void;
  onViewQualified: () => void;
}

function groupLetter(groupIndex: number): string {
  return String.fromCharCode(65 + groupIndex);
}

function qualificationDestination(level: ReturnType<typeof getNextTournamentLevel>): string {
  if (level === "academy") return "all'Accademico";
  if (level === "national") return "al Nazionale";
  if (level === "champions") return "alla Champion's Arena";
  return "complessivi";
}

function MatchCompetitor({
  participant,
  score,
  styleScore,
  winner,
}: {
  participant: TournamentParticipant | undefined;
  score: number;
  styleScore: number;
  winner: boolean;
}) {
  return (
    <span className={[winner ? "is-winner" : "", participant?.ownedContactId ? "is-owned" : ""].filter(Boolean).join(" ")}>
      <strong>{participantName(participant)}</strong>
      <b>{score}</b>
      <small>{styleScore.toFixed(3)}</small>
    </span>
  );
}

function BracketMatch({
  match,
  participantById,
  selected,
  onSelect,
}: {
  match: TournamentMatch;
  participantById: ReadonlyMap<string, TournamentParticipant>;
  selected: boolean;
  onSelect: () => void;
}) {
  const a = participantById.get(match.participantAId);
  const b = participantById.get(match.participantBId);
  return (
    <button
      type="button"
      className={selected ? "bracket-match selected" : "bracket-match"}
      onClick={onSelect}
      aria-label={`${participantName(a)} ${match.arenaScoreA} a ${match.arenaScoreB} ${participantName(b)}`}
    >
      <MatchCompetitor participant={a} score={match.arenaScoreA} styleScore={match.styleScoreA} winner={match.winnerId === a?.id} />
      <MatchCompetitor participant={b} score={match.arenaScoreB} styleScore={match.styleScoreB} winner={match.winnerId === b?.id} />
    </button>
  );
}

function PodiumList({
  title,
  entries,
  participantById,
}: {
  title: string;
  entries: readonly TournamentPodiumEntry[];
  participantById: ReadonlyMap<string, TournamentParticipant>;
}) {
  return (
    <div className="results-podium-list">
      <strong>{title}</strong>
      <div>
        {entries.map((entry) => (
          <span key={`${entry.discipline}-${entry.position}`} className={participantById.get(entry.participantId)?.ownedContactId ? "is-owned" : ""}>
            <b>{entry.position}</b>
            <em>{participantName(participantById.get(entry.participantId))}</em>
            <small>{entry.discipline === "style" ? entry.score.toFixed(3) : "Arena"}</small>
          </span>
        ))}
      </div>
    </div>
  );
}

export function TournamentResults({
  result,
  results,
  onSelectResult,
  onBackToOverview,
  onViewQualified,
}: TournamentResultsProps) {
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [selectedMatchId, setSelectedMatchId] = useState<string>();
  const [showMatchDetail, setShowMatchDetail] = useState(false);
  const participantById = useMemo(
    () => new Map(result.participants.map((participant) => [participant.id, participant])),
    [result.participants],
  );
  const groupIndices = useMemo(
    () => [...new Set(result.groupStandings.map((standing) => standing.groupIndex))].sort((a, b) => a - b),
    [result.groupStandings],
  );
  const activeGroupIndex = groupIndices.includes(selectedGroupIndex)
    ? selectedGroupIndex
    : groupIndices[0] ?? 0;
  const groupStandings = result.groupStandings.filter(
    (standing) => standing.groupIndex === activeGroupIndex,
  );
  const groupMatches = result.matches.filter(
    (match) => match.stage === "group" && match.groupIndex === activeGroupIndex,
  );
  const knockoutStages = KNOCKOUT_STAGE_ORDER.filter(
    (stage) => result.matches.some((match) => match.stage === stage),
  ).slice(-3);
  const defaultMatch = groupMatches.find((match) =>
    participantById.get(match.participantAId)?.ownedContactId ||
    participantById.get(match.participantBId)?.ownedContactId
  ) ?? groupMatches[0] ?? result.matches.find((match) => match.stage === "final");
  const selectedMatch = result.matches.find((match) => match.id === selectedMatchId) ?? defaultMatch;
  const finalMatch = result.matches.find((match) => match.stage === "final");
  const champion = finalMatch ? participantById.get(finalMatch.winnerId) : undefined;
  const nextLevel = getNextTournamentLevel(result.level);

  return (
    <div className="tournament-results-view">
      <section className="results-context">
        <button type="button" className="back-to-calendar" onClick={onBackToOverview}><span aria-hidden="true">‹</span> Calendario</button>
        <h2>{TOURNAMENT_DEFINITIONS[result.level].label}</h2>
        <span>Stagione {result.season}</span><i aria-hidden="true" />
        <span>{result.participants.length} partecipanti</span><i aria-hidden="true" />
        <strong>Completato</strong>
        <label><span>Cambia torneo</span><select aria-label="Cambia torneo" value={result.id} onChange={(event) => onSelectResult(event.target.value)}>{[...results].reverse().map((entry) => <option key={entry.id} value={entry.id}>{levelShortLabel[entry.level]} · Stagione {entry.season}</option>)}</select></label>
        <b aria-hidden="true" />
      </section>

      <div className="results-workspace">
        <section className="group-stage" aria-labelledby="group-stage-title">
          <h2 id="group-stage-title">Gironi</h2>
          <div className="group-selector" role="tablist" aria-label="Seleziona girone">
            {groupIndices.map((groupIndex) => (
              <button key={groupIndex} type="button" role="tab" aria-selected={activeGroupIndex === groupIndex} className={activeGroupIndex === groupIndex ? "active" : ""} onClick={() => { setSelectedGroupIndex(groupIndex); setSelectedMatchId(undefined); }}>{groupLetter(groupIndex)}</button>
            ))}
          </div>
          <h3>Gruppo {groupLetter(activeGroupIndex)}</h3>
          <div className="group-table-wrap">
            <table className="group-table">
              <thead><tr><th>#</th><th>Atleta</th><th>V</th><th>Punti</th><th>Stile</th><th>Esito</th></tr></thead>
              <tbody>
                {groupStandings.map((standing, index) => {
                  const participant = participantById.get(standing.participantId);
                  return (
                    <tr key={standing.participantId} className={[standing.qualified ? "is-advanced" : "", participant?.ownedContactId ? "is-owned" : ""].filter(Boolean).join(" ")}>
                      <td>{index + 1}</td>
                      <th scope="row" className={participant?.rarity === "secret-legendary" ? "secret-legendary" : ""}>{participantName(participant)}</th>
                      <td>{standing.wins}</td>
                      <td>{standing.assaultPoints}</td>
                      <td>{standing.styleAverage.toFixed(3)}</td>
                      <td>{standing.qualified ? "Avanza" : "Eliminato"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {selectedMatch ? (
            <div className="selected-match-detail" aria-live="polite">
              <span><strong>{participantName(participantById.get(selectedMatch.participantAId))}</strong><small>Stile {selectedMatch.styleScoreA.toFixed(3)}</small></span>
              <b>{selectedMatch.arenaScoreA}<i>–</i>{selectedMatch.arenaScoreB}</b>
              <span><strong>{participantName(participantById.get(selectedMatch.participantBId))}</strong><small>Stile {selectedMatch.styleScoreB.toFixed(3)}</small></span>
              <button type="button" aria-expanded={showMatchDetail} onClick={() => setShowMatchDetail((visible) => !visible)}>{showMatchDetail ? "Nascondi dettaglio" : "Dettaglio incontro"}</button>
              {showMatchDetail ? (
                <div className="selected-match-expanded">
                  <span>{participantById.get(selectedMatch.participantAId)?.schoolName}</span>
                  <strong>{selectedMatch.stage === "group" ? `Girone ${groupLetter(selectedMatch.groupIndex ?? 0)}` : knockoutStageLabel[selectedMatch.stage]}</strong>
                  <span>{participantById.get(selectedMatch.participantBId)?.schoolName}</span>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="knockout-stage" aria-labelledby="knockout-stage-title">
          <h2 id="knockout-stage-title">Eliminazione diretta</h2>
          {knockoutStages.length > 0 ? (
            <div className={`tournament-bracket rounds-${knockoutStages.length}`}>
              {knockoutStages.map((stage) => {
                const matches = result.matches.filter((match) => match.stage === stage);
                return (
                  <div key={stage} className={`bracket-round stage-${stage}`}>
                    <h3>{knockoutStageLabel[stage]}</h3>
                    <div>
                      {matches.map((match) => <BracketMatch key={match.id} match={match} participantById={participantById} selected={selectedMatch?.id === match.id} onSelect={() => { setSelectedMatchId(match.id); setShowMatchDetail(false); }} />)}
                    </div>
                  </div>
                );
              })}
              {champion ? <p className="arena-champion"><strong>{participantName(champion)}</strong><span>Campione Arena</span></p> : null}
            </div>
          ) : <p className="empty-tournaments">Nessuna fase a eliminazione diretta disponibile.</p>}
        </section>
      </div>

      <section className="podium-qualification-rail" aria-labelledby="podium-qualification-title">
        <h2 id="podium-qualification-title">Podio e qualificazioni</h2>
        <div>
          <PodiumList title="Arena" entries={result.arenaPodium} participantById={participantById} />
          <PodiumList title="Stile" entries={result.stylePodium} participantById={participantById} />
          <div className="result-qualifiers">
            <strong>{result.qualifiers.length} qualificati {qualificationDestination(nextLevel)}</strong>
            <button type="button" onClick={onViewQualified}>Vedi qualificati</button>
          </div>
        </div>
      </section>
    </div>
  );
}
