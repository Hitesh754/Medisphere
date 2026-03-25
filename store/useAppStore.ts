import { create } from "zustand";

interface ScanData {
  Medicine?: string[];
  Dosage?: string[];
}

interface AppState {
  scanResult: ScanData | null;
  setScanResult: (data: ScanData) => void;
}

export const useAppStore = create<AppState>((set) => ({
  scanResult: null,
  setScanResult: (data) => set({ scanResult: data }),
}));