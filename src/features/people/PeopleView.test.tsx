import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createInitialState } from "../../game/engine";
import { PeopleView } from "./PeopleView";

afterEach(() => cleanup());

describe("PeopleView", () => {
  it("keeps advanced roster concepts hidden for the first member", () => {
    const initial = createInitialState(1_000);
    const enrolled = { ...initial.contacts[0], status: "enrolled" as const };
    render(<PeopleView state={{ ...initial, school: { ...initial.school, activeMembers: 1, historicMembers: 1 }, contacts: initial.contacts.map((contact) => contact.id === enrolled.id ? enrolled : contact), unlocks: { ...initial.unlocks, forms: true } }} onAssign={() => undefined} onStartTraining={() => undefined} />);

    expect(screen.queryByRole("tab", { name: /Collaboratori/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Sistema di rarità" })).not.toBeInTheDocument();
  });

  it("shows collaborators and changes their single assignment", () => {
    const initial = createInitialState(1_000);
    const state = {
      ...initial,
      collaborators: [
        {
          id: "collaborator-1",
          contactId: initial.contacts[0].id,
          displayName: "Andrea Simonazzi",
          joinedAt: 1_000,
          forms: ["form-1" as const, "course-x" as const, "form-2" as const, "course-y" as const],
          instructorForms: [],
          assignment: null,
          rarity: "legendary" as const,
          specialProfileId: "andrea-simonazzi" as const,
        },
      ],
      unlocks: { ...initial.unlocks, collaborators: true },
    };
    const onAssign = vi.fn();
    render(<PeopleView state={state} onAssign={onAssign} onStartTraining={() => undefined} />);

    expect(screen.getByRole("heading", { name: "Iscritti" })).toBeVisible();
    expect(screen.queryByRole("tab", { name: /Potenziali interessati/ })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Sistema di rarità" })).toHaveTextContent(
      "Email lasciata: 70%",
    );
    expect(screen.getByRole("region", { name: "Sistema di rarità" })).toHaveTextContent(
      "Comparsa: 5% dalla 10ª email",
    );
    expect(screen.getByRole("region", { name: "Sistema di rarità" })).toHaveTextContent(
      "RaroComparsa: 10% dei contatti non leggendari",
    );
    fireEvent.click(screen.getByRole("tab", { name: /Collaboratori/ }));
    expect(screen.getByText("Andrea Simonazzi")).toHaveClass("rarity-legendary");
    expect(screen.getByText("VIP")).toBeVisible();
    expect(screen.getByRole("img", { name: /Forma 1 — emblema ufficiale/ })).toBeVisible();
    expect(screen.getByRole("img", { name: /Corso X — emblema generato/ })).toBeVisible();
    expect(screen.getByRole("img", { name: /Corso Y — emblema ufficiale/ })).toBeVisible();
    expect(screen.queryByText("Tutorial")).not.toBeInTheDocument();
    expect(screen.getByText(/Livello Leggendario/)).toBeVisible();
    expect(screen.getByText(/Potere VIP ×2/)).toBeVisible();
    fireEvent.change(screen.getByRole("combobox", { name: "Assegnazione" }), {
      target: { value: "writing" },
    });

    expect(onAssign).toHaveBeenCalledWith("collaborator-1", "writing");
  });

  it("shows enrolled members in the automatic teaching queue", () => {
    const initial = createInitialState(1_000);
    const enrolled = { ...initial.contacts[0], status: "enrolled" as const };
    const displayName = `${enrolled.firstName} ${enrolled.lastName}`;
    const instructor = {
      id: "instructor-form-1",
      contactId: initial.contacts[1].id,
      displayName: "Istruttore Forma 1",
      joinedAt: 1_000,
      forms: ["form-1" as const],
      instructorForms: ["form-1" as const],
      assignment: "instructor" as const,
      rarity: "legendary" as const,
    };
    render(<PeopleView state={{ ...initial, school: { ...initial.school, activeMembers: 1, euros: 20 }, contacts: initial.contacts.map((contact) => contact.id === enrolled.id ? enrolled : contact), collaborators: [instructor], unlocks: { ...initial.unlocks, forms: true } }} onAssign={() => undefined} onStartTraining={() => undefined} />);

    fireEvent.click(screen.getByRole("tab", { name: /Iscritti/ }));
    expect(screen.getByText("Rischio annuo se ignorato: 80%")).toBeVisible();
    expect(screen.getByText("Coda didattica automatica")).toBeVisible();
    expect(screen.getByText("In attesa di un Istruttore compatibile e dei fondi")).toBeVisible();
    expect(screen.queryByRole("combobox", { name: `Formazione per ${displayName}` })).not.toBeInTheDocument();
  });

  it("shows the summer break instead of allowing Form training in July", () => {
    const initial = createInitialState(1_000);
    const enrolled = { ...initial.contacts[0], status: "enrolled" as const };
    render(<PeopleView
      state={{
        ...initial,
        school: { ...initial.school, activeMembers: 1, currentMonth: 7 },
        contacts: initial.contacts.map((contact) => contact.id === enrolled.id ? enrolled : contact),
        unlocks: { ...initial.unlocks, forms: true },
      }}
      onAssign={() => undefined}
      onStartTraining={() => undefined}
    />);

    expect(screen.getByText("Coda didattica automatica")).toBeVisible();
    expect(screen.getByText("In pausa fino a settembre")).toBeVisible();
    expect(screen.queryByRole("combobox", { name: /Formazione per/ })).not.toBeInTheDocument();
  });
});
