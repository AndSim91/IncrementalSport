import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AGONIST_COURSE_LOGO } from "../../content/formLogos";
import { AggregatedTeachingBar } from "./AggregatedTeachingBar";
import { groupInstructorTeachingEntries } from "./aggregatedTeachingPresentation";
import type { InstructorTeachingEntry } from "./instructorGroupPresentation";

function entry(
  id: string,
  formId: InstructorTeachingEntry["training"]["formId"],
): InstructorTeachingEntry {
  return {
    id,
    displayName: id,
    instructorId: "instructor",
    training: {
      formId,
      startedAt: 1_000,
      completesAt: 2_000,
      status: "running",
    },
  };
}

describe("aggregated teaching groups", () => {
  it("keeps one segmented bar for each taught Form", () => {
    const groups = groupInstructorTeachingEntries([
      entry("uno", "form-1"),
      entry("due", "course-x"),
      entry("tre", "form-1"),
    ]);

    expect(groups.map((group) => [group.courseId, group.entries.length])).toEqual([
      ["form-1", 2],
      ["course-x", 1],
    ]);
  });
});

describe("AggregatedTeachingBar", () => {
  it("shows the dedicated Corso Agonisti logo instead of the trophy", () => {
    render(
      <AggregatedTeachingBar
        entries={[
          {
            id: "athlete-1",
            displayName: "Atleta Agonista",
            instructorId: "instructor-1",
            training: {
              formId: "agonist-course",
              startedAt: 1_000,
              completesAt: 31_000,
              status: "running",
              instructorId: "instructor-1",
            },
          },
        ]}
        now={16_000}
        technicalArenaLevel={3}
      />,
    );

    expect(screen.getByRole("img", {
      name: "Corso Agonisti — emblema generato",
    })).toHaveAttribute("src", AGONIST_COURSE_LOGO.assetPath);
    expect(screen.getByText("Corso Agonisti")).toBeVisible();
    expect(screen.getByRole("progressbar", {
      name: "Corso Agonisti: 1 corso",
    })).toBeVisible();
  });
});
