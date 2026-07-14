import type { EmailPresentationLevel, UpgradeLevels } from "../game/types";

export const EMAIL_PRESENTATION_LEVELS: Record<
  EmailPresentationLevel,
  { label: string; description: string }
> = {
  0: {
    label: "Testo semplice",
    description: "Un messaggio personale senza impaginazione aggiuntiva.",
  },
  1: {
    label: "Email impaginata",
    description: "Titolo, spaziatura e firma seguono un modello coordinato.",
  },
  2: {
    label: "Email interattiva",
    description: "La call to action e i riferimenti utili diventano cliccabili.",
  },
  3: {
    label: "Email illustrata",
    description: "Logo e foto raccontano l'esperienza oltre al testo.",
  },
  4: {
    label: "Volantino digitale",
    description: "Contenuti, dettagli, contatti e video formano una campagna completa.",
  },
};

export function getEmailPresentationLevel(upgrades: UpgradeLevels): EmailPresentationLevel {
  if ((upgrades["demo-video"] ?? 0) > 0) return 4;
  if ((upgrades["lesson-photos"] ?? 0) > 0) return 3;
  if ((upgrades["call-to-action"] ?? 0) > 0) return 2;
  if ((upgrades["outlook-templates"] ?? 0) > 0) return 1;
  return 0;
}
