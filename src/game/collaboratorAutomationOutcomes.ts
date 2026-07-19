import { getContactBaseStats } from "./athleteStats";
import { GAME_CONFIG } from "./config";
import { addLegendaryEncounters, createAcquiredContacts } from "./contacts";
import { makeGameId } from "./ids";
import { nextRandom } from "./random";
import type { GameState, ScheduledTrial } from "./types";

export function improveRandomAthletes(
  state: GameState,
  improvementCount: number,
): { state: GameState; improvements: number } {
  const eligibleIndices = state.contacts.flatMap((contact, index) =>
    contact.status === "enrolled" ? [index] : []
  );
  if (improvementCount <= 0 || eligibleIndices.length === 0) {
    return { state, improvements: 0 };
  }

  const contacts = [...state.contacts];
  let nextSeed = state.randomSeed;
  let lastImprovedAthlete: string | undefined;
  for (let index = 0; index < improvementCount; index += 1) {
    const [athleteRoll, seedAfterAthlete] = nextRandom(nextSeed);
    const [statRoll, seedAfterStat] = nextRandom(seedAfterAthlete);
    nextSeed = seedAfterStat;
    const contactIndex = eligibleIndices[Math.min(
      eligibleIndices.length - 1,
      Math.floor(athleteRoll * eligibleIndices.length),
    )];
    const contact = contacts[contactIndex];
    const stats = getContactBaseStats(contact);
    contacts[contactIndex] = statRoll < 0.5
      ? { ...contact, arenaBase: stats.arena + 1, styleBase: stats.style }
      : { ...contact, arenaBase: stats.arena, styleBase: stats.style + 1 };
    lastImprovedAthlete = `${contact.firstName} ${contact.lastName}`;
  }

  return {
    state: {
      ...state,
      randomSeed: nextSeed,
      contacts,
      automation: { ...state.automation, lastImprovedAthlete },
    },
    improvements: improvementCount,
  };
}

export function scheduleSocialTrials(
  state: GameState,
  trialCount: number,
  now: number,
): GameState {
  if (trialCount <= 0) return state;
  const acquired = createAcquiredContacts(state, trialCount, "social", now);
  let nextSeed = acquired.nextSeed;
  const trialOffset = state.historyArchive.completedTrials + state.scheduledTrials.length;
  const trials: ScheduledTrial[] = acquired.contacts.map((contact, index) => {
    const [resultRoll, seedAfterResult] = nextRandom(nextSeed);
    nextSeed = seedAfterResult;
    return {
      id: makeGameId("trial", now, trialOffset + index),
      contactId: contact.id,
      startsAt: now,
      resolvesAt: now + GAME_CONFIG.trialDurationMs,
      resultSeed: Math.floor(resultRoll * 2_147_483_647),
      status: "scheduled",
    };
  });

  return {
    ...state,
    randomSeed: nextSeed,
    legendaryCollaborators: addLegendaryEncounters(
      state.legendaryCollaborators,
      acquired.contacts,
    ),
    contacts: [
      ...state.contacts,
      ...acquired.contacts.map((contact) => ({ ...contact, status: "trialScheduled" as const })),
    ],
    scheduledTrials: [...state.scheduledTrials, ...trials],
    statistics: {
      ...state.statistics,
      trialsBooked: state.statistics.trialsBooked + trialCount,
      socialTrials: state.statistics.socialTrials + trialCount,
    },
  };
}

export interface SocialAutomationOutcome {
  state: GameState;
  cycles: number;
  eurosEarned: number;
  trialsBooked: number;
  contactsAcquired: number;
}

export function resolveSocialAutomationCycles(
  state: GameState,
  cycleCount: number,
  now: number,
): SocialAutomationOutcome {
  const cycles = Math.max(0, Math.floor(cycleCount));
  if (cycles === 0) {
    return {
      state,
      cycles: 0,
      eurosEarned: 0,
      trialsBooked: 0,
      contactsAcquired: 0,
    };
  }

  let nextSeed = state.randomSeed;
  let trialsBooked = 0;
  let contactsAcquired = 0;
  for (let index = 0; index < cycles; index += 1) {
    const [trialRoll, seedAfterTrial] = nextRandom(nextSeed);
    const [contactRoll, seedAfterContact] = nextRandom(seedAfterTrial);
    nextSeed = seedAfterContact;
    if (trialRoll < GAME_CONFIG.socialTrialChance) trialsBooked += 1;
    if (contactRoll < GAME_CONFIG.socialContactChance) contactsAcquired += 1;
  }

  const eurosEarned = cycles * state.school.activeMembers * GAME_CONFIG.socialIncomePerMember;
  let nextState: GameState = {
    ...state,
    randomSeed: nextSeed,
    school: {
      ...state.school,
      euros: state.school.euros + eurosEarned,
    },
    statistics: {
      ...state.statistics,
      eurosEarned: state.statistics.eurosEarned + eurosEarned,
    },
  };

  if (contactsAcquired > 0) {
    const acquired = createAcquiredContacts(nextState, contactsAcquired, "social", now);
    nextState = {
      ...nextState,
      randomSeed: acquired.nextSeed,
      legendaryCollaborators: addLegendaryEncounters(
        nextState.legendaryCollaborators,
        acquired.contacts,
      ),
      contacts: [...nextState.contacts, ...acquired.contacts],
      statistics: {
        ...nextState.statistics,
        contactsAcquired: nextState.statistics.contactsAcquired + contactsAcquired,
        socialContacts: nextState.statistics.socialContacts + contactsAcquired,
      },
    };
  }

  if (trialsBooked > 0) {
    nextState = scheduleSocialTrials(nextState, trialsBooked, now);
  }

  return { state: nextState, cycles, eurosEarned, trialsBooked, contactsAcquired };
}
