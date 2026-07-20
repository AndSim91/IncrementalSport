import { GAME_CONFIG } from "./config";
import { roundCurrency } from "./economy";

export function getSocialTrialChance(followers: number): number {
  return Math.min(
    1,
    GAME_CONFIG.socialTrialChance +
      Math.max(0, followers) * GAME_CONFIG.socialTrialChancePerFollower,
  );
}

export function getSocialContactChance(followers: number): number {
  return Math.min(
    1,
    GAME_CONFIG.socialContactChance +
      Math.max(0, followers) * GAME_CONFIG.socialContactChancePerFollower,
  );
}

export function getSocialIncomePerMember(followers: number): number {
  return roundCurrency(
    GAME_CONFIG.socialIncomePerMember +
      Math.max(0, followers) * GAME_CONFIG.socialIncomePerMemberPerFollower,
  );
}
