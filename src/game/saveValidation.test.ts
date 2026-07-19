import { describe, expect, it } from "vitest";
import { createInitialState } from "./engine";
import { isValidGameState } from "./saveValidation";

describe("save validation at extreme scale", () => {
  it("accepts safe billion-scale counters and a finite quadrillion-scale balance", () => {
    const initial = createInitialState(1_000, "", false);
    const extreme = {
      ...initial,
      school: {
        ...initial.school,
        activeMembers: 1_000_000_000,
        peakActiveMembers: 1_000_000_000,
        historicMembers: 1_000_000_000,
        euros: 2_000_000_000_000_000,
      },
      statistics: {
        ...initial.statistics,
        contactsAcquired: 1_000_000_000,
      },
    };

    expect(isValidGameState(JSON.parse(JSON.stringify(extreme)))).toBe(true);
  });

  it.each([
    ["fractional members", { activeMembers: 1.5 }],
    ["negative members", { activeMembers: -1 }],
    ["unsafe members", { activeMembers: Number.MAX_SAFE_INTEGER + 1 }],
    ["infinite euros", { euros: Infinity }],
    ["negative euros", { euros: -1 }],
  ])("rejects %s", (_label, schoolPatch) => {
    const initial = createInitialState(1_000, "", false);
    expect(isValidGameState({
      ...initial,
      school: { ...initial.school, ...schoolPatch },
    })).toBe(false);
  });
});
