# Progetto operativo: preliminari del Torneo Scolastico

## Obiettivo

Quando la scuola possiede più di 64 atleti idonei, il Torneo Scolastico non deve
più usare i primi 64 contatti nell'ordine del roster. Una fase preliminare
aggregata seleziona i 64 partecipanti effettivi usando le stesse statistiche
Arena e Stile che alimentano il torneo.

La fase deve restare veloce anche con migliaia di iscritti e non deve simulare
incontri aggiuntivi. Il costo computazionale atteso è `O(n log n)` per le due
graduatorie.

## Regole confermate

1. Rimangono idonei soltanto gli iscritti che hanno completato Forma 1.
2. Fino a 64 idonei partecipano tutti e le preliminari non vengono registrate.
3. Oltre 64 idonei vengono create due graduatorie aggregate:
   - i migliori 32 per Arena entrano nel torneo;
   - i migliori per Stile non già selezionati completano il gruppo fino a 64.
4. La graduatoria usa i valori effettivi Arena e Stile, comprensivi di tutti i
   modificatori permanenti già acquisiti dall'atleta.
5. A parità della statistica principale prevale la statistica secondaria; a
   ulteriore parità rimane prioritario l'ordine stabile del roster.
6. Le preliminari non aggiungono casualità. Condizione e variabilità degli
   assalti continuano a essere calcolate soltanto nel torneo effettivo.
7. I 64 selezionati vengono poi mescolati e simulati con le regole ordinarie del
   Torneo Scolastico.

## Statistiche autorevoli

Una sola funzione del dominio deve comporre:

- valore base Arena e Stile;
- incrementi permanenti già registrati sul valore base, inclusi preparazione
  atletica e Corso Agonisti;
- moltiplicatore delle Forme numeriche completate;
- moltiplicatore dell'esperienza nei tornei;
- futuri modificatori globali della scuola o dei potenziamenti.

Liste degli iscritti, ordinamenti, schermata Tornei, preliminari e simulazione
non devono ricostruire autonomamente questa formula.

## Dati persistiti

Il risultato del Torneo Scolastico registra opzionalmente:

- numero totale di idonei;
- identificativi dei 64 selezionati;
- identificativi selezionati dalla graduatoria Arena;
- identificativi selezionati dalla graduatoria Stile.

Il campo è opzionale: i salvataggi precedenti restano validi senza migrazione e
i risultati storici già esistenti continuano a essere visualizzati normalmente.

## Presentazione

Prima del torneo la panoramica mostra:

`64 convocati su 1.500 idonei · preliminari aggregate`

Nel risultato storico mostra sia i 64 partecipanti effettivi sia il numero di
atleti valutati nelle preliminari.

## Invarianti da verificare

- con 64 idonei non esiste un risultato preliminare;
- con più di 64 idonei i partecipanti sono esattamente 64 e tutti distinti;
- le selezioni Arena e Stile contengono 32 atleti distinti ciascuna;
- modificare Forma, esperienza o un incremento permanente può cambiare la
  qualificazione preliminare;
- a parità completa la selezione è deterministica;
- il numero di incontri del torneo rimane limitato come prima.

## Fuori ambito di questa fase

- aumento da 6 a 12 qualificati in base ai Leggendari Segreti;
- usura delle spade durante i corsi;
- trasformazione di Redazione in Social;
- settori, preset e mini-gioco Gadget.

Questi sistemi possono usare le statistiche e i dati preliminari introdotti qui,
ma richiedono decisioni di design separate.
