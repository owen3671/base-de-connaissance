"use client";

import type { ReactNode } from "react";
import { AppProvider } from "@/components/providers/app-provider";
import { PwaProvider } from "@/components/providers/pwa-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <PwaProvider />
      {children}
    </AppProvider>
  );
}
