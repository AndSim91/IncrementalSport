import { useCallback, useEffect, useMemo, useState } from "react";
import {
  TUTORIAL_SCENES,
  type TutorialRuntimeContext,
  type TutorialSceneId,
} from "../../content/tutorialScenes";
import type { GameAction, GameState } from "../../game/types";

export function useTutorialController({
  state,
  activeView,
  dispatch,
}: {
  state: GameState;
  activeView: string;
  dispatch: (action: GameAction) => void;
}) {
  const [stepIndexes, setStepIndexes] = useState<Partial<Record<TutorialSceneId, number>>>({});
  const context = useMemo<TutorialRuntimeContext>(
    () => ({ state, activeView }),
    [activeView, state],
  );
  const unavailableSceneIds = new Set([
    ...state.tutorial.completedSceneIds,
    ...state.tutorial.skippedSceneIds,
  ]);
  const candidateScene = TUTORIAL_SCENES.find(
    (scene) => !unavailableSceneIds.has(scene.id) && scene.canStart(context),
  ) ?? null;
  let resolvedStepIndex = candidateScene ? stepIndexes[candidateScene.id] ?? 0 : 0;
  while (candidateScene) {
    const step = candidateScene.steps[resolvedStepIndex];
    if (step?.kind !== "objective" || !step.isComplete(context)) break;
    resolvedStepIndex += 1;
  }
  const objectiveCompletedScene = candidateScene && resolvedStepIndex >= candidateScene.steps.length
    ? candidateScene
    : null;
  const activeScene = objectiveCompletedScene ? null : candidateScene;
  const activeStep = activeScene?.steps[resolvedStepIndex] ?? null;

  useEffect(() => {
    if (!objectiveCompletedScene) return;
    dispatch({
      type: "FINISH_TUTORIAL_SCENE",
      sceneId: objectiveCompletedScene.id,
      skipped: false,
    });
  }, [dispatch, objectiveCompletedScene]);

  const finishScene = useCallback((skipped: boolean) => {
    if (!candidateScene) return;
    dispatch({
      type: "FINISH_TUTORIAL_SCENE",
      sceneId: candidateScene.id,
      skipped,
    });
  }, [candidateScene, dispatch]);

  const continueScene = useCallback(() => {
    if (!activeScene) return;
    if (resolvedStepIndex >= activeScene.steps.length - 1) {
      finishScene(false);
      return;
    }
    setStepIndexes((current) => ({
      ...current,
      [activeScene.id]: resolvedStepIndex + 1,
    }));
  }, [activeScene, finishScene, resolvedStepIndex]);

  return {
    context,
    activeScene,
    activeStep,
    activeStepIndex: resolvedStepIndex,
    continueScene,
    skipScene: () => finishScene(true),
    shouldPauseGame: Boolean(candidateScene?.pauseWhileActive || activeStep?.kind === "dialog"),
    isBlockingInput: activeStep?.kind === "dialog",
  };
}
