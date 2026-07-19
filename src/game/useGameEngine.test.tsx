import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialState } from "./engine";
import { loadGame, saveGame } from "./save";
import { useGameEngine } from "./useGameEngine";

describe("useGameEngine pause", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    saveGame(createInitialState(1_000, "Andrea Ungaro"), 1_000);
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("keeps the game clock and every remaining duration frozen", () => {
    const { result } = renderHook(() => useGameEngine());

    act(() => vi.advanceTimersByTime(250));
    act(() => result.current.togglePause());

    const pausedAt = result.current.state.automation.lastProcessedAt;
    const remainingMonthMs = result.current.state.school.nextFeeAt - pausedAt;
    expect(result.current.isPaused).toBe(true);

    act(() => result.current.dispatch({
      type: "START_ACQUISITION_EVENT",
      definitionId: "park-sparring",
      now: result.current.getGameNow(),
    }));
    expect(result.current.state.acquisitionEvents[0].resolvesAt - pausedAt).toBe(15_000);

    act(() => vi.advanceTimersByTime(30_000));

    expect(result.current.getGameNow()).toBe(pausedAt);
    expect(result.current.state.automation.lastProcessedAt).toBe(pausedAt);
    expect(result.current.state.school.nextFeeAt - pausedAt).toBe(remainingMonthMs);
    expect(result.current.state.acquisitionEvents[0].status).toBe("running");
    const reloadedWhilePaused = loadGame(Date.now());
    expect(
      reloadedWhilePaused.school.nextFeeAt -
      reloadedWhilePaused.automation.lastProcessedAt,
    ).toBe(remainingMonthMs);

    act(() => result.current.togglePause());

    expect(result.current.isPaused).toBe(false);
    expect(
      result.current.state.school.nextFeeAt -
      result.current.state.automation.lastProcessedAt,
    ).toBe(remainingMonthMs);
    expect(
      result.current.state.acquisitionEvents[0].resolvesAt -
      result.current.state.automation.lastProcessedAt,
    ).toBe(15_000);
  });
});
