import { COLLABORATOR_MASTERY_ROLES } from "../content/mastery";
import { GAME_CONFIG } from "./config";
import { getInstructorTeachingCounts, getRunningAcquisitionEvents } from "./runtimeIndexes";
import type {
  CollaboratorManagementState,
  CollaboratorMasteryRole,
  CollaboratorPresetId,
  GameState,
} from "./types";

export const COLLABORATOR_PRESET_IDS: readonly CollaboratorPresetId[] = [
  "preset-1",
  "preset-2",
  "preset-3",
];

export function createEmptyCollaboratorTargets(): Record<CollaboratorMasteryRole, number> {
  return {
    writing: 0,
    events: 0,
    lessons: 0,
    equipment: 0,
    instructor: 0,
  };
}

export function createInitialCollaboratorManagement(): CollaboratorManagementState {
  return {
    aggregateViewUnlocked: false,
    activePresetId: null,
    presets: {
      "preset-1": { saved: false, targets: createEmptyCollaboratorTargets() },
      "preset-2": { saved: false, targets: createEmptyCollaboratorTargets() },
      "preset-3": { saved: false, targets: createEmptyCollaboratorTargets() },
    },
  };
}

function sanitizeTarget(value: number): number {
  return Number.isFinite(value)
    ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(value)))
    : 0;
}

export function sanitizeCollaboratorTargets(
  targets: Record<CollaboratorMasteryRole, number>,
): Record<CollaboratorMasteryRole, number> {
  return COLLABORATOR_MASTERY_ROLES.reduce(
    (result, role) => {
      result[role] = sanitizeTarget(targets[role]);
      return result;
    },
    createEmptyCollaboratorTargets(),
  );
}

export function getBusyCollaboratorIds(state: GameState): ReadonlySet<string> {
  const busyIds = new Set<string>();
  for (const event of getRunningAcquisitionEvents(state.acquisitionEvents)) {
    if (event.collaboratorId) busyIds.add(event.collaboratorId);
  }
  for (const collaborator of state.collaborators) {
    if (collaborator.training) busyIds.add(collaborator.id);
  }
  for (const instructorId of getInstructorTeachingCounts(
    state.contacts,
    state.collaborators,
  ).keys()) {
    busyIds.add(instructorId);
  }
  return busyIds;
}

export function getCollaboratorAssignmentCounts(
  state: GameState,
): Record<CollaboratorMasteryRole, number> {
  const counts = createEmptyCollaboratorTargets();
  for (const collaborator of state.collaborators) {
    if (collaborator.assignment) counts[collaborator.assignment] += 1;
  }
  return counts;
}

export function saveCollaboratorPreset(
  state: GameState,
  presetId: CollaboratorPresetId,
  targets: Record<CollaboratorMasteryRole, number>,
): GameState {
  if (!state.collaboratorManagement.aggregateViewUnlocked) return state;
  const nextState: GameState = {
    ...state,
    collaboratorManagement: {
      ...state.collaboratorManagement,
      presets: {
        ...state.collaboratorManagement.presets,
        [presetId]: {
          saved: true,
          targets: sanitizeCollaboratorTargets(targets),
        },
      },
    },
  };
  return state.collaboratorManagement.activePresetId === presetId
    ? reconcileCollaboratorManagement(nextState)
    : nextState;
}

export function applyCollaboratorPreset(
  state: GameState,
  presetId: CollaboratorPresetId,
): GameState {
  if (
    !state.collaboratorManagement.aggregateViewUnlocked ||
    !state.collaboratorManagement.presets[presetId].saved
  ) return state;
  return reconcileCollaboratorManagement({
    ...state,
    collaboratorManagement: {
      ...state.collaboratorManagement,
      activePresetId: presetId,
    },
  });
}

function rebalanceActivePreset(state: GameState): GameState {
  const activePresetId = state.collaboratorManagement.activePresetId;
  if (!activePresetId) return state;
  const preset = state.collaboratorManagement.presets[activePresetId];
  if (!preset.saved) return state;

  const busyIds = getBusyCollaboratorIds(state);
  const remainingTargets = { ...preset.targets };
  for (const collaborator of state.collaborators) {
    if (busyIds.has(collaborator.id) && collaborator.assignment) {
      remainingTargets[collaborator.assignment] = Math.max(
        0,
        remainingTargets[collaborator.assignment] - 1,
      );
    }
  }

  const keptFreeIds = new Set<string>();
  for (const collaborator of state.collaborators) {
    if (
      busyIds.has(collaborator.id) ||
      !collaborator.assignment ||
      remainingTargets[collaborator.assignment] <= 0
    ) continue;
    keptFreeIds.add(collaborator.id);
    remainingTargets[collaborator.assignment] -= 1;
  }

  let changed = false;
  const collaborators = state.collaborators.map((collaborator) => {
    if (busyIds.has(collaborator.id) || keptFreeIds.has(collaborator.id)) {
      return collaborator;
    }
    const assignment = COLLABORATOR_MASTERY_ROLES.find(
      (role) => remainingTargets[role] > 0,
    ) ?? null;
    if (assignment) remainingTargets[assignment] -= 1;
    if (collaborator.assignment === assignment) return collaborator;
    changed = true;
    return { ...collaborator, assignment };
  });

  return changed ? { ...state, collaborators } : state;
}

export function reconcileCollaboratorManagement(state: GameState): GameState {
  const shouldUnlock = state.collaboratorManagement.aggregateViewUnlocked ||
    state.collaborators.length >= GAME_CONFIG.collaboratorAggregateUnlockCount;
  const unlockedState = shouldUnlock === state.collaboratorManagement.aggregateViewUnlocked
    ? state
    : {
        ...state,
        collaboratorManagement: {
          ...state.collaboratorManagement,
          aggregateViewUnlocked: true,
        },
      };
  return rebalanceActivePreset(unlockedState);
}
