import { describe, expect, it } from "vitest";
import type { InstructorTeachingEntry } from "./instructorGroupPresentation";
import { groupInstructorTeachingEntries } from "./aggregatedTeachingPresentation";

function entry(id: string, formId: InstructorTeachingEntry["training"]["formId"]): InstructorTeachingEntry {
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
