import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createInitialState } from "../../game/engine";
import { FolderPane } from "./FolderPane";
import { formatExactCurrency } from "./resourceFormatting";

describe("FolderPane", () => {
  it("compacts every sidebar counter and keeps the full balance available on hover", () => {
    const initial = createInitialState(1_000);
    const euros = 99_999_999_088;
    const availableContact = initial.contacts.find((contact) => contact.status === "available");
    const state = {
      ...initial,
      contacts: Array.from({ length: 1_200 }, (_, index) => ({
        ...availableContact!,
        id: `contact-${index}`,
      })),
      school: { ...initial.school, activeMembers: 999_999, euros },
    };

    const { container } = render(<FolderPane state={state} folder="inbox" onSelectFolder={() => undefined} />);
    const rows = container.querySelectorAll(".resource-row");

    expect(rows[0]).toHaveTextContent(/1,2K/);
    expect(rows[1]).toHaveTextContent(/1\s+Mln/);
    expect(rows[2]).toHaveTextContent(/100\s+Mld\s+€/);
    expect(container.querySelector(`b[title="${formatExactCurrency(euros)}"]`)).toHaveTextContent(
      /100\s+Mld\s+€/,
    );
  });
});
