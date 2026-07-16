import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TitleBar } from "./TitleBar";

describe("TitleBar", () => {
  it("shows the month, school year, and progress toward the next month", () => {
    const { rerender } = render(
      <TitleBar
        currentMonth={9}
        nextMonthAt={121_000}
        now={61_000}
        availableContacts={4}
        activeMembers={3}
        euros={120}
      />,
    );

    expect(screen.getByLabelText("Situazione del gioco")).toHaveTextContent("Contatti4Iscritti3Disponibilità120,00 €");
    expect(screen.getByLabelText("Mese corrente: Settembre, anno scolastico 1"))
      .toHaveTextContent("SettembreAnno scolastico 1");
    expect(screen.getByRole("progressbar", {
      name: "Avanzamento di Settembre, anno scolastico 1",
    }))
      .toHaveAttribute("aria-valuenow", "50");

    rerender(
      <TitleBar
        currentMonth={20}
        nextMonthAt={121_000}
        now={1_000}
        availableContacts={0}
        activeMembers={0}
        euros={0}
      />,
    );
    expect(screen.getByLabelText("Mese corrente: Agosto, anno scolastico 1")).toBeVisible();

    rerender(
      <TitleBar
        currentMonth={21}
        nextMonthAt={121_000}
        now={1_000}
        availableContacts={0}
        activeMembers={0}
        euros={0}
      />,
    );
    expect(screen.getByLabelText("Mese corrente: Settembre, anno scolastico 2"))
      .toHaveTextContent("SettembreAnno scolastico 2");
  });
});
