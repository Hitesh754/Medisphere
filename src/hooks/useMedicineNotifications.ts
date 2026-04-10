import { useEffect, useRef } from "react";
import { getSavedMedicines, getScheduleTimes, getExpiringMedicines } from "@/lib/medicineStore";
import { addNotification } from "@/lib/notificationStore";
import { toast } from "sonner";

export function useMedicineNotifications() {
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkMedicines = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const medicines = getSavedMedicines();

      for (const med of medicines) {
        const times = getScheduleTimes(med.frequency);
        for (const t of times) {
          if (currentTime === t) {
            const key = `${med.name}-${t}-${now.toDateString()}`;
            if (notifiedRef.current.has(key)) continue;
            notifiedRef.current.add(key);

            const msg = `💊 Time to take ${med.name} (${med.dosage})`;
            toast.info(msg, {
              description: med.advisory,
              duration: 15000,
            });
            addNotification(msg);

            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("💊 Medicine Reminder", {
                body: `Time to take ${med.name} (${med.dosage})\n${med.advisory}`,
                icon: "/pwa-icon-192.png",
                tag: key,
              });
            }
          }

          // 5-min pre-reminder
          const [th, tm] = t.split(":").map(Number);
          let preH = th, preM = tm - 5;
          if (preM < 0) { preM += 60; preH -= 1; }
          const preTime = `${String(preH).padStart(2, "0")}:${String(preM).padStart(2, "0")}`;
          if (currentTime === preTime) {
            const preKey = `pre-${med.name}-${t}-${now.toDateString()}`;
            if (notifiedRef.current.has(preKey)) continue;
            notifiedRef.current.add(preKey);
            toast(`⏰ ${med.name} in 5 minutes`, { description: med.dosage, duration: 8000 });
            addNotification(`⏰ ${med.name} in 5 minutes`);
          }
        }
      }

      // Check for expiring medicine courses (once per day)
      const expiryKey = `expiry-check-${now.toDateString()}`;
      if (!notifiedRef.current.has(expiryKey)) {
        notifiedRef.current.add(expiryKey);
        const expiring = getExpiringMedicines();
        for (const med of expiring) {
          if (med.daysLeft <= 0) {
            toast.warning(`⚠️ ${med.name} course has ended`, {
              description: "Consult your doctor before continuing",
              duration: 15000,
            });
            addNotification(`⚠️ ${med.name} course has ended — consult your doctor`);
          } else if (med.daysLeft === 1) {
            toast.info(`📋 ${med.name} — last day of course`, {
              description: "Consider refilling or consulting your doctor",
              duration: 12000,
            });
            addNotification(`📋 ${med.name} — last day of course`);
          } else {
            toast(`📋 ${med.name} — ${med.daysLeft} days left`, { duration: 8000 });
            addNotification(`📋 ${med.name} — ${med.daysLeft} days left`);
          }
        }
      }
    };

    const interval = setInterval(checkMedicines, 30000);
    checkMedicines();
    return () => clearInterval(interval);
  }, []);
}