import { describe, expect, it } from "vitest";
import { createInitialUpgradeLevels } from "./upgrades";
import { getEmailPresentationLevel } from "./emailPresentation";

describe("email presentation progression", () => {
  it("follows the four visual upgrade milestones", () => {
    const upgrades = createInitialUpgradeLevels();
    expect(getEmailPresentationLevel(upgrades)).toBe(0);

    upgrades["outlook-templates"] = 1;
    expect(getEmailPresentationLevel(upgrades)).toBe(1);

    upgrades["call-to-action"] = 1;
    expect(getEmailPresentationLevel(upgrades)).toBe(2);

    upgrades["lesson-photos"] = 1;
    expect(getEmailPresentationLevel(upgrades)).toBe(3);

    upgrades["demo-video"] = 1;
    expect(getEmailPresentationLevel(upgrades)).toBe(4);
  });
});
