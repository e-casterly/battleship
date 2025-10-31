import { Toggle, ToggleButton } from "@components/common/Toggle/Toggle.tsx";
import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState("system");
  const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const initial = stored || "system";

    setTheme(initial);
  }, []);

  function handleTheme(value: Theme) {
    if (value === "system") {
      localStorage.removeItem("theme");
    }
    setTheme(value);
  }

  useEffect(() => {
    const handle = (val: MediaQueryListEvent) => {
      const stored = localStorage.getItem("theme") as Theme | null;
      if (stored) return;
      applyTheme(val.matches ? "dark" : "light");
    };
    prefersDarkTheme.addEventListener("change", handle);
    return () => {
      prefersDarkTheme.removeEventListener("change", handle);
    };
  }, [prefersDarkTheme]);

  useEffect(() => {
    if (theme === "light" || theme === "dark") {
      applyTheme(theme);
    } else {
      const systemDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(systemDarkTheme.matches ? "dark" : "light");
    }
    if (theme === "system") return;
    localStorage.setItem("theme", theme);
  }, [theme]);

  function applyTheme(theme: Theme) {
    const root = window.document.documentElement;
    if (root.classList.contains(theme)) return;
    root.classList.remove(theme === "light" ? "dark" : "light");
    root.classList.add(theme);
  }

  return (
    <Toggle
      label="Theme"
      selectedValue={theme}
      onChange={(value) => handleTheme(value as Theme)}
    >
      <ToggleButton value="light">Light</ToggleButton>
      <ToggleButton value="system">System</ToggleButton>
      <ToggleButton value="dark">Dark</ToggleButton>
    </Toggle>
  );
}
