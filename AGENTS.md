# Istruzioni di lavoro del progetto

## Principi architetturali

- Costruire in moduli piccoli e isolati.
- Mantenere ogni componente riutilizzabile.
- Preferire architetture semplici a soluzioni ingegnose ma complesse.
- Evitare componenti, servizi e moduli monolitici ("God components", "God services" e "God modules").
- Progettare fin dall'inizio tenendo conto della scalabilità.
- Considerare sempre la sicurezza e verificare criticamente le soluzioni generate dall'AI.

## Test

- La velocità è la priorità: dopo ogni modifica eseguire solo controlli brevi, mirati e direttamente pertinenti al codice cambiato.
- Non eseguire automaticamente suite complete, test end-to-end, test specifici del gioco, build lunghe o verifiche su flussi non coinvolti da una piccola modifica.
- Per impostazione predefinita, limitarsi al controllo minimo sufficiente: test unitari del modulo interessato, lint del file/area modificata o una verifica manuale essenziale.
- I test approfonditi e i test specifici del flusso di gioco sono eccezioni deliberate: eseguirli solo quando stiamo esplicitamente verificando quel flusso, quando la modifica lo attraversa in modo sostanziale o quando esiste un rischio concreto di regressione.
- Prima di avviare un controllo potenzialmente lungo, valutarne la necessità rispetto all'ampiezza della modifica e comunicarne brevemente il motivo.
- Se un controllo ampio è necessario, eseguire prima i controlli rapidi e non ripetere inutilmente test già superati.
