import { useMemo, useState } from "react";
import {
  FileLock2,
  Plus,
  Shield,
  ScanLine,
  Syringe,
  FileText,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";

type LockerCategory = "xray" | "blood" | "vaccination" | "prescription" | "other";

const categories: Array<{
  key: LockerCategory;
  title: string;
  description: string;
  count: number;
  icon: typeof ScanLine;
}> = [
  {
    key: "xray",
    title: "X-Ray",
    description: "Scan images, reports, and radiology files.",
    count: 4,
    icon: ScanLine,
  },
  {
    key: "blood",
    title: "Blood Reports",
    description: "CBC, lipid, sugar, and lab results.",
    count: 8,
    icon: FileText,
  },
  {
    key: "vaccination",
    title: "Vaccination Certificates",
    description: "Immunization cards and vaccine proof.",
    count: 3,
    icon: Syringe,
  },
  {
    key: "prescription",
    title: "Prescriptions",
    description: "Doctor notes and medicine instructions.",
    count: 6,
    icon: FileLock2,
  },
  {
    key: "other",
    title: "Other Documents",
    description: "Insurance, discharge notes, and extras.",
    count: 2,
    icon: ImageIcon,
  },
];

const recentFiles = {
  xray: ["Chest X-Ray - Mar 2026", "Knee Scan - Feb 2026"],
  blood: ["Lipid Profile - Today", "CBC - 2 days ago", "HbA1c - 1 week ago"],
  vaccination: ["COVID Booster Card", "Child Immunization Record"],
  prescription: ["Diabetes Follow-up Rx", "Pain Relief Rx"],
  other: ["Insurance Policy Copy", "Discharge Summary"],
} satisfies Record<LockerCategory, string[]>;

export default function MediLockerPage() {
  const [activeCategory, setActiveCategory] = useState<LockerCategory>("blood");

  const activeCategoryData = useMemo(
    () => categories.find((item) => item.key === activeCategory) ?? categories[0],
    [activeCategory]
  );

  const ActiveIcon = activeCategoryData.icon;

  return (
    <div className="relative min-h-screen bg-background px-4 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md flex-col gap-5 pb-20">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Shield size={14} />
            Document locker
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                MediLocker
              </h1>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Keep medical documents grouped by type. These are local sections inside MediLocker, separate from the main app tabs.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
              <FileLock2 size={26} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="mb-4 flex gap-2 pb-2">
            {categories.map(({ key, title, count, icon: Icon }) => {
              const isActive = activeCategory === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveCategory(key)}
                  className={`flex min-w-fit items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? "border border-primary/30 bg-primary/10 text-primary"
                      : "border border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon size={16} />
                  <span>{title}</span>
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${isActive ? "bg-primary/20 text-primary" : "bg-background text-muted-foreground"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ActiveIcon size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{activeCategoryData.title}</div>
                <div className="text-xs text-muted-foreground">Recent documents in this section</div>
              </div>
            </div>
            <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {recentFiles[activeCategory].length} files
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {recentFiles[activeCategory].map((fileName) => (
              <div key={fileName} className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{fileName}</div>
                  <div className="text-xs text-muted-foreground">Tap to view or organize later</div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-4 text-sm text-muted-foreground">
          This area is ready for future upload, rename, and share actions.
        </div>
      </div>

      <button
        type="button"
        className="fixed bottom-24 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
        aria-label="Add document"
      >
        <Plus size={26} />
      </button>
    </div>
  );
}