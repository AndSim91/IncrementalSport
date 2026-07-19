import { createContext, useContext } from "react";

export const GameTimeContext = createContext<number | null>(null);

export function useProvidedGameTime(): number | null {
  return useContext(GameTimeContext);
}
