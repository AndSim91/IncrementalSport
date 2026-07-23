import { describe, expect, it } from "vitest";
import { createInitialCollaboratorMastery } from "../content/mastery";
import {
  applyCollaboratorPreset,
  getCollaboratorAssignmentCounts,
  reconcileCollaboratorManagement,
  saveCollaboratorPreset,
} from "./collaboratorManagement";
import { createInitialState } from "./initialState";
import { gameReducer } from "./engine";
import type { Collaborator, CollaboratorAssignment, GameState } from "./types";

function collaborator(
  index: number,
  assignment: CollaboratorAssignment = null,
): Collaborator {
  return {
    id: `collaborator-${index}`,
    contactId: `contact-${index}`,
    displayName: `Collaboratore ${index}`,
    joinedAt: 1_000 + index,
    forms: [],
    instructorForms: [],
    formBranchPreferences: [],
    autoTeachingEnabled: true,
    assignment,
    mastery: createInitialCollaboratorMastery(),
    rarity: "ultra-rare",
  };
}

const targets = {
  writing: 2,
  events: 1,
  lessons: 1,
  equipment: 1,
  instructor: 2,
};

describe("collaborator aggregate management", () => {
  it("unlocks permanently when the ninth collaborator joins", () => {
    const initial = createInitialState(1_000);
    const unlocked = reconcileCollaboratorManagement({
      ...initial,
      collaborators: Array.from({ length: 9 }, (_, index) => collaborator(index)),
    });

    expect(unlocked.collaboratorManagement.aggregateViewUnlocked).toBe(true);

    const afterDepartures = reconcileCollaboratorManagement({
      ...unlocked,
      collaborators: unlocked.collaborators.slice(0, 3),
    });
    expect(afterDepartures.collaboratorManagement.aggregateViewUnlocked).toBe(true);
  });

  it("applies a saved numeric preset and leaves excess collaborators unassigned", () => {
    const initial = createInitialState(1_000);
    const unlocked = reconcileCollaboratorManagement({
      ...initial,
      collaborators: Array.from({ length: 9 }, (_, index) => collaborator(index)),
    });
    const saved = saveCollaboratorPreset(unlocked, "preset-1", targets);
    const applied = applyCollaboratorPreset(saved, "preset-1");

    expect(applied.collaboratorManagement.activePresetId).toBe("preset-1");
    expect(getCollaboratorAssignmentCounts(applied)).toEqual(targets);
    expect(applied.collaborators.filter((candidate) => candidate.assignment === null)).toHaveLength(2);
  });

  it("keeps missing positions and fills them as soon as a collaborator becomes available", () => {
    const initial = createInitialState(1_000);
    const unlocked: GameState = {
      ...initial,
      collaborators: [collaborator(1), collaborator(2)],
      collaboratorManagement: {
        ...initial.collaboratorManagement,
        aggregateViewUnlocked: true,
      },
    };
    const saved = saveCollaboratorPreset(unlocked, "preset-1", {
      writing: 3,
      events: 0,
      lessons: 0,
      equipment: 0,
      instructor: 0,
    });
    const applied = applyCollaboratorPreset(saved, "preset-1");

    expect(applied.collaborators.map((candidate) => candidate.assignment)).toEqual([
      "writing",
      "writing",
    ]);
    expect(applied.collaboratorManagement.presets["preset-1"].targets.writing).toBe(3);

    const filled = reconcileCollaboratorManagement({
      ...applied,
      collaborators: [...applied.collaborators, collaborator(3)],
    });
    expect(filled.collaborators[2].assignment).toBe("writing");
  });

  it("waits for an active event before moving its collaborator", () => {
    const initial = createInitialState(1_000);
    const eventCollaborator = collaborator(1, "events");
    const event = {
      id: "event-1",
      definitionId: "park-sparring" as const,
      title: "Sparring al parco",
      location: "Parco",
      startedAt: 1_000,
      resolvesAt: 5_000,
      cost: 0,
      peopleMet: 0,
      demonstrationsGiven: 0,
      contactReward: 0,
      membersUsed: 0,
      equipmentUsed: 0,
      wearAdded: 0,
      collaboratorId: eventCollaborator.id,
      status: "running" as const,
    };
    const unlocked: GameState = {
      ...initial,
      collaborators: [eventCollaborator],
      acquisitionEvents: [event],
      collaboratorManagement: {
        ...initial.collaboratorManagement,
        aggregateViewUnlocked: true,
      },
    };
    const saved = saveCollaboratorPreset(unlocked, "preset-1", {
      writing: 1,
      events: 0,
      lessons: 0,
      equipment: 0,
      instructor: 0,
    });
    const applied = applyCollaboratorPreset(saved, "preset-1");

    expect(applied.collaborators[0].assignment).toBe("events");

    const completed = reconcileCollaboratorManagement({
      ...applied,
      acquisitionEvents: [{ ...event, status: "completed" }],
    });
    expect(completed.collaborators[0].assignment).toBe("writing");
  });

  it("reassigns a completed event collaborator before automation can start another event", () => {
    const initial = createInitialState(1_000);
    const eventCollaborator = collaborator(1, "events");
    const unlocked: GameState = {
      ...initial,
      collaborators: [eventCollaborator],
      acquisitionEvents: [{
        id: "event-1",
        definitionId: "park-sparring",
        title: "Sparring al parco",
        location: "Parco",
        startedAt: 1_000,
        resolvesAt: 5_000,
        cost: 0,
        peopleMet: 0,
        demonstrationsGiven: 0,
        contactReward: 0,
        membersUsed: 0,
        equipmentUsed: 0,
        wearAdded: 0,
        collaboratorId: eventCollaborator.id,
        status: "running",
      }],
      collaboratorManagement: {
        ...initial.collaboratorManagement,
        aggregateViewUnlocked: true,
      },
    };
    const applied = applyCollaboratorPreset(
      saveCollaboratorPreset(unlocked, "preset-1", {
        writing: 1,
        events: 0,
        lessons: 0,
        equipment: 0,
        instructor: 0,
      }),
      "preset-1",
    );

    const completed = gameReducer(applied, { type: "TICK", now: 5_000 });

    expect(completed.collaborators[0].assignment).toBe("writing");
    expect(completed.acquisitionEvents.filter((event) => event.status === "running")).toHaveLength(0);
  });
});
