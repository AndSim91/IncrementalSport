import { act, renderHook, waitFor } from "@testing-library/react";
import { useCallback, useState } from "react";
import { describe, expect, it } from "vitest";
import { gameReducer } from "../../game/engine";
import { createInitialState } from "../../game/initialState";
import type { GameAction, GameState } from "../../game/types";
import { useTutorialController } from "./useTutorialController";

function useTutorialHarness() {
  const [state, setState] = useState(() => createInitialState(1_000, "Andrea Ungaro"));
  const [activeView, setActiveView] = useState("mail");
  const dispatch = useCallback((action: GameAction) => {
    setState((current) => gameReducer(current, action));
  }, []);
  const tutorial = useTutorialController({ state, activeView, dispatch });

  return {
    state,
    tutorial,
    setActiveView,
    setStatistics: (statistics: Partial<GameState["statistics"]>) =>
      setState((current) => ({
        ...current,
        statistics: { ...current.statistics, ...statistics },
      })),
    setFirstEmailSending: () => setState((current) => ({
      ...current,
      emails: current.emails.map((email, index) => index === 0
        ? { ...email, status: "sending" as const, sendCompletesAt: 1_350 }
        : email),
    })),
    unlockEvents: () => setState((current) => ({
      ...current,
      tutorial: {
        ...current.tutorial,
        completedSceneIds: ["first-invitation"],
      },
      shortGoal: {
        definitionId: "book-trials",
        baseline: 0,
        target: 2,
        startedAt: 1_500,
        completedCount: 1,
      },
    })),
    startFreeSparring: () => setState((current) => gameReducer(current, {
      type: "START_ACQUISITION_EVENT",
      definitionId: "park-sparring",
      now: 2_000,
    })),
    tick: (now: number) => setState((current) => gameReducer(current, {
      type: "TICK",
      now,
    })),
    showTutorialTrial: () => setState((current) => ({
      ...current,
      scheduledTrials: [...current.scheduledTrials, {
        id: "trial-tutorial",
        contactId: current.contacts[0].id,
        startsAt: 30_000,
        resolvesAt: 40_000,
        resultSeed: 1,
        status: "scheduled" as const,
        tutorialSceneId: "first-event" as const,
      }],
    })),
  };
}

describe("useTutorialController", () => {
  it("alternates paused dialogue and interactive objectives, then persists completion", async () => {
    const { result } = renderHook(() => useTutorialHarness());

    await waitFor(() => expect(result.current.tutorial.activeScene?.id).toBe("first-invitation"));
    expect(result.current.tutorial.activeStep?.kind).toBe("dialog");
    expect(result.current.tutorial.isBlockingInput).toBe(true);
    expect(result.current.tutorial.shouldPauseGame).toBe(true);

    act(() => result.current.tutorial.continueScene());
    act(() => result.current.tutorial.continueScene());

    expect(result.current.tutorial.activeStep?.kind).toBe("objective");
    expect(result.current.tutorial.isBlockingInput).toBe(false);
    expect(result.current.tutorial.shouldPauseGame).toBe(true);

    act(() => result.current.setFirstEmailSending());

    await waitFor(() => {
      expect(result.current.state.tutorial.completedSceneIds).toContain("first-invitation");
    });
    expect(result.current.state.statistics.emailsSent).toBe(0);
    expect(result.current.state.shortGoal.baseline).toBe(1);
    expect(result.current.tutorial.activeScene).toBeNull();
    expect(result.current.tutorial.shouldPauseGame).toBe(false);
  });

  it("records Salta for the current scene without marking it completed", async () => {
    const { result } = renderHook(() => useTutorialHarness());
    await waitFor(() => expect(result.current.tutorial.activeScene?.id).toBe("first-invitation"));

    act(() => result.current.tutorial.skipScene());

    await waitFor(() => {
      expect(result.current.state.tutorial.skippedSceneIds).toContain("first-invitation");
    });
    expect(result.current.state.tutorial.completedSceneIds).not.toContain("first-invitation");
  });

  it("guides the player through sparring, contact growth and the DayPanel trial", async () => {
    const { result } = renderHook(() => useTutorialHarness());

    act(() => result.current.unlockEvents());

    await waitFor(() => expect(result.current.tutorial.activeScene?.id).toBe("first-event"));
    expect(result.current.tutorial.activeStep?.id).toBe("open-events");
    expect(result.current.tutorial.isBlockingInput).toBe(false);
    expect(result.current.tutorial.shouldPauseGame).toBe(false);

    act(() => result.current.setActiveView("events"));

    expect(result.current.tutorial.activeStep?.id).toBe("events-and-equipment");
    expect(result.current.tutorial.isBlockingInput).toBe(true);
    expect(result.current.tutorial.shouldPauseGame).toBe(true);

    act(() => result.current.tutorial.continueScene());

    expect(result.current.tutorial.activeStep?.id).toBe("start-free-sparring");
    expect(result.current.tutorial.isBlockingInput).toBe(false);
    expect(result.current.tutorial.shouldPauseGame).toBe(false);

    act(() => result.current.startFreeSparring());

    expect(result.current.state.acquisitionEvents).toContainEqual(
      expect.objectContaining({
        definitionId: "park-sparring",
        status: "running",
        resolvesAt: 5_000,
        tutorialSceneId: "first-event",
      }),
    );
    expect(result.current.tutorial.activeStep?.id).toBe("wait-free-sparring");
    expect(result.current.tutorial.shouldPauseGame).toBe(false);

    act(() => result.current.tick(5_000));

    expect(result.current.tutorial.activeStep?.id).toBe("contacts-increased");
    expect(result.current.tutorial.activeStep?.kind).toBe("dialog");
    expect(result.current.tutorial.shouldPauseGame).toBe(true);

    act(() => result.current.tutorial.continueScene());

    expect(result.current.tutorial.activeStep?.id).toBe("watch-first-trial");
    expect(result.current.tutorial.shouldPauseGame).toBe(false);

    act(() => result.current.showTutorialTrial());

    await waitFor(() => {
      expect(result.current.state.tutorial.completedSceneIds).toContain("first-event");
    });
    expect(result.current.state.tutorial.completedSceneIds).toContain("first-trial");
    expect(result.current.tutorial.activeScene).toBeNull();
  });

  it("keeps the Events tutorial ahead of later scenes once the mission unlocks it", async () => {
    const { result } = renderHook(() => useTutorialHarness());

    act(() => result.current.setStatistics({ trialsBooked: 1, membersEnrolled: 1 }));
    act(() => result.current.unlockEvents());

    await waitFor(() => expect(result.current.tutorial.activeScene?.id).toBe("first-event"));
    expect(result.current.tutorial.activeStep?.id).toBe("open-events");
  });
});
