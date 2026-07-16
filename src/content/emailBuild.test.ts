import { describe, expect, it } from "vitest";
import { createInitialState } from "../game/engine";
import {
  EMAIL_STRUCTURE_INPUTS,
  getEmailStructureProgress,
  getEmailTextRevealCount,
} from "./emailBuild";

describe("email construction phases", () => {
  it("builds the visual structure before revealing copy", () => {
    const email = createInitialState(1_000).emails[0];

    expect(getEmailStructureProgress(email)).toBe(0);
    expect(getEmailTextRevealCount(email)).toBe(0);

    const builtStructure = {
      ...email,
      revealedCharacters: EMAIL_STRUCTURE_INPUTS,
    };
    expect(getEmailStructureProgress(builtStructure)).toBe(100);
    expect(getEmailTextRevealCount(builtStructure)).toBe(0);
  });

  it("reveals the complete copy when the email reaches its final character", () => {
    const email = createInitialState(1_000).emails[0];
    const completed = { ...email, revealedCharacters: email.body.length };

    expect(getEmailTextRevealCount(completed)).toBe(email.body.length);
  });
});
