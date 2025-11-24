'use client';

import { ReactNode } from 'react';
import { SidebarProvider } from './SidebarContext';

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  );
}
