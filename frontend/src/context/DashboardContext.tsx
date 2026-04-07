"use client";

import React, { createContext, useContext, useRef } from "react";

interface DashboardContextType {
  triggerUpload: () => void;
  setUploadTrigger: (fn: () => void) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const uploadTriggerRef = useRef<(() => void) | null>(null);

  const triggerUpload = () => {
    if (uploadTriggerRef.current) {
      uploadTriggerRef.current();
    }
  };

  const setUploadTrigger = (fn: () => void) => {
    uploadTriggerRef.current = fn;
  };

  return (
    <DashboardContext.Provider value={{ triggerUpload, setUploadTrigger }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
