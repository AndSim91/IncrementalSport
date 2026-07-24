import { AGONIST_COURSE_LOGO, getFormLogo } from "../../content/formLogos";
import {
  getFormDefinition,
  getTrainingCourseTitle,
  isAgonistCourse,
} from "../../content/forms";
import type { TrainingCourseId } from "../../game/types";
import { groupInstructorTeachingEntries } from "./aggregatedTeachingPresentation";
import {
  getAggregateInstructorProgress,
  getInstructorTrainingProgress,
  type InstructorTeachingEntry,
} from "./instructorGroupPresentation";

function TeachingCourseLogo({
  courseId,
  technicalArenaLevel,
}: {
  courseId: TrainingCourseId;
  technicalArenaLevel: number;
}) {
  const title = getTrainingCourseTitle(courseId, technicalArenaLevel);
  if (isAgonistCourse(courseId)) {
    return (
      <span className="aggregated-teaching-course-logo" title={title}>
        <img
          src={AGONIST_COURSE_LOGO.assetPath}
          alt={`${title} — emblema generato`}
        />
      </span>
    );
  }

  const logo = getFormLogo(courseId);
  const definition = getFormDefinition(courseId);
  return (
    <span className="aggregated-teaching-course-logo" title={definition?.longName ?? title}>
      <img
        src={logo.assetPath}
        alt={`${definition?.longName ?? title} — emblema ${logo.source === "official" ? "ufficiale" : "generato"}`}
      />
    </span>
  );
}

export function AggregatedTeachingBar({
  entries,
  now,
  technicalArenaLevel,
}: {
  entries: readonly InstructorTeachingEntry[];
  now: number;
  technicalArenaLevel: number;
}) {
  const groups = groupInstructorTeachingEntries(entries);

  return (
    <div className="aggregated-teaching-groups" aria-label="Lezioni raggruppate per Forma">
      {groups.map((group) => {
        const progress = getAggregateInstructorProgress(group.entries, now) ?? 0;
        const title = getTrainingCourseTitle(group.courseId, technicalArenaLevel);
        return (
          <div className="aggregated-teaching-group" key={group.courseId}>
            <span className="aggregated-teaching-course">
              <TeachingCourseLogo
                courseId={group.courseId}
                technicalArenaLevel={technicalArenaLevel}
              />
              <strong title={title}>{title}</strong>
            </span>
            <span
              className="aggregated-teaching-bar"
              role="progressbar"
              aria-label={`${title}: ${group.entries.length} ${group.entries.length === 1 ? "corso" : "corsi"}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              aria-valuetext={`${group.entries.length} ${group.entries.length === 1 ? "corso" : "corsi"} · ${Math.round(progress)}%`}
            >
              {group.entries.map((entry) => {
                const entryProgress = getInstructorTrainingProgress(entry.training, now);
                const waiting = entry.training.status === "waitingForEquipment";
                return (
                  <span
                    className={`aggregated-teaching-segment${waiting ? " is-waiting" : ""}`}
                    title={waiting
                      ? `${entry.displayName}: in attesa di spade`
                      : `${entry.displayName}: ${Math.round(entryProgress)}%`}
                    key={`${entry.id}-${entry.training.startedAt}`}
                  >
                    <span style={{ width: `${entryProgress}%` }} />
                  </span>
                );
              })}
            </span>
            <small>{group.entries.length}</small>
          </div>
        );
      })}
    </div>
  );
}
