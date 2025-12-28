// src/components/ThemeToggle.jsx

"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setMounted(true);

    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = saved ?? (prefersDark ? "dark" : "light");

    applyTheme(initialTheme);
    setTheme(initialTheme);
  }, []);

  const applyTheme = (mode) => {
    const root = document.documentElement;

    // CSS variables
    root.setAttribute("data-theme", mode);

    // Tailwind dark: utilities
    root.classList.toggle("dark", mode === "dark");
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-700 bg-gray-900/60 hover:bg-gray-800 transition"
    >
      {theme === "dark" ? (
        <>
          <Sun size={18} className="text-yellow-400" />
          <span className="text-sm text-gray-300">Light</span>
        </>
      ) : (
        <>
          <Moon size={18} className="text-blue-400" />
          <span className="text-sm text-gray-300">Dark</span>
        </>
      )}
    </button>
  );
}
