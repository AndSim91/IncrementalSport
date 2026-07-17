import {
  COLLABORATOR_MASTERY_ROLE_LABELS,
  createInitialCollaboratorMastery,
  getCollaboratorMasteryDefinition,
  getCollaboratorMasteryLevel,
} from "../content/mastery";
import { addInboxMessage } from "./messages";
import { makeGameId } from "./ids";
import type { CollaboratorAssignment, GameState, InboxMessage } from "./types";

export function addMessage(
  state: GameState,
  now: number,
  subject: string,
  preview: string,
  tone: InboxMessage["tone"] = "positive",
  category: NonNullable<InboxMessage["category"]> = "focused",
  threadKey?: InboxMessage["threadKey"],
): GameState {
  const message: InboxMessage = {
    id: makeGameId("message", now, state.messages.length),
    sender: "Ordine delle Onde",
    subject,
    preview,
    receivedAt: now,
    tone,
    unread: true,
    category,
    threadKey,
  };
  return { ...state, messages: addInboxMessage(state.messages, message) };
}

export function addCollaboratorMasteryExperience(
  state: GameState,
  role: CollaboratorAssignment,
  amount: number,
  now: number,
): GameState {
  if (!role || !Number.isFinite(amount) || amount <= 0) return state;

  const leveledUp: Array<{ displayName: string; levelName: string; multiplier: number }> = [];
  const nextState: GameState = {
    ...state,
    collaborators: state.collaborators.map((collaborator) => {
      if (collaborator.assignment !== role) return collaborator;
      const mastery = collaborator.mastery ?? createInitialCollaboratorMastery();
      const currentXp = Math.max(0, mastery[role] ?? 0);
      const nextXp = currentXp + amount;
      if (getCollaboratorMasteryLevel(nextXp) > getCollaboratorMasteryLevel(currentXp)) {
        const definition = getCollaboratorMasteryDefinition(nextXp);
        leveledUp.push({
          displayName: collaborator.displayName,
          levelName: definition.name,
          multiplier: definition.multiplier,
        });
      }
      return {
        ...collaborator,
        mastery: { ...mastery, [role]: nextXp },
      };
    }),
  };

  return leveledUp.reduce(
    (currentState, collaborator) => addMessage(
      currentState,
      now,
      `Maestria raggiunta: ${collaborator.displayName}`,
      `${collaborator.displayName} è ora ${collaborator.levelName} in ${COLLABORATOR_MASTERY_ROLE_LABELS[role]}. Bonus del settore: +${Math.round(collaborator.multiplier * 100)}%.`,
      "positive",
      "other",
      "collaborators",
    ),
    nextState,
  );
}
