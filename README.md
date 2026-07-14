# Oggetto: Nuovi Iscritti

Prototipo browser del loop principale descritto nel [Game Design Document](./GAME_DESIGN_DOCUMENT.md).

## Avvio

```bash
npm install
npm run dev
```

## Verifica

```bash
npm test
npm run lint
npm run build
```

Il gioco non invia email e non accede a servizi esterni: destinatari, messaggi e progressi sono simulati e salvati esclusivamente in `localStorage`.

## Funzioni disponibili

- composizione incrementale e invio automatico delle campagne;
- Posta in arrivo con stato letto/non letto;
- Posta inviata cliccabile con stato del funnel;
- shop Miglioramenti con entrate previste al minuto;
- Eventi con sparring gratuito e dimostrazione programmata;
- conversione contatto → prova → iscritto → quote;
- salvataggi locali versionati e migrazione dello schema.
