import { compactGameHistory, createEmptyHistoryArchive } from "../historyArchive";
import type { GameState } from "../types";
import type { MigratableState } from "./types";

export function migrateScalabilityState(state: MigratableState): MigratableState {
  if (state.version !== 35) return state;
  return compactGameHistory({
    ...state,
    version: 36,
    historyArchive: createEmptyHistoryArchive(),
  } as GameState);
}
