"use client";

import { useState } from "react";

export function SidebarToggle() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    const sidebar = document.getElementById("sidebar");
    const content = document.getElementById("main-content");
    
    if (sidebar && content) {
      sidebar.classList.toggle("-translate-x-64");
      content.classList.toggle("md:ml-64");
      content.classList.toggle("md:ml-0");
    }
  };

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
