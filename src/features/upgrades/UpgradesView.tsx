import { Icon } from "../../components/common/Icon";
import { GAME_CONFIG } from "../../game/config";
import { selectIncomePerMinute } from "../../game/selectors";
import type { GameState } from "../../game/types";

const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

export function UpgradesView({ state, onBuySpeed }: { state: GameState; onBuySpeed: () => void }) {
  const incomePerMinute = selectIncomePerMinute(state);
  const speedBought = state.upgrades.speedLevel > 0;
  const canBuySpeed =
    state.unlocks.upgrades && !speedBought && state.school.euros >= GAME_CONFIG.speedUpgradeCost;

  return (
    <main className="overview-view shop-view">
      <header><Icon name="spark" /><div><h1>Miglioramenti</h1><p>Strumenti e procedure per far crescere l'Ordine delle Onde</p></div></header>
      <section className="income-summary" aria-label="Entrate dell'Ordine">
        <div><span>Entrate previste</span><strong>{euro.format(incomePerMinute)} <small>al minuto</small></strong></div>
        <p>{state.school.activeMembers} {state.school.activeMembers === 1 ? "iscritto attivo" : "iscritti attivi"} × {euro.format(GAME_CONFIG.memberFee)} ogni minuto</p>
        <div className="income-balance"><span>Disponibilità attuale</span><b>{euro.format(state.school.euros)}</b></div>
      </section>
      <section className="shop-section">
        <div className="section-title"><div><h2>Velocità di scrittura</h2><p>Ogni miglioramento aumenta anche il lavoro automatico futuro.</p></div><span>{state.player.writingPower} caratteri per input</span></div>
        <div className="upgrade-row">
          <div className="upgrade-icon"><Icon name="spark" /></div>
          <div className="upgrade-description"><strong>Tastiera comoda</strong><span>Aggiunge 1 carattere a ogni pressione e a ogni click nel messaggio.</span></div>
          <div className="upgrade-effect">+1 carattere</div>
          <button type="button" onClick={onBuySpeed} disabled={!canBuySpeed}>
            {speedBought
              ? "Installata"
              : state.unlocks.upgrades
                ? `Acquista · ${euro.format(GAME_CONFIG.speedUpgradeCost)}`
                : "Si sblocca al primo iscritto"}
          </button>
        </div>
      </section>
    </main>
  );
}
