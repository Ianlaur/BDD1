"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [hasSidebar, setHasSidebar] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem("sidebarOpen");
    const initialState = savedState !== null ? savedState === "true" : true;
    setIsOpen(initialState);

    // Check if sidebar exists in the DOM
    const checkSidebar = () => {
      const sidebar = document.getElementById("sidebar");
      setHasSidebar(!!sidebar);
    };

    // Initial check
    checkSidebar();

    // Watch for sidebar being added/removed
    const observer = new MutationObserver(checkSidebar);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem("sidebarOpen", String(newState));
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div>{children}</div>;
  }

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      <div
        id="main-content"
        className={`min-h-screen transition-all duration-300 ${
          hasSidebar && isOpen ? "md:ml-64" : "md:ml-0"
        }`}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
