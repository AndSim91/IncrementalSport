import { describe, expect, it } from "vitest";
import { GAME_CONFIG } from "./config";
import {
  getSocialContactChance,
  getSocialIncomePerMember,
  getSocialTrialChance,
} from "./social";

describe("Social follower scaling", () => {
  it("uses the approved base values with no Follower", () => {
    expect(GAME_CONFIG.socialAutomationIntervalMs).toBe(120_000);
    expect(GAME_CONFIG.socialFollowerChance).toBe(0.25);
    expect(getSocialTrialChance(0)).toBe(0.0001);
    expect(getSocialContactChance(0)).toBe(0.001);
    expect(getSocialIncomePerMember(0)).toBe(5);
  });

  it("applies the approved Follower divisors", () => {
    expect(getSocialTrialChance(1_000)).toBeCloseTo(0.0011);
    expect(getSocialContactChance(1_000)).toBeCloseTo(0.003);
    expect(getSocialIncomePerMember(1_000)).toBe(6);
  });

  it("caps probabilities at 100%", () => {
    expect(getSocialTrialChance(1_000_000)).toBe(1);
    expect(getSocialContactChance(1_000_000)).toBe(1);
  });
});
