'use client';

import { ReactNode } from 'react';
import { SidebarToggle } from './MobileMenuButton';

export function SidebarWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <SidebarToggle />
      {children}
    </>
  );
}
