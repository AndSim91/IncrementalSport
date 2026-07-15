import { describe, expect, it } from "vitest";
import {
  COLLABORATOR_MASTERY_LEVELS,
  getCollaboratorMasteryDefinition,
  getCollaboratorMasteryMultiplier,
  getCollaboratorMasteryProgress,
} from "./mastery";

describe("collaborator mastery", () => {
  it("exposes the five Italian grades with small sector bonuses", () => {
    expect(COLLABORATOR_MASTERY_LEVELS.map((level) => level.name)).toEqual([
      "Novizio",
      "Iniziato",
      "Accademico",
      "Cavaliere",
      "Maestro",
    ]);
    expect(COLLABORATOR_MASTERY_LEVELS.map((level) => level.multiplier)).toEqual([
      0,
      0.02,
      0.04,
      0.06,
      0.08,
    ]);
  });

  it("clamps the maximum grade and reports progress to the next grade", () => {
    expect(getCollaboratorMasteryDefinition(0).name).toBe("Novizio");
    expect(getCollaboratorMasteryDefinition(1_500).name).toBe("Maestro");
    expect(getCollaboratorMasteryDefinition(50_000).name).toBe("Maestro");
    expect(getCollaboratorMasteryMultiplier(1_500)).toBeCloseTo(1.08);
    expect(getCollaboratorMasteryProgress(200)).toMatchObject({
      currentXp: 200,
      nextXp: 300,
      progress: 50,
      definition: { name: "Iniziato" },
    });
    expect(getCollaboratorMasteryProgress(1_500).progress).toBe(100);
  });
});
