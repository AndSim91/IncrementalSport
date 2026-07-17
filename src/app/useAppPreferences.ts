import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "../shared/storageKeys";

export function useAppPreferences() {
  const [reduceMotion, setReduceMotion] = useState(
    () => localStorage.getItem(STORAGE_KEYS.reduceMotion) === "true",
  );
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem(STORAGE_KEYS.theme) === "dark",
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.reduceMotion, String(reduceMotion));
  }, [reduceMotion]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, darkMode ? "dark" : "light");
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  return {
    reduceMotion,
    setReduceMotion,
    darkMode,
    setDarkMode,
  };
}
