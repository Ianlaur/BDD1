"use client";

import { useSidebar } from "./SidebarContext";
import { useEffect } from "react";

export function SidebarToggle() {
  const { isOpen, toggleSidebar } = useSidebar();

  // Sync sidebar visibility with state
  useEffect(() => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      if (isOpen) {
        sidebar.classList.remove("-translate-x-64");
      } else {
        sidebar.classList.add("-translate-x-64");
      }
    }
  }, [isOpen]);

  return (
    <>
      {/* Toggle Button - Floating style */}
      <button
        className={`fixed top-6 z-50 p-3 rounded-full bg-[#f67a19] hover:bg-[#e56a09] text-white shadow-xl hover:shadow-2xl transition-all duration-300 ${
          isOpen ? "left-[272px]" : "left-6"
        }`}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Overlay for mobile when open */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      />
    </>
  );
}
