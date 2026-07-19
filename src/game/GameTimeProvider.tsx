import type { ReactNode } from "react";
import { GameTimeContext } from "./GameTimeContext";

export function GameTimeProvider({
  now,
  children,
}: {
  now: number;
  children: ReactNode;
}) {
  return (
    <GameTimeContext.Provider value={now}>
      {children}
    </GameTimeContext.Provider>
  );
}
