"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  const applyTheme = (targetTheme: "light" | "dark") => {
    setTheme(targetTheme);
    localStorage.setItem("hireflow-theme", targetTheme);

    if (targetTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
  };

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("hireflow-theme");
    const isDark =
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);

    applyTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-md border border-outline-variant bg-surface-container-lowest" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={
        theme === "light"
          ? "Light theme active. Click to switch to dark theme"
          : "Dark theme active. Click to switch to light theme"
      }
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container hover:text-primary transition-colors shadow-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
    >
      {theme === "light" ? (
        <Sun className="h-4 w-4 text-amber-600" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 text-slate-400 hover:text-primary" aria-hidden="true" />
      )}
    </button>
  );
}
