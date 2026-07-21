import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TUTORIAL_SCENES } from "../../content/tutorialScenes";
import { createInitialState } from "../../game/initialState";
import { TutorialLayer } from "./TutorialLayer";

describe("TutorialLayer", () => {
  it("keeps the selected region in focus and disables the others", () => {
    const scene = TUTORIAL_SCENES[0];
    const step = scene.steps[0];
    const onSkip = vi.fn();
    const { container } = render(
      <>
        <header className="title-bar">Titolo</header>
        <div className="command-bar">Comandi</div>
        <div className="workspace"><main>Contenuto</main></div>
        <TutorialLayer
          scene={scene}
          step={step}
          stepIndex={0}
          context={{ state: createInitialState(1_000, "Andrea Ungaro"), activeView: "mail" }}
          onContinue={vi.fn()}
          onSkip={onSkip}
        />
      </>,
    );

    const title = container.querySelector<HTMLElement>(".title-bar")!;
    const commands = container.querySelector<HTMLElement>(".command-bar")!;
    const main = container.querySelector<HTMLElement>("main")!;
    expect(title.dataset.tutorialTreatment).toBe("focus");
    expect(title.inert).toBe(false);
    expect(commands.dataset.tutorialTreatment).toBe("muted");
    expect(commands.inert).toBe(true);
    expect(main.dataset.tutorialTreatment).toBe("muted");

    fireEvent.click(screen.getByRole("button", { name: "Salta questa scena" }));
    expect(onSkip).toHaveBeenCalledOnce();
  });
});
