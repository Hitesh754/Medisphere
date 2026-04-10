import { NavLink, Outlet } from "react-router-dom";
import { Home, Pill, FolderLock, UtensilsCrossed } from "lucide-react";
import ChatBot from "./ChatBot";

const tabs = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/prescriptions", icon: Pill, label: "Prescriptions" },
  { to: "/medilocker", icon: FolderLock, label: "MediLocker" },
  { to: "/meals", icon: UtensilsCrossed, label: "Meals" },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border z-40">
        <div className="flex justify-around py-2">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <Icon size={22} />
              <span className="text-xs font-semibold">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <ChatBot />
    </div>
  );
}
