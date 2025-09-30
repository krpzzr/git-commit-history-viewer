"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  // Start as null to avoid writing to localStorage before we read it
  const [theme, setTheme] = useState<Theme | null>(null);

  // Initialize from localStorage (or system if not set)
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("theme-preference");
      const valid = saved === "light" || saved === "dark" ? (saved as Theme) : null;
      const initial: Theme = valid ?? getSystemTheme();
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
      document.documentElement.classList.toggle("dark", initial === "dark");
    } catch {
      const fallback = getSystemTheme();
      setTheme(fallback);
      document.documentElement.setAttribute("data-theme", fallback);
      document.documentElement.classList.toggle("dark", fallback === "dark");
    }
  }, []);

  // Reflect theme to DOM and persist (only after init)
  useEffect(() => {
    if (theme == null) return;
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    try { window.localStorage.setItem("theme-preference", theme); } catch {}
  }, [theme]);

  if (theme == null) return null; // prevent hydration mismatch

  const toggle = () => setTheme(prev => (prev === "light" ? "dark" : "light"));

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-black/[.08] dark:border-white/[.145] text-sm hover:bg-black/[.02] dark:hover:bg-white/[.06] hover:cursor-pointer"
    >
      {theme === "dark" ? (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
          </svg>
          Dark
        </>
      ) : (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 6.95l-1.41-1.41M6.46 6.46L5.05 5.05m12.9 0l-1.41 1.41M6.46 17.54l-1.41 1.41" />
          </svg>
          Light
        </>
      )}
    </button>
  );
}
