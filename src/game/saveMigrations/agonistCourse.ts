import { createInitialUpgradeLevels } from "../../content/upgrades";
import type { RetainedLegendaryProgress } from "../types";
import type { MigratableState } from "./types";

function legacyCourseBonus(completions: number | undefined): number {
  return Math.max(0, Math.floor(completions ?? 0));
}

export function migrateAgonistCourseState(state: MigratableState): MigratableState {
  if (state.version !== 47) return state;

  const contacts = (state.contacts ?? []).map((contact) => ({
    ...contact,
    agonistCourseArenaBonus:
      contact.agonistCourseArenaBonus ?? legacyCourseBonus(contact.agonistCourseCompletions),
    agonistCourseStyleBonus:
      contact.agonistCourseStyleBonus ?? legacyCourseBonus(contact.agonistCourseCompletions),
  }));
  const contactsById = new Map(contacts.map((contact) => [contact.id, contact]));
  const retainedProgress = Object.fromEntries(
    Object.entries(state.legendaryCollaborators?.retainedProgress ?? {}).map(
      ([profileId, progress]) => {
        const retained = progress as RetainedLegendaryProgress;
        return [profileId, {
          ...retained,
          agonistCourseArenaBonus:
            retained.agonistCourseArenaBonus ??
            legacyCourseBonus(retained.agonistCourseCompletions),
          agonistCourseStyleBonus:
            retained.agonistCourseStyleBonus ??
            legacyCourseBonus(retained.agonistCourseCompletions),
        }];
      },
    ),
  );

  return {
    ...state,
    version: 48,
    upgrades: { ...createInitialUpgradeLevels(), ...(state.upgrades ?? {}) },
    contacts,
    collaborators: (state.collaborators ?? []).map((collaborator) => ({
      ...collaborator,
      lastAgonistCourseYear:
        collaborator.lastAgonistCourseYear ??
        contactsById.get(collaborator.contactId)?.lastAgonistCourseYear,
    })),
    legendaryCollaborators: state.legendaryCollaborators
      ? { ...state.legendaryCollaborators, retainedProgress }
      : state.legendaryCollaborators,
  };
}
