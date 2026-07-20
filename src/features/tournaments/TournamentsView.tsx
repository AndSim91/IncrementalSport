import { memo, useMemo, useState } from "react";
import { TabButton } from "../../components/common/TabButton";
import { TOURNAMENT_DEFINITIONS } from "../../content/tournaments";
import type { GameState, TournamentParticipant, TournamentResult } from "../../game/types";
import { TournamentAthletes } from "./TournamentAthletes";
import { TournamentOverview } from "./TournamentOverview";
import { TournamentResults } from "./TournamentResults";
import { useVirtualRows } from "../../shared/useVirtualRows";
import {
  levelShortLabel,
  participantName,
  type TournamentTab,
} from "./tournamentPresentation";

const TOURNAMENT_HALL_ROW_HEIGHT = 64;

type TournamentHallWinner = {
  kind: "winner";
  id: string;
  participant: TournamentParticipant;
  position: 1 | 2 | 3;
  detail: string;
};

type TournamentHallRow = TournamentHallWinner | {
  kind: "tournament";
  id: string;
  label: string;
  level: string;
  season: number;
  winnerCount: number;
};

function getTournamentHallRows(
  results: GameState["tournaments"]["results"],
): TournamentHallRow[] {
  return [...results].reverse().flatMap((result) => {
    const participantById = new Map(result.participants.map((participant) => [participant.id, participant]));
    const winners = [...result.arenaPodium, ...result.stylePodium]
      .map((entry): TournamentHallWinner | undefined => {
        const participant = participantById.get(entry.participantId);
        if (!participant?.ownedContactId) return undefined;
        return {
          kind: "winner",
          id: `${result.id}-${entry.discipline}-${entry.position}`,
          participant,
          position: entry.position,
          detail: entry.discipline === "arena" ? "Arena" : `Stile ${entry.score.toFixed(3)}`,
        };
      })
      .filter((entry): entry is TournamentHallWinner => Boolean(entry));

    if (winners.length === 0) return [];

    return [
      {
        kind: "tournament" as const,
        id: `${result.id}-header`,
        label: TOURNAMENT_DEFINITIONS[result.level].label,
        level: levelShortLabel[result.level],
        season: result.season,
        winnerCount: winners.length,
      },
      ...winners,
    ];
  });
}

const TournamentsHall = memo(function TournamentsHall({
  results,
  schoolName,
}: {
  results: GameState["tournaments"]["results"];
  schoolName: string;
}) {
  const entries = useMemo(() => getTournamentHallRows(results), [results]);
  const winnerCount = entries.filter((entry) => entry.kind === "winner").length;
  const virtualRows = useVirtualRows({
    count: entries.length,
    rowHeight: TOURNAMENT_HALL_ROW_HEIGHT,
  });
  const renderedEntries = entries.slice(virtualRows.startIndex, virtualRows.endIndex);
  return (
    <section className="tournament-hall" aria-label="Albo d'oro">
      <header>
        <div>
          <h2>Albo d'oro</h2>
          <small>Solo vincitori di {schoolName}</small>
        </div>
        <span>{winnerCount} piazzamenti</span>
      </header>
      <div
        className="virtualized-tournament-hall"
        onScroll={virtualRows.onScroll}
      >
        {virtualRows.paddingTop > 0 ? (
          <div className="virtual-list-spacer" style={{ height: virtualRows.paddingTop }} aria-hidden="true" />
        ) : null}
        {renderedEntries.map((entry) => (
          entry.kind === "tournament" ? (
            <div key={entry.id} className="tournament-hall-group">
              <div>
                <h3>{entry.label}</h3>
                <span>Livello {entry.level} · Stagione {entry.season}</span>
              </div>
              <strong>{entry.winnerCount} piazzamenti</strong>
            </div>
          ) : (
            <article key={entry.id} className="is-owned">
              <b>{entry.position}°</b>
              <span className={entry.participant.rarity === "secret-legendary" ? "secret-legendary" : ""}><strong>{participantName(entry.participant)}</strong><small>{entry.detail}</small></span>
              <em>{entry.participant.schoolName}</em>
            </article>
          )
        ))}
        {virtualRows.paddingBottom > 0 ? (
          <div className="virtual-list-spacer" style={{ height: virtualRows.paddingBottom }} aria-hidden="true" />
        ) : null}
        {entries.length === 0 ? <p className="empty-tournaments">L'Albo d'Oro è ancora vuoto.</p> : null}
      </div>
    </section>
  );
});

export function TournamentsView({ state }: { state: GameState }) {
  const [tab, setTab] = useState<TournamentTab>("overview");
  const [selectedResultId, setSelectedResultId] = useState<string>();
  const [athleteQualificationFilter, setAthleteQualificationFilter] = useState<"all" | "qualified">("all");
  const latestResult = state.tournaments.results.at(-1);
  const selectedResult = state.tournaments.results.find((result) => result.id === selectedResultId) ?? latestResult;
  const openResult = (result: TournamentResult) => {
    setSelectedResultId(result.id);
    setTab("results");
  };
  const openAthletes = (qualifiedOnly: boolean) => {
    setAthleteQualificationFilter(qualifiedOnly ? "qualified" : "all");
    setTab("athletes");
  };

  return (
    <main className="overview-view tournaments-view">
      <header><div><h1>Tornei</h1><p>Segui la stagione, prepara la squadra, conquista la Champion’s Arena</p></div></header>
      <div className="people-tabs tournament-tabs" role="tablist" aria-label="Sezioni tornei">
        <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>Panoramica</TabButton>
        <TabButton active={tab === "athletes"} onClick={() => openAthletes(false)}>Atleti</TabButton>
        <TabButton active={tab === "results"} onClick={() => setTab("results")}>Risultati</TabButton>
        <TabButton active={tab === "hall"} onClick={() => setTab("hall")}>Albo d'oro</TabButton>
      </div>

      {tab === "overview" ? <TournamentOverview state={state} onOpenResult={openResult} /> : null}
      {tab === "athletes" ? <TournamentAthletes state={state} initialQualificationFilter={athleteQualificationFilter} /> : null}
      {tab === "results" ? (
        selectedResult ? (
          <TournamentResults
            result={selectedResult}
            results={state.tournaments.results}
            onSelectResult={setSelectedResultId}
            onBackToOverview={() => setTab("overview")}
            onViewQualified={() => openAthletes(true)}
          />
        ) : <p className="empty-tournaments tournament-empty-page">Nessun torneo disputato.</p>
      ) : null}
      {tab === "hall" ? <TournamentsHall results={state.tournaments.results} schoolName={state.school.name} /> : null}
    </main>
  );
}
