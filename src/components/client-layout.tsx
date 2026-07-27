'use client';

import { SettingsProvider } from "@/lib/settings-store";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}
