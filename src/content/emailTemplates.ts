export interface EmailTemplate {
  id: string;
  subject: string;
  body: (firstName: string) => string;
}

const signature = `

Un saluto,
Segreteria — Ordine delle Onde
LudoSport Genova`;

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "prima-prova",
    subject: "Una lezione di prova con l'Ordine delle Onde",
    body: (name) =>
      `Ciao ${name},\n\ngrazie per l'interesse dimostrato durante il nostro incontro. Ti invitiamo a una lezione di prova gratuita: abbigliamento comodo, curiosità e voglia di mettersi in gioco sono tutto ciò che serve.\n\nTi comunicheremo giorno e orario appena avremo la tua conferma.${signature}`,
  },
  {
    id: "disciplina-originale",
    subject: "Scopri una disciplina sportiva originale a Genova",
    body: (name) =>
      `Buongiorno ${name},\n\nall'Ordine delle Onde alleniamo tecnica, controllo e collaborazione attraverso una disciplina sportiva fuori dall'ordinario. La prima lezione è pensata per chi non ha mai impugnato una spada.\n\nSe l'idea ti incuriosisce, saremo felici di accoglierti in palestra.${signature}`,
  },
  {
    id: "lunedi-luminoso",
    subject: "Un modo diverso di vivere il lunedì sera",
    body: (name) =>
      `Ciao ${name},\n\nci sono lunedì che finiscono sul divano e lunedì in cui si impara a muoversi con una spada luminosa. Noi preferiamo decisamente i secondi.\n\nVieni a conoscere il gruppo con una lezione di prova gratuita e senza impegno.${signature}`,
  },
  {
    id: "coordinazione",
    subject: "Tecnica, coordinazione e una prova gratuita",
    body: (name) =>
      `Buongiorno ${name},\n\nla nostra attività combina coordinazione, precisione e rispetto dell'avversario in un allenamento accessibile anche a chi parte da zero.\n\nVorremmo invitarti a vedere dal vivo come si svolge una lezione dell'Ordine delle Onde.${signature}`,
  },
  {
    id: "gruppo-genova",
    subject: "Conosci il nostro gruppo di Genova",
    body: (name) =>
      `Ciao ${name},\n\nsiamo un gruppo di persone molto diverse, unite dal piacere di allenarsi e imparare insieme. La tecnica conta, ma il primo passo è semplicemente entrare in palestra.\n\nPer questo ti riserviamo volentieri un posto alla prossima prova.${signature}`,
  },
  {
    id: "curiosita",
    subject: "La curiosità è già un ottimo inizio",
    body: (name) =>
      `Buongiorno ${name},\n\nnon serve esperienza e non occorre portare attrezzatura. Per la prima lezione bastano abiti comodi; alle spade e alle spiegazioni pensiamo noi.\n\nSe vuoi scoprire una nuova disciplina, riserva la tua prova gratuita.${signature}`,
  },
  {
    id: "dopo-evento",
    subject: "Grazie per essere passato a trovarci",
    body: (name) =>
      `Ciao ${name},\n\nè stato un piacere incontrarti e raccontarti qualcosa della nostra scuola. Vedere una dimostrazione è interessante, ma provare in prima persona è tutta un'altra storia.\n\nTi aspettiamo per una lezione introduttiva gratuita.${signature}`,
  },
  {
    id: "prima-volta",
    subject: "La prima volta si comincia dalle basi",
    body: (name) =>
      `Buongiorno ${name},\n\nla lezione di prova è costruita apposta per chi comincia: sicurezza, movimenti fondamentali e qualche esercizio con il gruppo. Nessuna preparazione atletica specifica è richiesta.\n\nPossiamo tenerti un posto al prossimo appuntamento.${signature}`,
  },
  {
    id: "divano",
    subject: "Una proposta che il tuo divano non approverà",
    body: (name) =>
      `Ciao ${name},\n\nil tuo divano sostiene che questa settimana non sia il momento giusto per provare qualcosa di nuovo. Noi, con grande rispetto, non siamo d'accordo.\n\nVieni a conoscere l'Ordine delle Onde con una prova gratuita.${signature}`,
  },
  {
    id: "invito-aperto",
    subject: "Il tuo invito all'Ordine delle Onde",
    body: (name) =>
      `Buongiorno ${name},\n\nla porta della palestra è aperta a chi vuole allenare concentrazione, presenza e controllo in un ambiente accogliente. Il percorso inizia con una singola lezione di prova.\n\nSaremo felici di organizzare la tua visita.${signature}`,
  },
];
