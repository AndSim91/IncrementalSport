import {
  createInitialCollaboratorManagement,
} from "../collaboratorManagement";
import { GAME_CONFIG } from "../config";
import type { MigratableState } from "./types";

export function migrateCollaboratorManagementState(
  state: MigratableState,
): MigratableState {
  if (state.version !== 52) return state;

  const collaboratorManagement = createInitialCollaboratorManagement();
  return {
    ...state,
    version: 53,
    collaboratorManagement: {
      ...collaboratorManagement,
      aggregateViewUnlocked:
        (state.collaborators?.length ?? 0) >= GAME_CONFIG.collaboratorAggregateUnlockCount,
    },
  };
}
