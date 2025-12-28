// src/app/dashboard/layout.jsx

"use client";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-end px-6 border-b border-gray-200 dark:border-gray-800">
          <ThemeToggle />
        </header>

        {/* Page Content */}
        <motion.div
          className="flex-1 p-6 overflow-y-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
