import { describe, expect, it } from "vitest";
import { createInitialState, gameReducer } from "./engine";
import { selectAvailableContacts } from "./selectors";

describe("admin resource actions", () => {
  it("adds members and updates member-based progression", () => {
    const initial = createInitialState(1_000);
    const state = gameReducer(initial, { type: "ADMIN_ADD_MEMBERS", amount: 12 });

    expect(state.school).toMatchObject({
      activeMembers: 12,
      peakActiveMembers: 12,
      historicMembers: 12,
      euros: 0,
    });
    expect(state.unlocks).toMatchObject({ upgrades: true, social: true, forms: true });
    expect(state.statistics.membersEnrolled).toBe(0);
  });

  it("adds euros without counting them as earned income", () => {
    const initial = createInitialState(1_000);
    const state = gameReducer(initial, { type: "ADMIN_ADD_EUROS", amount: 1_000.55 });

    expect(state.school.euros).toBe(1_000.55);
    expect(state.statistics.eurosEarned).toBe(0);
  });

  it("adds or removes available email contacts", () => {
    const initial = createInitialState(1_000);
    const added = gameReducer(initial, { type: "ADMIN_ADD_CONTACTS", amount: 2 });
    const removed = gameReducer(added, { type: "ADMIN_ADD_CONTACTS", amount: -3 });

    expect(selectAvailableContacts(initial)).toBe(4);
    expect(selectAvailableContacts(added)).toBe(6);
    expect(selectAvailableContacts(removed)).toBe(3);
    expect(removed.statistics.contactsAcquired).toBe(0);
  });

  it("does not let negative resources go below zero", () => {
    const initial = createInitialState(1_000);
    const state = gameReducer(
      gameReducer(initial, { type: "ADMIN_ADD_MEMBERS", amount: -10 }),
      { type: "ADMIN_ADD_EUROS", amount: -10 },
    );

    expect(state.school.activeMembers).toBe(0);
    expect(state.school.euros).toBe(0);
  });
});
