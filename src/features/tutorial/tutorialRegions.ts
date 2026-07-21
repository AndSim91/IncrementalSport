import {
  TUTORIAL_REGION_IDS,
  type TutorialRegionId,
} from "../../content/tutorialScenes";

const REGION_SELECTORS: Record<TutorialRegionId, string> = {
  title: ".title-bar",
  commands: ".command-bar",
  navigation: ".app-rail",
  folders: ".folder-pane",
  messages: ".message-list",
  main: ".workspace > main",
  "day-panel": ".day-panel",
  status: ".status-bar",
};

export type TutorialTreatment = "focus" | "muted" | "hidden";

export function applyTutorialTreatments(
  focusRegionIds: readonly TutorialRegionId[],
  hiddenRegionIds: readonly TutorialRegionId[],
): () => void {
  const focused = new Set(focusRegionIds);
  const hidden = new Set(hiddenRegionIds);
  const previousState = new Map<HTMLElement, { treatment?: string; inert: boolean }>();

  for (const regionId of TUTORIAL_REGION_IDS) {
    const treatment: TutorialTreatment = hidden.has(regionId)
      ? "hidden"
      : focused.has(regionId) ? "focus" : "muted";
    for (const element of document.querySelectorAll<HTMLElement>(REGION_SELECTORS[regionId])) {
      if (!previousState.has(element)) {
        previousState.set(element, {
          treatment: element.dataset.tutorialTreatment,
          inert: element.inert,
        });
      }
      element.dataset.tutorialTreatment = treatment;
      element.inert = treatment !== "focus";
    }
  }

  return () => {
    for (const [element, previous] of previousState) {
      if (previous.treatment === undefined) {
        delete element.dataset.tutorialTreatment;
      } else {
        element.dataset.tutorialTreatment = previous.treatment;
      }
      element.inert = previous.inert;
    }
  };
}
