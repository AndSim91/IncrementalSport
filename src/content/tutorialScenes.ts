import { GAME_CONFIG } from "../game/config";
import { isGameAreaUnlocked } from "../game/progression";
import type { GameState } from "../game/types";

export const TUTORIAL_REGION_IDS = [
  "title",
  "contacts-counter",
  "commands",
  "navigation",
  "events-navigation",
  "upgrades-navigation",
  "folders",
  "messages",
  "main",
  "composer-header",
  "composer-recipient",
  "composer-body",
  "park-sparring-event",
  "park-sparring-action",
  "day-panel",
  "first-trial-row",
  "status",
] as const;

export type TutorialRegionId = typeof TUTORIAL_REGION_IDS[number];

export const TUTORIAL_SCENE_IDS = [
  "first-invitation",
  "first-event",
  "first-trial",
  "first-legendary",
  "first-enrollment",
] as const;

export type TutorialSceneId = typeof TUTORIAL_SCENE_IDS[number];

export interface TutorialRuntimeContext {
  state: GameState;
  activeView: string;
}

type RegionSelection =
  | readonly TutorialRegionId[]
  | ((context: TutorialRuntimeContext) => readonly TutorialRegionId[]);

type TutorialBody =
  | readonly string[]
  | ((context: TutorialRuntimeContext) => readonly string[]);

interface TutorialStepBase {
  id: string;
  title: string;
  body: TutorialBody;
  focusRegions: RegionSelection;
  hiddenRegions?: RegionSelection;
  navigateTo?: string;
  cardPlacement?: "left";
}

export interface TutorialDialogStep extends TutorialStepBase {
  kind: "dialog";
  speaker: string;
}

export interface TutorialObjectiveStep extends TutorialStepBase {
  kind: "objective";
  isComplete: (context: TutorialRuntimeContext) => boolean;
}

export type TutorialStep = TutorialDialogStep | TutorialObjectiveStep;

export interface TutorialSceneDefinition {
  id: TutorialSceneId;
  pauseWhileActive?: boolean;
  canStart: (context: TutorialRuntimeContext) => boolean;
  steps: readonly TutorialStep[];
}

export function resolveTutorialRegions(
  selection: RegionSelection | undefined,
  context: TutorialRuntimeContext,
): readonly TutorialRegionId[] {
  if (!selection) return [];
  return typeof selection === "function" ? selection(context) : selection;
}

export function resolveTutorialBody(
  body: TutorialBody,
  context: TutorialRuntimeContext,
): readonly string[] {
  return typeof body === "function" ? body(context) : body;
}

export const TUTORIAL_SCENES: readonly TutorialSceneDefinition[] = [
  {
    id: "first-invitation",
    pauseWhileActive: true,
    canStart: ({ state }) => state.profile.displayName.trim().length > 0,
    steps: [
      {
        id: "empty-school",
        kind: "dialog",
        speaker: "Segreteria dell'Ordine",
        title: "Il primo mattino",
        body: [
          "L'Ordine delle Onde ha una sala, sei spade e un problema: il corso è ancora vuoto.",
          "Cinque persone hanno lasciato il loro contatto dopo una dimostrazione. Sono il primo filo da seguire.",
        ],
        focusRegions: ["title"],
      },
      {
        id: "draft-ready",
        kind: "dialog",
        speaker: "Segreteria dell'Ordine",
        title: "Una bozza già pronta",
        body: [
          "Il primo invito è già aperto nella Posta. Per ora non devi comporre il testo: ogni pressione di un tasto fa avanzare la bozza.",
          "Quando sarà completa, il messaggio verrà inviato automaticamente e la segreteria aspetterà una risposta.",
        ],
        focusRegions: ["main"],
      },
      {
        id: "write-first-email",
        kind: "objective",
        title: "Invia il primo invito",
        body: [
          "Premi un tasto qualsiasi finché la bozza è completa. Durante questo passaggio il tempo di gioco resta in pausa.",
        ],
        focusRegions: ["main", "composer-body"],
        isComplete: ({ state }) => state.emails.some((email) => email.status === "sending"),
      },
    ],
  },
  {
    id: "first-event",
    canStart: ({ state }) => isGameAreaUnlocked("events", state),
    steps: [
      {
        id: "open-events",
        kind: "objective",
        title: "Apri Eventi",
        body: [
          "La prima missione è completata. Apri Eventi dalla barra delle applicazioni per organizzare nuove attività esterne.",
        ],
        focusRegions: ({ activeView }) =>
          activeView === "events"
            ? ["main"]
            : ["navigation", "events-navigation"],
        isComplete: ({ activeView }) => activeView === "events",
      },
      {
        id: "events-and-equipment",
        kind: "dialog",
        speaker: "Segreteria dell'Ordine",
        title: "Eventi e attrezzatura",
        body: [
          "Gli Eventi portano la scuola fuori dalla palestra: incontrerai persone, farai dimostrazioni e potrai ottenere nuovi contatti da invitare.",
          "Ogni attività impegna iscritti e spade. L'attrezzatura accumula usura e può danneggiarsi: quando serve, dovrai eseguire la manutenzione prima di riutilizzarla.",
        ],
        focusRegions: ["main"],
      },
      {
        id: "start-free-sparring",
        kind: "objective",
        title: "Avvia lo sparring gratuito",
        body: [
          "Trova “Sparring al parco” e premi “Partecipa gratis”. Per questa dimostrazione guidata durerà soltanto 3 secondi.",
        ],
        focusRegions: ["main", "park-sparring-action"],
        isComplete: ({ state }) => state.acquisitionEvents.some(
          (event) => event.tutorialSceneId === "first-event",
        ),
      },
      {
        id: "wait-free-sparring",
        kind: "objective",
        title: "Attendi la fine dello sparring",
        body: [
          "Lascia scorrere i 3 secondi dell'attività. Il tempo di gioco resta attivo durante lo sparring.",
        ],
        focusRegions: ["main", "park-sparring-event"],
        isComplete: ({ state }) => state.acquisitionEvents.some(
          (event) => event.tutorialSceneId === "first-event" && event.status === "completed",
        ),
      },
      {
        id: "contacts-increased",
        kind: "dialog",
        speaker: "Segreteria dell'Ordine",
        title: "I contatti sono aumentati",
        body: ({ state }) => {
          const contactReward = state.acquisitionEvents.find(
            (event) => event.tutorialSceneId === "first-event",
          )?.contactReward ?? GAME_CONFIG.tutorialSparringMinimumContacts;
          return [
            `Lo sparring è finito: +${contactReward} ${contactReward === 1 ? "nuovo contatto" : "nuovi contatti"} per la scuola. Gli Eventi servono anche ad ampliare il pubblico che potrai invitare.`,
            "I contatti da soli non sono ancora iscritti. Le email possono convertirli prima in una prova in palestra e, se la prova va bene, in un'iscrizione.",
          ];
        },
        focusRegions: ["title", "contacts-counter"],
      },
      {
        id: "watch-first-trial",
        kind: "objective",
        title: "Osserva La mia giornata",
        body: [
          "Torniamo in Posta e attendiamo la risposta a una delle email inviate a inizio partita.",
        ],
        focusRegions: ["day-panel"],
        navigateTo: "mail",
        isComplete: ({ state }) => state.scheduledTrials.some(
          (trial) => trial.tutorialSceneId === "first-event" && trial.status === "scheduled",
        ),
      },
    ],
  },
  {
    id: "first-trial",
    canStart: ({ state }) => state.statistics.trialsBooked >= 1,
    steps: [
      {
        id: "trial-booked",
        kind: "dialog",
        speaker: "Segreteria dell'Ordine",
        title: "Le email hanno funzionato",
        body: [
          "Una delle email inviate a inizio partita ha ricevuto risposta: la prima prova in palestra è ora prenotata.",
          "La trovi in “La mia giornata” con il conto alla rovescia. Alla fine saprai se il contatto si iscriverà alla scuola.",
        ],
        focusRegions: ["day-panel", "first-trial-row"],
      },
    ],
  },
  {
    id: "first-legendary",
    canStart: ({ state }) =>
      state.network.schools.length === 0 &&
      state.contacts.some(
        (contact) =>
          contact.specialProfileId === "andrea-simonazzi" &&
          contact.status === "writing",
      ),
    steps: [
      {
        id: "legendary-rarities",
        kind: "dialog",
        speaker: "Segreteria dell'Ordine",
        title: "Il primo Leggendario",
        body: [
          "Finora hai incontrato soltanto atleti Comuni. Ogni possibile iscritto possiede però una rarità: Comune, Raro, Ultra Raro o Leggendario.",
          "Andrea Simonazzi è il primo atleta Leggendario della partita. Da questo momento potranno comparire tutte le rarità, ognuna con probabilità e caratteristiche diverse.",
          "I Leggendari sono profili unici e, quando si iscrivono, diventano subito Collaboratori delle Onde. Collezionali tutti!",
        ],
        focusRegions: ["main", "composer-header"],
        navigateTo: "mail",
        cardPlacement: "left",
      },
    ],
  },
  {
    id: "first-enrollment",
    canStart: ({ state }) => state.statistics.membersEnrolled >= 1,
    steps: [
      {
        id: "first-fee",
        kind: "dialog",
        speaker: "Tesoreria dell'Ordine",
        title: "La prima quota",
        body: [
          `Il primo iscritto porta subito ${GAME_CONFIG.enrollmentBonus} € e poi una quota base di ${GAME_CONFIG.monthlyMemberFee} € ogni mese di gioco.`,
          `Ogni Forma o corso permanente conosciuto aggiunge ${GAME_CONFIG.monthlyMemberFormBonus} € alla quota mensile. È così che la scuola finanzia i suoi miglioramenti.`,
        ],
        focusRegions: ["title"],
      },
      {
        id: "open-upgrades",
        kind: "objective",
        title: "Apri gli Upgrade",
        body: [
          "Usa la barra delle applicazioni a sinistra e apri Upgrade.",
        ],
        focusRegions: ({ activeView }) =>
          activeView === "upgrades"
            ? ["main"]
            : ["navigation", "upgrades-navigation"],
        isComplete: ({ activeView }) => activeView === "upgrades",
      },
      {
        id: "upgrade-tree",
        kind: "dialog",
        speaker: "Tesoreria dell'Ordine",
        title: "Investire per crescere",
        body: [
          "Qui puoi spendere la disponibilità della scuola per migliorare scrittura, prove, eventi e automazioni.",
          "Gli Upgrade si sbloccano a rami: non serve comprare tutto subito. Scegli ciò che sostiene il prossimo obiettivo.",
        ],
        focusRegions: ["main"],
      },
    ],
  },
] as const;
