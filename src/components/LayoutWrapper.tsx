"use client";

import { useEffect, useState } from "react";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [hasSidebar, setHasSidebar] = useState(false);

  useEffect(() => {
    // Check if sidebar exists in the DOM
    const sidebar = document.getElementById("sidebar");
    setHasSidebar(!!sidebar);

    // Watch for changes (in case sidebar gets added/removed dynamically)
    const observer = new MutationObserver(() => {
      const sidebar = document.getElementById("sidebar");
      setHasSidebar(!!sidebar);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        hasSidebar ? "md:ml-64" : ""
      }`}
    >
      {children}
    </div>
  );
}
