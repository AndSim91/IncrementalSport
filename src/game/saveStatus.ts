export type SavePhase = "pending" | "saved" | "error";

export interface GameSaveStatus {
  phase: SavePhase;
  lastSavedAt: number | null;
  nextAutoSaveAt: number;
}
