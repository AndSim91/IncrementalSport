import type { AcquisitionEvent } from "../game/types";

export interface AcquisitionEventDefinition {
  id: AcquisitionEvent["definitionId"];
  title: string;
  location: string;
  description: string;
  durationMs: number;
  cost: number;
  contactReward: number;
  availability: string;
}

export const ACQUISITION_EVENTS: AcquisitionEventDefinition[] = [
  {
    id: "park-sparring",
    title: "Sparring al parco",
    location: "Parco di Villa Croce",
    description: "Una sessione informale e gratuita per incontrare poche persone interessate.",
    durationMs: 15_000,
    cost: 0,
    contactReward: 2,
    availability: "Sempre disponibile",
  },
  {
    id: "public-demo",
    title: "Dimostrazione pubblica",
    location: "Piazza De Ferrari",
    description: "Un appuntamento programmato con maggiore affluenza e materiale organizzativo.",
    durationMs: 45_000,
    cost: 15,
    contactReward: 5,
    availability: "Programmato per oggi",
  },
];

export function getAcquisitionEventDefinition(id: AcquisitionEvent["definitionId"]) {
  return ACQUISITION_EVENTS.find((event) => event.id === id);
}
