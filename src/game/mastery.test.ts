import { describe, expect, it } from "vitest";
import { createInitialState, gameReducer } from "./engine";

describe("collaborator mastery integration", () => {
  it("grants writing experience and announces a new grade", () => {
    const initial = createInitialState(1_000);
    const collaborator = {
      id: "mastery-writing",
      contactId: initial.contacts[0].id,
      displayName: "Giulia Ferrando",
      joinedAt: 1_000,
      forms: [],
      instructorForms: [],
      assignment: "writing" as const,
      mastery: {
        writing: 99.5,
        events: 0,
        lessons: 0,
        social: 0,
        equipment: 0,
        instructor: 0,
      },
      rarity: "rare" as const,
    };
    const next = gameReducer(
      { ...initial, collaborators: [collaborator], unlocks: { ...initial.unlocks, collaborators: true } },
      { type: "TICK", now: 2_000 },
    );

    expect(next.collaborators[0].mastery?.writing).toBe(100);
    expect(next.messages.some((message) =>
      message.subject === "Maestria raggiunta: Giulia Ferrando" &&
      message.preview.includes("Iniziato in Scrittura")
    )).toBe(true);
  });
});
