import type { AcquisitionEventId } from "../game/types";

export interface AcquisitionEventDefinition {
  id: AcquisitionEventId;
  title: string;
  location: string;
  description: string;
  durationMs: number;
  cost: number;
  baseAttendance: number;
  demonstrationRate: number;
  contactRate: number;
  varianceMin: number;
  varianceMax: number;
  risk: "Basso" | "Medio" | "Alto";
  potential: "Bassa" | "Media" | "Alta";
  requiredMembers: number;
  requiredSwords: number;
  wearAdded: number;
}

export const ACQUISITION_EVENTS: AcquisitionEventDefinition[] = [
  {
    id: "park-sparring",
    title: "Sparring al parco",
    location: "Parco di Villa Croce",
    description: "Una sessione informale e gratuita per incontrare poche persone interessate.",
    durationMs: 15_000,
    cost: 0,
    baseAttendance: 6,
    demonstrationRate: 0.5,
    contactRate: 0.3,
    varianceMin: 0.8,
    varianceMax: 1.2,
    risk: "Basso",
    potential: "Bassa",
    requiredMembers: 0,
    requiredSwords: 2,
    wearAdded: 3,
  },
  {
    id: "public-demo",
    title: "Dimostrazione pubblica",
    location: "Piazza De Ferrari",
    description: "Un appuntamento programmato con maggiore affluenza e materiale organizzativo.",
    durationMs: 45_000,
    cost: 80,
    baseAttendance: 20,
    demonstrationRate: 0.4,
    contactRate: 0.3,
    varianceMin: 0.85,
    varianceMax: 1.2,
    risk: "Medio",
    potential: "Media",
    requiredMembers: 2,
    requiredSwords: 4,
    wearAdded: 8,
  },
  {
    id: "sports-stand",
    title: "Stand sportivo",
    location: "Porto Antico",
    description: "Uno spazio riconoscibile per presentare la disciplina a un pubblico numeroso.",
    durationMs: 60_000,
    cost: 160,
    baseAttendance: 32,
    demonstrationRate: 0.35,
    contactRate: 0.28,
    varianceMin: 0.9,
    varianceMax: 1.15,
    risk: "Basso",
    potential: "Media",
    requiredMembers: 4,
    requiredSwords: 6,
    wearAdded: 10,
  },
  {
    id: "local-event",
    title: "Evento locale",
    location: "Piazza delle Erbe",
    description: "Un appuntamento di quartiere dal pubblico generalista e dall'affluenza variabile.",
    durationMs: 40_000,
    cost: 120,
    baseAttendance: 22,
    demonstrationRate: 0.35,
    contactRate: 0.28,
    varianceMin: 0.65,
    varianceMax: 1.4,
    risk: "Medio",
    potential: "Media",
    requiredMembers: 3,
    requiredSwords: 4,
    wearAdded: 7,
  },
  {
    id: "themed-event",
    title: "Evento a tema",
    location: "Villa Bombrini",
    description: "Un evento scenografico, accuratamente privo di riferimenti legalmente riconoscibili.",
    durationMs: 60_000,
    cost: 320,
    baseAttendance: 45,
    demonstrationRate: 0.4,
    contactRate: 0.32,
    varianceMin: 0.8,
    varianceMax: 1.25,
    risk: "Medio",
    potential: "Alta",
    requiredMembers: 8,
    requiredSwords: 6,
    wearAdded: 12,
  },
  {
    id: "school-open-day",
    title: "Open day della scuola",
    location: "Sede dell'Ordine delle Onde",
    description: "Una giornata introduttiva in palestra con contatti meno numerosi ma più interessati.",
    durationMs: 45_000,
    cost: 200,
    baseAttendance: 20,
    demonstrationRate: 0.5,
    contactRate: 0.35,
    varianceMin: 0.9,
    varianceMax: 1.1,
    risk: "Basso",
    potential: "Media",
    requiredMembers: 5,
    requiredSwords: 4,
    wearAdded: 6,
  },
  {
    id: "organized-flyering",
    title: "Volantinaggio organizzato benissimo",
    location: "Centro di Genova",
    description: "Un piano impeccabile sulla carta, con risultati deliberatamente imprevedibili.",
    durationMs: 20_000,
    cost: 40,
    baseAttendance: 12,
    demonstrationRate: 0.25,
    contactRate: 0.25,
    varianceMin: 0.35,
    varianceMax: 2.5,
    risk: "Alto",
    potential: "Bassa",
    requiredMembers: 1,
    requiredSwords: 2,
    wearAdded: 2,
  },
];

export function getAcquisitionEventDefinition(id: AcquisitionEventId) {
  return ACQUISITION_EVENTS.find((event) => event.id === id);
}
