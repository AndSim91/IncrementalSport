import { nextRandom } from "../game/random";

/**
 * Rubrica usata per creare i possibili iscritti.
 *
 * Nomi e cognomi sono volutamente separati: ogni nuovo contatto estrae in modo
 * indipendente un elemento da ciascun elenco e poi un provider email.
 */
export const PROSPECT_FIRST_NAMES = [
  "Alessia",
  "Andrea",
  "Beatrice",
  "Chiara",
  "Davide",
  "Elena",
  "Federica",
  "Francesca",
  "Gabriele",
  "Giulia",
  "Ilaria",
  "Lorenzo",
  "Luca",
  "Marco",
  "Martina",
  "Matteo",
  "Niccolò",
  "Pietro",
  "Sara",
  "Simone",
  "Tommaso",
  "Valentina",
  "Mauro",
  "Fausto",
  "Luca",
  "Ferdinando",
  "Laura Maria",
  "Mariangiangiangelo",
  "Gianluigi",
  "Pier Ferdinando",
  "Silvio",
  "Piersilvio",
  "Attila",
] as const;

export const PROSPECT_LAST_NAMES = [
  "Altone",
  "Bruzzone",
  "Burlando",
  "Calcagno",
  "Carretto",
  "Caviglia",
  "Costa",
  "Ferroso",
  "Ciglione",
  "Parodi",
  "Polpaccio",
  "Gastrite",
  "Salis",
  "Repetto",
  "Piciocchi",
  "Sanguinolento",
  "Polaretto",
  "Maggi",
  "Todaro",
  "Carogna"
] as const;

export const PROSPECT_EMAIL_PROVIDERS = [
  "cmail.com",
  "hotlook.it",
  "yabadabadoo.it",
  "gspot.com",
  "postacenere.it"
] as const;

export interface ProspectIdentity {
  firstName: string;
  lastName: string;
  email: string;
}

function pickRandom<T>(values: readonly T[], roll: number): T {
  return values[Math.min(values.length - 1, Math.floor(roll * values.length))];
}

export function normalizeEmailLocalPart(firstName: string, lastName: string): string {
  return `${firstName}.${lastName}`
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, ".")
    .toLocaleLowerCase("it-IT");
}

export function createProspectEmail(localPart: string, seed: number): string {
  const [providerRoll] = nextRandom(seed);
  return `${localPart}@${pickRandom(PROSPECT_EMAIL_PROVIDERS, providerRoll)}`;
}

export function createRandomProspect(
  seed: number,
  fixedIdentity?: Pick<ProspectIdentity, "firstName" | "lastName">,
): ProspectIdentity {
  const [firstNameRoll, afterFirstName] = nextRandom(seed);
  const [lastNameRoll, afterLastName] = nextRandom(afterFirstName);
  const [providerRoll] = nextRandom(afterLastName);
  const firstName = fixedIdentity?.firstName ?? pickRandom(PROSPECT_FIRST_NAMES, firstNameRoll);
  const lastName = fixedIdentity?.lastName ?? pickRandom(PROSPECT_LAST_NAMES, lastNameRoll);
  const provider = pickRandom(PROSPECT_EMAIL_PROVIDERS, providerRoll);

  return {
    firstName,
    lastName,
    email: `${normalizeEmailLocalPart(firstName, lastName)}@${provider}`,
  };
}
