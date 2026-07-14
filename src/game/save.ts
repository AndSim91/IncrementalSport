import { GAME_CONFIG } from "./config";
import { createInitialState } from "./engine";
import type { GameState } from "./types";

const SAVE_KEY = "oggetto-nuovi-iscritti.save";
const BACKUP_KEY = `${SAVE_KEY}.backup`;
const HIDDEN_MESSAGE_SUBJECTS = new Set(["Nuova lezione di prova prenotata"]);

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<GameState>;
  return (
    state.version === GAME_CONFIG.version &&
    Array.isArray(state.contacts) &&
    Array.isArray(state.emails) &&
    Array.isArray(state.acquisitionEvents) &&
    typeof state.activities?.nextSparringAt === "number" &&
    typeof state.randomSeed === "number" &&
    typeof state.school?.euros === "number"
  );
}

function migrate(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const legacy = value as Partial<GameState> & {
    version?: number;
    statistics?: Partial<GameState["statistics"]>;
  };
  if (legacy.version !== 1 || !legacy.statistics) return value;
  return {
    ...legacy,
    version: GAME_CONFIG.version,
    acquisitionEvents: [],
    activities: { nextSparringAt: legacy.lastSavedAt ?? legacy.createdAt ?? Date.now() },
    statistics: {
      ...legacy.statistics,
      contactsAcquired: 0,
      eventsCompleted: 0,
    },
  };
}

function read(key: string): GameState | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = migrate(JSON.parse(raw));
    return isGameState(parsed)
      ? {
          ...parsed,
          messages: parsed.messages.filter(
            (message) => !HIDDEN_MESSAGE_SUBJECTS.has(message.subject),
          ),
        }
      : null;
  } catch {
    return null;
  }
}

export function loadGame(now = Date.now()): GameState {
  return read(SAVE_KEY) ?? read(BACKUP_KEY) ?? createInitialState(now);
}

export function saveGame(state: GameState, now = Date.now()): void {
  try {
    const current = localStorage.getItem(SAVE_KEY);
    if (current) localStorage.setItem(BACKUP_KEY, current);
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, lastSavedAt: now }));
  } catch {
    // Il gioco resta utilizzabile anche quando lo storage del browser è indisponibile.
  }
}
