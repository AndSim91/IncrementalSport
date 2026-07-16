import { Icon } from "../common/Icon";
import { getGameMonthName, getSchoolYear } from "../../game/calendar";
import { GAME_CONFIG } from "../../game/config";

const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

export function TitleBar({
  currentMonth,
  nextMonthAt,
  now,
  availableContacts,
  activeMembers,
  euros,
}: {
  currentMonth: number;
  nextMonthAt: number;
  now: number;
  availableContacts: number;
  activeMembers: number;
  euros: number;
}) {
  const monthName = getGameMonthName(currentMonth);
  const currentSchoolYear = getSchoolYear(currentMonth);
  const monthProgress = Math.min(
    100,
    Math.max(0, Math.round((1 - (nextMonthAt - now) / GAME_CONFIG.gameMonthMs) * 100)),
  );

  return (
    <header className="title-bar">
      <button className="title-menu" type="button" aria-label="Apri menu">
        <Icon name="menu" />
      </button>
      <div className="title-resources" aria-label="Situazione del gioco">
        <span className="title-resource" aria-label={`Contatti disponibili: ${availableContacts}`}>
          <Icon name="contact" />
          <small>Contatti</small>
          <strong>{availableContacts}</strong>
        </span>
        <span className="title-resource" aria-label={`Iscritti attivi: ${activeMembers}`}>
          <Icon name="people" />
          <small>Iscritti</small>
          <strong>{activeMembers}</strong>
        </span>
        <span className="title-resource" aria-label={`Disponibilità economica: ${euro.format(euros)}`}>
          <Icon name="coin" />
          <small>Disponibilità</small>
          <strong>{euro.format(euros)}</strong>
        </span>
      </div>
      <span
        className="title-month"
        aria-label={`Mese corrente: ${monthName}, anno scolastico ${currentSchoolYear}`}
      >
        <span className="title-month-copy">
          <strong>{monthName}</strong>
          <small>Anno scolastico {currentSchoolYear}</small>
        </span>
        <span
          className="month-progress"
          role="progressbar"
          aria-label={`Avanzamento di ${monthName}, anno scolastico ${currentSchoolYear}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={monthProgress}
        >
          <i style={{ width: `${monthProgress}%` }} />
        </span>
      </span>
      <div className="window-controls" aria-hidden="true">
        <span>—</span><span>□</span><span>×</span>
      </div>
    </header>
  );
}
