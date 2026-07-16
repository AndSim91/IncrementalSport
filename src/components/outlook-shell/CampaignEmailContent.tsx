import type { MouseEvent } from "react";
import { EMAIL_PRESENTATION_LEVELS } from "../../content/emailPresentation";
import type { CampaignEmail } from "../../game/types";

const ORDER_EMAIL = "genova@ludosport.net";

interface TextSection {
  text: string;
  start: number;
}

function getTextSections(body: string): TextSection[] {
  let searchFrom = 0;
  return body.split("\n\n").map((text) => {
    const start = body.indexOf(text, searchFrom);
    searchFrom = start + text.length;
    return { text, start };
  });
}

function RevealedText({
  section,
  revealedCharacters,
  showCaret,
}: {
  section: TextSection;
  revealedCharacters: number;
  showCaret: boolean;
}) {
  const visibleCount = Math.max(
    0,
    Math.min(section.text.length, revealedCharacters - section.start),
  );
  const visible = section.text.slice(0, visibleCount);
  const caretIsHere =
    showCaret &&
    revealedCharacters >= section.start &&
    revealedCharacters < section.start + section.text.length;

  if (!visible && !caretIsHere) return null;

  return (
    <>
      <span>{visible}</span>
      {caretIsHere ? <i className="text-caret" /> : null}
    </>
  );
}

function EmailCopy({
  body,
  revealedCharacters,
  showCaret,
}: {
  body: string;
  revealedCharacters: number;
  showCaret: boolean;
}) {
  const sections = getTextSections(body);
  const greetingIndex = sections.length > 0 ? 0 : -1;
  const signatureIndex = sections.findIndex((section) => section.text.includes("Un saluto"));

  return (
    <div className="campaign-copy">
      {sections.map((section, index) => {
        const className = index === greetingIndex
          ? "campaign-greeting"
          : index === signatureIndex
            ? "campaign-signature"
            : undefined;
        return (
          <p key={section.start} className={className}>
            <RevealedText
              section={section}
              revealedCharacters={revealedCharacters}
              showCaret={showCaret}
            />
          </p>
        );
      })}
    </div>
  );
}

function stopComposerWrite(event: MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
  event.stopPropagation();
}

function FakeCta({
  children,
  variant = "primary",
}: {
  children: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      className={`campaign-fake-cta campaign-fake-cta-${variant}`}
      aria-label={`${children} (pulsante dimostrativo, non attivo)`}
      onClick={stopComposerWrite}
    >
      {children}
    </button>
  );
}

function BuildProgress({
  level,
  progress,
}: {
  level: CampaignEmail["presentationLevel"];
  progress: number;
}) {
  const format = EMAIL_PRESENTATION_LEVELS[level];
  return (
    <div className="campaign-build-progress" aria-label={`Costruzione email ${progress}%`}>
      <div className="campaign-build-progress-heading">
        <span>Costruzione email</span>
        <strong>Livello {level} · {format.label}</strong>
        <b>{progress}%</b>
      </div>
      <div className="campaign-build-progress-track" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function BuildPlaceholder({
  level,
  progress,
}: {
  level: CampaignEmail["presentationLevel"];
  progress: number;
}) {
  const message = progress === 0
    ? "Fai clic nel foglio o premi un tasto per iniziare a costruire."
    : `La mail sta prendendo forma: ${progress}% completato.`;
  return (
    <div className="campaign-blank-state">
      <span className="campaign-blank-cross" aria-hidden="true">＋</span>
      <strong>Foglio bianco · Livello {level}</strong>
      <p>{message}</p>
      <small>Ogni input aggiunge un frammento alla campagna.</small>
    </div>
  );
}

function FormAndWeaponPanel() {
  return (
    <section className="campaign-forms-panel">
      <div className="campaign-panel-heading">
        <span>IL PERCORSO</span>
        <strong>Tre armi, sette Forme</strong>
      </div>
      <div className="campaign-weapon-row">
        <span className="campaign-weapon-icon">Ⅰ</span>
        <div><strong>Lama singola</strong><small>Il punto di partenza più intuitivo.</small></div>
      </div>
      <div className="campaign-weapon-row">
        <span className="campaign-weapon-icon">Ⅱ</span>
        <div><strong>Doppia lama</strong><small>Continuità, ritmo e coordinazione.</small></div>
      </div>
      <div className="campaign-weapon-row">
        <span className="campaign-weapon-icon">Ⅲ</span>
        <div><strong>Staffa</strong><small>Spazio, traiettorie e presenza.</small></div>
      </div>
      <div className="campaign-form-ribbon">
        <b>FORME 01—07</b>
        <span>Difesa · velocità · fluidità · distanza</span>
      </div>
    </section>
  );
}

function ContactPanel() {
  return (
    <section className="campaign-contact-card">
      <div className="campaign-panel-heading">
        <span>PARLIAMONE</span>
        <strong>La curiosità merita una risposta</strong>
      </div>
      <p>Scrivici anche solo per fare una domanda. Ti aiutiamo a scegliere la prima lezione senza trasformare la curiosità in un modulo da 18 pagine.</p>
      <div className="campaign-contact-list">
        <span>{ORDER_EMAIL}</span>
        <span>@ludosport.onde</span>
        <span>320 0809640 · Andrea Ungaro</span>
      </div>
    </section>
  );
}

function VideoPanel() {
  return (
    <section className="campaign-video-card">
      <div className="campaign-panel-heading">
        <span>DA VEDERE</span>
        <strong>Il movimento, prima delle parole</strong>
      </div>
      <button type="button" className="campaign-video-button" onClick={stopComposerWrite} aria-label="Video dimostrativo non attivo">
        <span className="campaign-video-frame">
          <img src="/email-assets/video-demo.jpg" alt="Finale del Torneo Nazionale LudoSport 2022" />
          <i aria-hidden="true">▶</i>
        </span>
        <small>Finale del Torneo Nazionale LudoSport 2022 · anteprima visiva</small>
      </button>
    </section>
  );
}

export function CampaignEmailContent({
  email,
  revealedCharacters = email.body.length,
  showCaret = false,
}: {
  email: CampaignEmail;
  revealedCharacters?: number;
  showCaret?: boolean;
}) {
  const level = email.presentationLevel;
  const format = EMAIL_PRESENTATION_LEVELS[level];
  const progress = email.body.length === 0
    ? 0
    : Math.round((revealedCharacters / email.body.length) * 100);
  const hasStarted = revealedCharacters > 0;
  const signatureStart = email.body.indexOf("Un saluto");
  const signatureVisible = level >= 2 && signatureStart >= 0 && revealedCharacters >= signatureStart;
  const ctaVisible = level >= 3 && progress >= 68;
  const formsVisible = level >= 4 && progress >= 42;
  const heroVisible = level >= 6 && progress >= 12;
  const detailsVisible = level >= 6 && progress >= 82;

  if (level <= 1) {
    const visible = email.body.slice(0, revealedCharacters);
    return (
      <div
        className={`typed-copy typed-copy-level-${level}`}
        aria-label={`Email in formato ${format.label}`}
        data-email-presentation={level}
      >
        <div className="typed-copy-kicker">{level === 0 ? "BOZZA NON REVISIONATA" : "TESTO REVISIONATO"}</div>
        <span>{visible}</span>
        {showCaret ? <i className="text-caret" /> : null}
      </div>
    );
  }

  return (
    <div
      className={`campaign-email-document campaign-email-level-${level}`}
      aria-label={`Email in formato ${format.label}`}
      data-email-presentation={level}
    >
      <BuildProgress level={level} progress={Math.max(0, Math.min(100, progress))} />

      {!hasStarted ? <BuildPlaceholder level={level} progress={progress} /> : null}

      {hasStarted ? (
        <>
          <header className="campaign-title">
            <div className="campaign-title-rule" aria-hidden="true" />
            {level >= 6 ? <span>ORDINE DELLE ONDE · GENOVA</span> : null}
            <h1>{email.subject}</h1>
            {level >= 5 ? <p>Una disciplina che si impara muovendosi.</p> : null}
          </header>

          {heroVisible ? (
            <div className="campaign-hero-wrap">
              <img
                className="campaign-hero-image"
                src="/email-assets/lezione-prova.jpg"
                alt="Lezione di Light Saber Combat dell'Ordine delle Onde"
              />
              <div className="campaign-hero-caption"><span>LIGHT SABER COMBAT</span><strong>La tecnica accende la curiosità.</strong></div>
            </div>
          ) : null}

          <section className="campaign-card campaign-main-card">
            {level >= 6 ? <strong className="campaign-section-label">UNISCITI A UNA LEZIONE DI LIGHT SABER COMBAT</strong> : null}
            <EmailCopy
              body={email.body}
              revealedCharacters={revealedCharacters}
              showCaret={showCaret}
            />

            {signatureVisible ? (
              <div className="campaign-order-signature">
                <img src="/email-assets/ordine-onde.png" alt="Ordine delle Onde" />
                <span>Ordine delle Onde · LudoSport Genova</span>
              </div>
            ) : null}

            {ctaVisible ? (
              <div className="campaign-actions">
                <FakeCta>Prenota una prova</FakeCta>
                <FakeCta variant="secondary">Scopri le forme</FakeCta>
              </div>
            ) : null}
          </section>

          {formsVisible ? <FormAndWeaponPanel /> : null}

          {detailsVisible ? (
            <dl className="campaign-details">
              <div><dt>QUANDO</dt><dd>Alla prossima lezione disponibile</dd></div>
              <div><dt>DURATA</dt><dd>Due ore di movimento, dalle 20:30 alle 22:45</dd></div>
              <div><dt>DOVE</dt><dd>PalaGym Assarotti, Genova</dd></div>
              <div><dt>COSA PORTARE</dt><dd>Abiti comodi, scarpe da palestra e curiosità.</dd></div>
            </dl>
          ) : null}

          {level >= 6 && progress >= 74 ? <ContactPanel /> : null}
          {level >= 7 && progress >= 88 ? <VideoPanel /> : null}

          {level >= 6 && progress >= 96 ? (
            <footer className="campaign-footer">
              <img src="/email-assets/ludosport-genova.png" alt="LudoSport Genova" />
              <p>Ricevi questo messaggio perché hai mostrato curiosità per i corsi LudoSport a Genova. Questa è una campagna simulata all'interno del gioco.</p>
            </footer>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
