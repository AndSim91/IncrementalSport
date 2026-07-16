import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EMAIL_TEMPLATES } from "../../content/emailTemplates";
import { createInitialState } from "../../game/engine";
import { CampaignEmailContent } from "./CampaignEmailContent";

afterEach(() => cleanup());

describe("CampaignEmailContent", () => {
  it("builds the visual structure before showing any copy", () => {
    const email = createInitialState(1_000, "Andrea Ungaro").emails[0];
    render(<CampaignEmailContent email={email} revealedCharacters={0} />);

    expect(screen.getByRole("img", { name: "Struttura della mail in costruzione" })).toBeVisible();
    expect(screen.queryByText(/BOZZA NON REVISIONATA/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ciao/)).not.toBeInTheDocument();
  });

  it("reveals the initial campaign as plain text after the structure is built", () => {
    const email = createInitialState(1_000, "Andrea Ungaro").emails[0];
    render(<CampaignEmailContent email={email} revealedCharacters={email.body.length} />);

    expect(screen.getByLabelText("Email in formato Bozza disastrata")).toHaveAttribute(
      "data-email-presentation",
      "0",
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the complete flyer with local imagery and inert visual CTAs", () => {
    const initial = createInitialState(1_000, "Andrea Ungaro");
    const levelSevenCopy = EMAIL_TEMPLATES[0].body("Nome", "Andrea Ungaro", 7);
    const email = {
      ...initial.emails[0],
      body: levelSevenCopy,
      presentationLevel: 7 as const,
      revealedCharacters: levelSevenCopy.length,
    };
    render(<CampaignEmailContent email={email} />);

    expect(screen.getByLabelText("Email in formato Volantino digitale")).toHaveAttribute(
      "data-email-presentation",
      "7",
    );
    expect(screen.getByRole("img", { name: "LudoSport Genova" })).toHaveAttribute(
      "src",
      "/email-assets/ludosport-genova.png",
    );
    expect(screen.getByRole("button", { name: /Prenota una prova/ })).toHaveAttribute(
      "aria-label",
      expect.stringContaining("non attivo"),
    );
    expect(screen.getByText("PARLIAMONE")).toBeVisible();
    expect(screen.getByText("DA VEDERE")).toBeVisible();
    expect(screen.queryByText(/Andrea Ungaro · Ordine delle Onde/)).not.toBeInTheDocument();
  });
});
