import { useState } from "react";
import { getCollaboratorAssignmentLabel } from "../../content/collaboratorRoles";
import { COLLABORATOR_MASTERY_ROLES } from "../../content/mastery";
import {
  COLLABORATOR_PRESET_IDS,
  getBusyCollaboratorIds,
  getCollaboratorAssignmentCounts,
} from "../../game/collaboratorManagement";
import type {
  CollaboratorMasteryRole,
  CollaboratorPresetId,
  CollaboratorSectorPreset,
  GameState,
} from "../../game/types";

const ROLE_DESCRIPTIONS: Record<CollaboratorMasteryRole, string> = {
  writing: "Scrive le email e, dopo lo sblocco, produce contenuti online.",
  events: "Organizza automaticamente gli eventi disponibili.",
  lessons: "Migliora Arena o Stile degli atleti della scuola.",
  equipment: "Riduce l'usura e ripara le spade danneggiate.",
  instructor: "Insegna Forme e Corso Agonisti agli atleti idonei.",
};

function getPresetLabel(presetId: CollaboratorPresetId): string {
  return `Preset ${COLLABORATOR_PRESET_IDS.indexOf(presetId) + 1}`;
}

function CollaboratorPresetCard({
  presetId,
  preset,
  active,
  collaboratorTotal,
  assignmentCounts,
  socialUnlocked,
  onSave,
  onApply,
}: {
  presetId: CollaboratorPresetId;
  preset: CollaboratorSectorPreset;
  active: boolean;
  collaboratorTotal: number;
  assignmentCounts: Record<CollaboratorMasteryRole, number>;
  socialUnlocked: boolean;
  onSave: (
    presetId: CollaboratorPresetId,
    targets: Record<CollaboratorMasteryRole, number>,
  ) => void;
  onApply: (presetId: CollaboratorPresetId) => void;
}) {
  const [targets, setTargets] = useState(() => ({ ...preset.targets }));
  const targetTotal = COLLABORATOR_MASTERY_ROLES.reduce(
    (total, role) => total + targets[role],
    0,
  );
  const missingCollaborators = Math.max(0, targetTotal - collaboratorTotal);
  const unfilledActivePositions = active
    ? COLLABORATOR_MASTERY_ROLES.reduce(
        (total, role) => total + Math.max(0, preset.targets[role] - assignmentCounts[role]),
        0,
      )
    : 0;
  const transitioningCollaborators = Math.max(
    0,
    unfilledActivePositions - Math.max(0, targetTotal - collaboratorTotal),
  );

  return (
    <article className={`collaborator-preset-card${active ? " is-active" : ""}`}>
      <header>
        <div>
          <h4>{getPresetLabel(presetId)}</h4>
          <span>{preset.saved ? (active ? "Attivo" : "Salvato") : "Vuoto"}</span>
        </div>
        <strong>{targetTotal} posti</strong>
      </header>

      <div className="collaborator-preset-fields">
        {COLLABORATOR_MASTERY_ROLES.map((role) => {
          const label = getCollaboratorAssignmentLabel(role, socialUnlocked);
          return (
            <label key={role}>
              <span>{label}</span>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                aria-label={`${getPresetLabel(presetId)}: collaboratori in ${label}`}
                value={targets[role]}
                onChange={(event) => {
                  const value = Number.parseInt(event.target.value, 10);
                  setTargets((current) => ({
                    ...current,
                    [role]: Number.isFinite(value) ? Math.max(0, value) : 0,
                  }));
                }}
              />
            </label>
          );
        })}
      </div>

      <div className="collaborator-preset-status" aria-live="polite">
        {missingCollaborators > 0 ? (
          <span className="is-warning">
            Mancano {missingCollaborators} {missingCollaborators === 1 ? "collaboratore" : "collaboratori"}
          </span>
        ) : transitioningCollaborators > 0 ? (
          <span>
            {transitioningCollaborators} {transitioningCollaborators === 1 ? "collaboratore occupato completerà" : "collaboratori occupati completeranno"} il lavoro in corso
          </span>
        ) : active ? (
          <span>Distribuzione applicata</span>
        ) : (
          <span>Definisci quanti collaboratori assegnare a ogni settore</span>
        )}
      </div>

      <div className="collaborator-preset-actions">
        <button type="button" onClick={() => onSave(presetId, targets)}>
          Salva preset
        </button>
        <button
          type="button"
          className="primary"
          disabled={!preset.saved || active}
          onClick={() => onApply(presetId)}
        >
          {active ? "Applicato" : "Applica"}
        </button>
      </div>
    </article>
  );
}

export function CollaboratorSectorView({
  state,
  onSavePreset,
  onApplyPreset,
}: {
  state: GameState;
  onSavePreset: (
    presetId: CollaboratorPresetId,
    targets: Record<CollaboratorMasteryRole, number>,
  ) => void;
  onApplyPreset: (presetId: CollaboratorPresetId) => void;
}) {
  const assignmentCounts = getCollaboratorAssignmentCounts(state);
  const busyIds = getBusyCollaboratorIds(state);
  const activePresetId = state.collaboratorManagement.activePresetId;

  return (
    <section
      className="collaborator-sector-view"
      aria-label="Gestione aggregata dei collaboratori"
      data-tutorial-region="collaborator-sectors"
    >
      <div className="collaborator-sector-summary">
        <div>
          <h3>Settori di lavoro</h3>
          <p>
            La distribuzione è gestita per quantità. I collaboratori impegnati terminano
            prima l'attività corrente.
          </p>
        </div>
        <span>{busyIds.size} impegnati ora</span>
      </div>

      <div className="collaborator-sector-grid">
        {COLLABORATOR_MASTERY_ROLES.map((role) => {
          const activeTarget = activePresetId
            ? state.collaboratorManagement.presets[activePresetId].targets[role]
            : null;
          return (
            <article key={role} className="collaborator-sector-card">
              <span>{getCollaboratorAssignmentLabel(role, state.unlocks.social)}</span>
              <strong>
                {assignmentCounts[role]}
                {activeTarget !== null ? <small> / {activeTarget}</small> : null}
              </strong>
              <p>{ROLE_DESCRIPTIONS[role]}</p>
            </article>
          );
        })}
      </div>

      <div className="collaborator-presets-heading">
        <h3>Preset dell'organico</h3>
        <p>Salva tre distribuzioni numeriche e applicale quando cambia la priorità della scuola.</p>
      </div>
      <div className="collaborator-preset-grid">
        {COLLABORATOR_PRESET_IDS.map((presetId) => {
          const preset = state.collaboratorManagement.presets[presetId];
          const presetKey = COLLABORATOR_MASTERY_ROLES
            .map((role) => preset.targets[role])
            .join("-");
          return (
            <CollaboratorPresetCard
              key={`${presetId}-${preset.saved}-${presetKey}`}
              presetId={presetId}
              preset={preset}
              active={activePresetId === presetId}
              collaboratorTotal={state.collaborators.length}
              assignmentCounts={assignmentCounts}
              socialUnlocked={state.unlocks.social}
              onSave={onSavePreset}
              onApply={onApplyPreset}
            />
          );
        })}
      </div>
    </section>
  );
}
