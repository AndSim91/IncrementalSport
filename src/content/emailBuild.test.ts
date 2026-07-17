import { describe, expect, it } from "vitest";
import { createInitialState } from "../game/engine";
import {
  getEmailBuildLength,
  getEmailBuildSource,
  getEmailStructureProgress,
  getEmailTextRevealCount,
} from "./emailBuild";
import { EMAIL_TEMPLATES } from "./emailTemplates";

describe("email construction phases", () => {
  it("writes the HTML source progressively from level 3", () => {
    const initialEmail = createInitialState(1_000).emails[0];
    const email = { ...initialEmail, presentationLevel: 3 as const };
    const source = getEmailBuildSource(email);

    expect(source).toContain("<!doctype html>");
    expect(getEmailStructureProgress(email)).toBe(0);
    expect(getEmailTextRevealCount(email)).toBe(0);

    const halfWritten = {
      ...email,
      revealedCharacters: Math.round(source.length / 2),
    };
    expect(getEmailStructureProgress(halfWritten)).toBe(50);
    expect(getEmailTextRevealCount(halfWritten)).toBe(halfWritten.revealedCharacters);
  });

  it.each([0, 1, 2] as const)("reveals level %i copy from the first input", (level) => {
    const initialEmail = createInitialState(1_000).emails[0];
    const email = {
      ...initialEmail,
      presentationLevel: level,
      revealedCharacters: 1,
    };

    expect(getEmailStructureProgress(email)).toBe(100);
    expect(getEmailTextRevealCount(email)).toBe(1);
  });

  it("reveals the complete copy when the email reaches its final character", () => {
    const email = createInitialState(1_000).emails[0];
    const completed = { ...email, revealedCharacters: email.body.length };

    expect(getEmailTextRevealCount(completed)).toBe(email.body.length);
  });

  it("writes catalog 2 as plain text and retains the full signature", () => {
    const initialEmail = createInitialState(1_000, "Andrea Ungaro").emails[0];
    const body = EMAIL_TEMPLATES[0].body("Nome", "Andrea Ungaro", 2);
    const email = {
      ...initialEmail,
      body,
      presentationLevel: 2 as const,
      revealedCharacters: 0,
    };
    expect(getEmailBuildSource(email)).toBe(body);
    expect(getEmailBuildLength(email)).toBe(body.length);
    expect(getEmailStructureProgress(email)).toBe(100);
    expect(body).toContain("Andrea Ungaro, Ordine delle Onde - Genova");
    expect(body).not.toContain("IL PROSSIMO PASSO");
  });
});
