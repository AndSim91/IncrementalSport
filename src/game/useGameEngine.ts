import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { GAME_CONFIG } from "./config";
import { gameReducer } from "./engine";
import { freezeGameState } from "./offline";
import { loadGame, saveGame } from "./save";
import { createSaveScheduler, type SaveScheduler } from "./saveScheduler";
import type { GameAction } from "./types";

export function useGameEngine() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => loadGame());
  const stateRef = useRef(state);
  const observedStateRef = useRef(state);
  const pausedAtRef = useRef<number | null>(null);
  const saveSchedulerRef = useRef<SaveScheduler | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const savePausedGame = useCallback((currentState: typeof state, now = Date.now()) => {
    const pausedAt = pausedAtRef.current;
    const stateToSave = pausedAt === null
      ? currentState
      : freezeGameState(currentState, now, now - pausedAt);
    return saveGame(stateToSave, now);
  }, []);

  useLayoutEffect(() => {
    stateRef.current = state;
    if (observedStateRef.current !== state) {
      observedStateRef.current = state;
      saveSchedulerRef.current?.markDirty(state);
    }
  }, [state]);

  useEffect(() => {
    const tickId = window.setInterval(() => {
      if (
        pausedAtRef.current === null &&
        stateRef.current.profile.displayName.trim()
      ) {
        dispatch({ type: "TICK", now: Date.now() });
      }
    }, 250);
    return () => window.clearInterval(tickId);
  }, []);

  useEffect(() => {
    const saveScheduler = createSaveScheduler(stateRef.current, savePausedGame);
    saveSchedulerRef.current = saveScheduler;
    const stopScheduler = saveScheduler.start(GAME_CONFIG.saveIntervalMs);
    const saveOnExit = () => saveScheduler.flush();
    window.addEventListener("beforeunload", saveOnExit);
    return () => {
      stopScheduler();
      window.removeEventListener("beforeunload", saveOnExit);
      saveSchedulerRef.current = null;
    };
  }, [savePausedGame]);

  const dispatchAction = useCallback((action: GameAction) => {
    if (action.type === "REPLACE_STATE" && pausedAtRef.current !== null) {
      pausedAtRef.current = Date.now();
    }
    dispatch(action);
  }, []);

  const getGameNow = useCallback(
    () => pausedAtRef.current ?? Date.now(),
    [],
  );

  const togglePause = useCallback(() => {
    const now = Date.now();
    const pausedAt = pausedAtRef.current;

    if (pausedAt === null) {
      dispatch({ type: "TICK", now });
      pausedAtRef.current = now;
      setIsPaused(true);
      return;
    }

    dispatch({ type: "RESUME_FROM_PAUSE", now, elapsedMs: now - pausedAt });
    pausedAtRef.current = null;
    setIsPaused(false);
  }, []);

  return {
    state,
    dispatch: dispatchAction,
    getGameNow,
    isPaused,
    togglePause,
  };
}
