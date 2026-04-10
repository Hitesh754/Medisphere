export interface SavedMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  advisory: string;
  savedAt: string;
  description?: string;
}

export interface ExpiringMedicine {
  name: string;
  dosage: string;
  daysLeft: number;
}

export interface AdherenceEntry {
  medicineKey: string; 
  date: string; 
  time: string;
  takenAt: string;
}

// just doing temperory changes now, I have to make change here in future...

const STORAGE_KEY = "clearscript_medicines";
const ADHERENCE_KEY = "clearscript_adherence";

export function getSavedMedicines(): SavedMedicine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMedicines(medicines: SavedMedicine[]) {
  const existing = getSavedMedicines();
  const newMeds = medicines.map((m) => ({
    ...m,
    savedAt: new Date().toISOString(),
  }));
  const merged = [...existing];
  for (const med of newMeds) {
    if (!merged.some((e) => e.name === med.name && e.dosage === med.dosage)) {
      merged.push(med);
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  window.dispatchEvent(new Event("medicines-updated"));
}

export function clearMedicines() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("medicines-updated"));
}

export function removeMedicine(name: string, dosage: string) {
  const meds = getSavedMedicines().filter(
    (m) => !(m.name === name && m.dosage === dosage)
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meds));
  window.dispatchEvent(new Event("medicines-updated"));
}



export function getAdherenceLog(): AdherenceEntry[] {
  try {
    const raw = localStorage.getItem(ADHERENCE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function markMedicineTaken(medName: string, dosage: string, time: string) {
  const log = getAdherenceLog();
  const key = `${medName}-${dosage}-${time}`;
  const today = todayStr();
  if (!log.some((e) => e.medicineKey === key && e.date === today)) {
    log.push({ medicineKey: key, date: today, time, takenAt: new Date().toISOString() });
    localStorage.setItem(ADHERENCE_KEY, JSON.stringify(log));
    window.dispatchEvent(new Event("adherence-updated"));
  }
}

export function unmarkMedicineTaken(medName: string, dosage: string, time: string) {
  const key = `${medName}-${dosage}-${time}`;
  const today = todayStr();
  const log = getAdherenceLog().filter(
    (e) => !(e.medicineKey === key && e.date === today)
  );
  localStorage.setItem(ADHERENCE_KEY, JSON.stringify(log));
  window.dispatchEvent(new Event("adherence-updated"));
}

export function isMedicineTakenToday(medName: string, dosage: string, time: string): boolean {
  const key = `${medName}-${dosage}-${time}`;
  const today = todayStr();
  return getAdherenceLog().some((e) => e.medicineKey === key && e.date === today);
}

export function getTodayAdherenceStats() {
  const medicines = getSavedMedicines();
  const today = todayStr();
  const log = getAdherenceLog().filter((e) => e.date === today);
  let total = 0;
  for (const med of medicines) {
    total += getScheduleTimes(med.frequency).length;
  }
  return { taken: log.length, total, percentage: total > 0 ? Math.round((log.length / total) * 100) : 0 };
}


export function getScheduleTimes(frequency: string): string[] {
  const f = frequency.toLowerCase();
  if (f.includes("three") || f.includes("3 times") || f.includes("thrice")) {
    return ["08:00", "14:00", "20:00"];
  }
  if (f.includes("twice") || f.includes("2 times") || f.includes("bid")) {
    return ["08:00", "20:00"];
  }
  if (f.includes("night") || f.includes("bedtime")) {
    return ["21:00"];
  }
  if (f.includes("morning")) {
    return ["08:00"];
  }
  if (f.includes("afternoon")) {
    return ["14:00"];
  }
  return ["08:00"];
}


export function timeToMealSlot(time: string): "breakfast" | "lunch" | "dinner" {
  const hour = parseInt(time.split(":")[0], 10);
  if (hour < 12) return "breakfast";
  if (hour < 17) return "lunch";
  return "dinner";
}


function parseDurationDays(duration: string): number | null {
  const d = duration.toLowerCase();
  const numMatch = d.match(/(\d+)/);
  if (!numMatch) return null;
  const num = parseInt(numMatch[1], 10);
  if (d.includes("week")) return num * 7;
  if (d.includes("month")) return num * 30;
  if (d.includes("day")) return num;
  return num; 
}


export function getExpiringMedicines(): ExpiringMedicine[] {
  const medicines = getSavedMedicines();
  const results: ExpiringMedicine[] = [];
  for (const med of medicines) {
    const totalDays = parseDurationDays(med.duration);
    if (totalDays === null) continue;
    const startDate = new Date(med.savedAt);
    const endDate = new Date(startDate.getTime() + totalDays * 86400000);
    const now = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / 86400000);
    if (daysLeft <= 2) {
      results.push({ name: med.name, dosage: med.dosage, daysLeft });
    }
  }
  return results;
}
