import { COLLABORATOR_ASSIGNMENT_LABELS } from "../../content/collaboratorRoles";
import { getContactPreparation, hasCompletedCourseX } from "../../game/athleteStats";
import { selectActiveEmail, selectInstructorTeachingCount } from "../../game/selectors";
import type { Collaborator, Contact, GameState } from "../../game/types";
import {
  getCollaboratorAutomationPresentation,
  type CollaboratorAutomationPresentation,
} from "./collaboratorAutomationPresentation";

export type CollaboratorSortKey = "name" | "assignment" | "activity" | "arena" | "style";
export type CollaboratorSortDirection = "ascending" | "descending";

export interface CollaboratorSort {
  key: CollaboratorSortKey;
  direction: CollaboratorSortDirection;
}

export interface CollaboratorSortContext {
  state: GameState;
  contactsById: ReadonlyMap<string, Contact>;
  activeEmail: ReturnType<typeof selectActiveEmail>;
  now: number;
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, "it", { numeric: true, sensitivity: "base" });
}

function compareNullable(
  left: number | null,
  right: number | null,
  direction: CollaboratorSortDirection,
): number {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  const comparison = left - right;
  return direction === "ascending" ? comparison : -comparison;
}

function getAutomation(
  collaborator: Collaborator,
  context: CollaboratorSortContext,
): CollaboratorAutomationPresentation {
  return getCollaboratorAutomationPresentation({
    state: context.state,
    collaboratorId: collaborator.id,
    assignment: collaborator.assignment,
    now: context.now,
    activeEmail: context.activeEmail,
  });
}

function getActivityValue(
  collaborator: Collaborator,
  context: CollaboratorSortContext,
): number | null {
  if (collaborator.assignment === "instructor") {
    const teachingCount = selectInstructorTeachingCount(context.state, collaborator.id);
    return teachingCount > 0 ? teachingCount : null;
  }
  return getAutomation(collaborator, context).progress ?? null;
}

function getOfficialScore(
  collaborator: Collaborator,
  key: "arena" | "style",
  context: CollaboratorSortContext,
): number | null {
  const contact = context.contactsById.get(collaborator.contactId);
  if (!contact || !hasCompletedCourseX(collaborator.forms)) return null;
  return getContactPreparation(contact, collaborator.forms)[key];
}

function compareCollaborators(
  left: Collaborator,
  right: Collaborator,
  sort: CollaboratorSort,
  context: CollaboratorSortContext,
): number {
  if (sort.key === "name") {
    const comparison = compareText(left.displayName, right.displayName);
    return sort.direction === "ascending" ? comparison : -comparison;
  }
  if (sort.key === "assignment") {
    const leftLabel = left.assignment
      ? COLLABORATOR_ASSIGNMENT_LABELS[left.assignment]
      : null;
    const rightLabel = right.assignment
      ? COLLABORATOR_ASSIGNMENT_LABELS[right.assignment]
      : null;
    if (leftLabel === null && rightLabel === null) return 0;
    if (leftLabel === null) return 1;
    if (rightLabel === null) return -1;
    const comparison = compareText(leftLabel, rightLabel);
    return sort.direction === "ascending" ? comparison : -comparison;
  }
  if (sort.key === "activity") {
    return compareNullable(
      getActivityValue(left, context),
      getActivityValue(right, context),
      sort.direction,
    );
  }
  return compareNullable(
    getOfficialScore(left, sort.key, context),
    getOfficialScore(right, sort.key, context),
    sort.direction,
  );
}

export function sortCollaborators(
  collaborators: readonly Collaborator[],
  sort: CollaboratorSort | null,
  context: CollaboratorSortContext,
): Collaborator[] {
  if (!sort) return [...collaborators];
  return collaborators
    .map((collaborator, index) => ({ collaborator, index }))
    .sort((left, right) =>
      compareCollaborators(left.collaborator, right.collaborator, sort, context) ||
      left.index - right.index
    )
    .map(({ collaborator }) => collaborator);
}
