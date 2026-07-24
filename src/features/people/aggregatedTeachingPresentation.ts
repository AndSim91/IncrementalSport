import type { TrainingCourseId } from "../../game/types";
import type { InstructorTeachingEntry } from "./instructorGroupPresentation";

export interface InstructorTeachingGroup {
  courseId: TrainingCourseId;
  entries: InstructorTeachingEntry[];
}

export function groupInstructorTeachingEntries(
  entries: readonly InstructorTeachingEntry[],
): InstructorTeachingGroup[] {
  const groups = new Map<TrainingCourseId, InstructorTeachingEntry[]>();
  for (const entry of entries) {
    const current = groups.get(entry.training.formId);
    if (current) current.push(entry);
    else groups.set(entry.training.formId, [entry]);
  }
  return [...groups].map(([courseId, groupedEntries]) => ({
    courseId,
    entries: groupedEntries,
  }));
}
