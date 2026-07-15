import { Icon, type IconName } from "../common/Icon";
import { isGameAreaUnlocked, type GameArea } from "../../game/progression";
import type { GameState } from "../../game/types";

export type AppView = GameArea;

const items: { id: AppView; label: string; icon: IconName }[] = [
  { id: "mail", label: "Posta", icon: "mail" },
  { id: "events", label: "Eventi", icon: "flag" },
  { id: "contacts", label: "Iscritti", icon: "people" },
  { id: "upgrades", label: "Miglioramenti", icon: "spark" },
  { id: "statistics", label: "Attività", icon: "tasks" },
  { id: "settings", label: "Impostazioni", icon: "settings" },
];

export function AppRail({
  view,
  state,
  onChange,
}: {
  view: AppView;
  state: GameState;
  onChange: (view: AppView) => void;
}) {
  const visibleItems = items.filter((item) => isGameAreaUnlocked(item.id, state));
  return (
    <nav className="app-rail" aria-label="Applicazioni">
      {visibleItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={view === item.id ? "rail-item active" : "rail-item"}
          onClick={() => onChange(item.id)}
          aria-current={view === item.id ? "page" : undefined}
        >
          <Icon name={item.icon} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
