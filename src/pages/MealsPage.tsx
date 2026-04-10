// have to include some reminder features in future (Kevin-47)
import { useState, useEffect } from "react";
import {
  UtensilsCrossed, Flame, Droplets, Wheat, Beef, Pill,
  TrendingUp, Plus, Loader2, Sparkles, Leaf, Trash2,
  Heart, Activity, Calendar
} from "lucide-react";
import {
  getSavedMedicines, getScheduleTimes, timeToMealSlot,
  getAdherenceLog, type SavedMedicine
} from "@/lib/medicineStore";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MealMedicine {
  name: string;
  dosage: string;
  time: string;
  advisory: string;
}

interface MealEntry {
  id: string;
  name: string;
  quantity: string;
  slot: "breakfast" | "lunch" | "dinner";
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  suggestion?: string;
  loading?: boolean;
}

const MEALS_STORAGE_KEY = "clearscript_meals";

function loadMeals(): MealEntry[] {
  try {
    const raw = localStorage.getItem(MEALS_STORAGE_KEY);
    const meals = raw ? JSON.parse(raw) : [];
    const today = new Date().toISOString().split("T")[0];
    return meals.filter((m: any) => m.date === today);
  } catch { return []; }
}

function persistMeals(meals: MealEntry[]) {
  const today = new Date().toISOString().split("T")[0];
  const tagged = meals.map((m) => ({ ...m, date: today }));
  try {
    const raw = localStorage.getItem(MEALS_STORAGE_KEY);
    const existing: any[] = raw ? JSON.parse(raw) : [];
    const otherDays = existing.filter((m: any) => m.date !== today);
    localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify([...otherDays, ...tagged]));
  } catch {
    localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(tagged));
  }
}

function getMedicinesForSlot(medicines: SavedMedicine[], slot: "breakfast" | "lunch" | "dinner"): MealMedicine[] {
  const result: MealMedicine[] = [];
  for (const med of medicines) {
    const times = getScheduleTimes(med.frequency);
    for (const t of times) {
      if (timeToMealSlot(t) === slot) {
        result.push({ name: med.name, dosage: med.dosage, time: t, advisory: med.advisory });
      }
    }
  }
  return result;
}

function getWeeklyAdherence(medicines: SavedMedicine[]) {
  const log = getAdherenceLog();
  const days: { day: string; percentage: number }[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    let total = 0;
    for (const med of medicines) total += getScheduleTimes(med.frequency).length;
    const taken = log.filter((e) => e.date === dateStr).length;
    days.push({ day: dayNames[d.getDay()], percentage: total > 0 ? Math.round((taken / total) * 100) : 0 });
  }
  return days;
}

function getCurrentSlot(): "breakfast" | "lunch" | "dinner" {
  const h = new Date().getHours();
  if (h < 12) return "breakfast";
  if (h < 17) return "lunch";
  return "dinner";
}

const SLOT_META = {
  breakfast: { emoji: "🌅", label: "Breakfast", time: "Morning", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.22)" },
  lunch:     { emoji: "☀️",  label: "Lunch",     time: "Afternoon", color: "#ea580c", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.22)" },
  dinner:    { emoji: "🌙", label: "Dinner",    time: "Evening", color: "#6366f1", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.22)" },
};

export default function MealsPage() {
  const [medicines, setMedicines] = useState<SavedMedicine[]>([]);
  const [meals, setMeals] = useState<MealEntry[]>(loadMeals());
  const [inputName, setInputName] = useState("");
  const [inputQty, setInputQty] = useState("");
  const [inputSlot, setInputSlot] = useState<"breakfast" | "lunch" | "dinner">(getCurrentSlot());

  useEffect(() => {
    const load = () => setMedicines(getSavedMedicines());
    load();
    window.addEventListener("medicines-updated", load);
    window.addEventListener("adherence-updated", load);
    return () => {
      window.removeEventListener("medicines-updated", load);
      window.removeEventListener("adherence-updated", load);
    };
  }, []);

  const weeklyData = getWeeklyAdherence(medicines);
  const avgAdherence = weeklyData.length > 0
    ? Math.round(weeklyData.reduce((s, d) => s + d.percentage, 0) / weeklyData.length)
    : 0;
  const totalCalories = meals.reduce((s, m) => s + (m.calories || 0), 0);

  const analyzeMeal = async (meal: MealEntry) => {
    try {
      const { data, error } = await supabase.functions.invoke("analyze-meal", {
        body: {
          mealName: meal.name,
          quantity: meal.quantity || null,
          medicines: medicines.map((m) => ({ name: m.name, dosage: m.dosage, advisory: m.advisory })),
        },
      });
      if (error) throw error;
      return data;
    } catch (e: any) {
      console.error("Meal analysis error:", e);
      toast.error("Could not analyze meal");
      return null;
    }
  };

  const handleAddMeal = async () => {
    if (!inputName.trim()) { toast.error("Enter a meal name"); return; }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newMeal: MealEntry = { id, name: inputName.trim(), quantity: inputQty.trim(), slot: inputSlot, loading: true };
    const updated = [...meals, newMeal];
    setMeals(updated);
    persistMeals(updated);
    setInputName("");
    setInputQty("");
    const analysis = await analyzeMeal(newMeal);
    const final = updated.map((m) =>
      m.id === id ? { ...m, loading: false, ...(analysis || {}) } : m
    );
    setMeals(final);
    persistMeals(final);
  };

  const handleRemoveMeal = (id: string) => {
    const updated = meals.filter((m) => m.id !== id);
    setMeals(updated);
    persistMeals(updated);
  };

  const slots: Array<{ key: "breakfast" | "lunch" | "dinner" }> = [
    { key: "breakfast" },
    { key: "lunch" },
    { key: "dinner" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        @keyframes mt-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mt-pop-in {
          0%   { opacity: 0; transform: scale(0.9); }
          60%  { transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes mt-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-6px) rotate(1deg); }
          66%       { transform: translateY(-2px) rotate(-0.8deg); }
        }
        @keyframes mt-pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(249,115,22,0.45); }
          70%  { box-shadow: 0 0 0 10px rgba(249,115,22,0); }
          100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
        }
        @keyframes mt-badge-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes mt-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes mt-orb-drift {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%       { transform: translate(10px,-16px) scale(1.06); }
          66%       { transform: translate(-8px,8px) scale(0.96); }
        }
        @keyframes mt-ping {
          0%   { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes mt-bar-grow { from { width: 0; } }
        @keyframes mt-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes mt-card-in {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mt-slot-reveal {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Root ── */
        .mt-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #FDF6F0;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          color: #111827;
        }

        /* ── Ambient BG ── */
        .mt-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .mt-orb {
          position: absolute; border-radius: 50%; filter: blur(80px);
          animation: mt-orb-drift 14s ease-in-out infinite;
        }
        .mt-orb-1 {
          width: 380px; height: 380px;
          background: radial-gradient(circle, rgba(249,115,22,0.13) 0%, transparent 70%);
          top: -120px; right: -80px;
        }
        .mt-orb-2 {
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%);
          top: 40%; left: -90px; animation-delay: -5s;
        }
        .mt-orb-3 {
          width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%);
          bottom: 120px; right: -50px; animation-delay: -9s;
        }
        .mt-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }

        /* ── Layout ── */
        .mt-content {
          position: relative; z-index: 1;
          padding: 52px 20px 100px;
          display: flex; flex-direction: column; gap: 18px;
          max-width: 540px; margin: 0 auto;
        }

        /* ── Header ── */
        .mt-header { animation: mt-fade-up 0.5s ease forwards; }
        .mt-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px 4px 8px; border-radius: 100px;
          background: rgba(249,115,22,0.1);
          border: 1px solid rgba(249,115,22,0.24);
          font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
          color: #ea580c; margin-bottom: 12px;
          animation: mt-badge-in 0.6s 0.15s ease forwards; opacity: 0;
        }
        .mt-chip-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #f97316;
          box-shadow: 0 0 6px rgba(249,115,22,0.7);
          animation: mt-pulse-ring 2s ease-out infinite;
        }
        .mt-title {
          font-family: 'Fraunces', serif;
          font-size: 32px; font-weight: 800; color: #0f172a;
          line-height: 1.08; letter-spacing: -0.8px;
          margin: 0 0 6px;
        }
        .mt-title span {
          background: linear-gradient(135deg, #ea580c, #fb923c);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .mt-sub { font-size: 13px; color: rgba(15,23,42,0.5); font-weight: 400; line-height: 1.5; }
        .mt-header-row { display: flex; align-items: flex-start; justify-content: space-between; }
        .mt-icon-badge {
          width: 54px; height: 54px; border-radius: 18px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(249,115,22,0.18), rgba(251,146,60,0.12));
          border: 1px solid rgba(249,115,22,0.22);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 20px rgba(249,115,22,0.15);
          animation: mt-float 5s ease-in-out infinite;
        }

        /* ── Summary Strip ── */
        .mt-summary-strip {
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
          animation: mt-fade-up 0.5s 0.08s ease forwards; opacity: 0;
        }
        .mt-summary-tile {
          border-radius: 18px; padding: 14px 12px;
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(15,23,42,0.07);
          box-shadow: 0 2px 12px rgba(15,23,42,0.05), inset 0 1px 0 rgba(255,255,255,0.9);
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          position: relative; overflow: hidden;
        }
        .mt-summary-tile:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(249,115,22,0.1);
          border-color: rgba(249,115,22,0.2);
        }
        .mt-summary-tile::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.4), transparent);
        }
        .mt-tile-num {
          font-family: 'Fraunces', serif;
          font-size: 22px; font-weight: 800; line-height: 1;
        }
        .mt-tile-lbl { font-size: 9px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(15,23,42,0.4); }
        .mt-tile-icon {
          width: 28px; height: 28px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; margin-bottom: 2px;
        }

        /* ── Section Card (shared) ── */
        .mt-card {
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(15,23,42,0.07);
          border-radius: 22px; padding: 18px;
          box-shadow: 0 2px 14px rgba(15,23,42,0.05);
          position: relative; overflow: hidden;
          opacity: 0;
          animation: mt-fade-up 0.45s ease forwards;
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
          backdrop-filter: blur(12px);
        }
        .mt-card:hover {
          border-color: rgba(249,115,22,0.2);
          box-shadow: 0 6px 28px rgba(249,115,22,0.09);
          transform: translateY(-1px);
        }
        .mt-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.35), transparent);
        }

        .mt-section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .mt-section-icon {
          width: 36px; height: 36px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(249,115,22,0.14), rgba(251,146,60,0.09));
          border: 1px solid rgba(249,115,22,0.18);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(249,115,22,0.1);
        }
        .mt-section-title {
          font-family: 'Fraunces', serif;
          font-size: 15px; font-weight: 700; color: #0f172a;
        }
        .mt-section-badge {
          margin-left: auto;
          font-family: 'Fraunces', serif; font-size: 11px; font-weight: 800;
          color: #ea580c;
          background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2);
          padding: 2px 10px; border-radius: 100px;
        }

        /* ── Adherence Chart Card ── */
        .mt-chart-card {
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(15,23,42,0.07);
          border-radius: 22px; padding: 20px;
          box-shadow: 0 2px 14px rgba(15,23,42,0.05);
          position: relative; overflow: hidden;
          opacity: 0;
          animation: mt-fade-up 0.45s 0.12s ease forwards;
          backdrop-filter: blur(12px);
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .mt-chart-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.35), transparent);
        }
        .mt-chart-card:hover {
          border-color: rgba(249,115,22,0.18);
          box-shadow: 0 8px 28px rgba(249,115,22,0.08);
        }
        .mt-chart-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .mt-chart-left { display: flex; align-items: center; gap: 10px; }
        .mt-avg-num {
          font-family: 'Fraunces', serif; font-size: 30px; font-weight: 800; color: #ea580c; line-height: 1;
        }
        .mt-avg-lbl { font-size: 10px; color: rgba(15,23,42,0.4); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

        /* ── Add Meal Card ── */
        .mt-add-card {
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(15,23,42,0.07);
          border-radius: 22px; padding: 20px;
          box-shadow: 0 2px 14px rgba(15,23,42,0.05);
          position: relative; overflow: hidden;
          opacity: 0;
          animation: mt-fade-up 0.45s 0.16s ease forwards;
          backdrop-filter: blur(12px);
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .mt-add-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent);
        }
        .mt-add-card:hover {
          border-color: rgba(245,158,11,0.2);
          box-shadow: 0 8px 28px rgba(245,158,11,0.07);
        }
        .mt-input {
          width: 100%; padding: 12px 14px; border-radius: 14px;
          background: rgba(240,245,242,0.8);
          border: 1px solid rgba(15,23,42,0.09);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 500; color: #111827;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none;
        }
        .mt-input::placeholder { color: rgba(15,23,42,0.35); }
        .mt-input:focus {
          border-color: rgba(249,115,22,0.4);
          box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
          background: #fff;
        }
        .mt-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .mt-slot-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .mt-slot-tab {
          padding: 8px 14px; border-radius: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12px; font-weight: 700;
          border: 1.5px solid rgba(15,23,42,0.1);
          background: rgba(240,245,242,0.8);
          color: rgba(15,23,42,0.5);
          cursor: pointer;
          transition: all 0.2s;
        }
        .mt-slot-tab:hover { border-color: rgba(249,115,22,0.3); color: #ea580c; background: rgba(249,115,22,0.06); }
        .mt-slot-tab.active {
          background: rgba(249,115,22,0.12); border-color: rgba(249,115,22,0.35); color: #ea580c;
          box-shadow: 0 2px 8px rgba(249,115,22,0.15);
        }
        .mt-btn-primary {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 13px 24px; border-radius: 14px; border: none; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700;
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: #fff;
          box-shadow: 0 4px 20px rgba(249,115,22,0.35), inset 0 1px 0 rgba(255,255,255,0.25);
          transition: transform 0.15s, box-shadow 0.15s;
          position: relative; overflow: hidden;
        }
        .mt-btn-primary::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          background-size: 200% 100%; opacity: 0; transition: opacity 0.3s;
        }
        .mt-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(249,115,22,0.45), inset 0 1px 0 rgba(255,255,255,0.25);
        }
        .mt-btn-primary:hover::after { opacity: 1; animation: mt-shimmer 0.8s ease; }
        .mt-btn-primary:active { transform: scale(0.97); }

        /* ── Calorie Banner ── */
        .mt-cal-banner {
          border-radius: 20px; padding: 16px 18px;
          background: linear-gradient(135deg, rgba(245,158,11,0.1), rgba(234,179,8,0.07));
          border: 1px solid rgba(245,158,11,0.22);
          display: flex; align-items: center; justify-content: space-between;
          opacity: 0;
          animation: mt-fade-up 0.4s ease forwards;
          position: relative; overflow: hidden;
          transition: box-shadow 0.25s, border-color 0.25s;
        }
        .mt-cal-banner:hover {
          box-shadow: 0 6px 24px rgba(245,158,11,0.12);
          border-color: rgba(245,158,11,0.35);
        }
        .mt-cal-banner::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 70% at 0% 50%, rgba(245,158,11,0.06), transparent);
          pointer-events: none;
        }
        .mt-cal-num {
          font-family: 'Fraunces', serif; font-size: 28px; font-weight: 800; color: #d97706;
        }

        /* ── Slot Section ── */
        .mt-slot-header {
          display: flex; align-items: center; gap: 10px;
          padding: 6px 0;
          animation: mt-slot-reveal 0.4s ease forwards;
        }
        .mt-slot-pill {
          font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
          padding: 3px 10px; border-radius: 100px;
        }
        .mt-slot-title {
          font-family: 'Fraunces', serif; font-size: 16px; font-weight: 700; color: #0f172a;
        }
        .mt-slot-time { font-size: 12px; color: rgba(15,23,42,0.4); font-weight: 400; }

        /* ── Meal Entry Card ── */
        .mt-meal-card {
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(15,23,42,0.07);
          border-radius: 20px; padding: 16px;
          box-shadow: 0 2px 12px rgba(15,23,42,0.05);
          position: relative; overflow: hidden;
          animation: mt-card-in 0.4s ease forwards;
          backdrop-filter: blur(10px);
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
        }
        .mt-meal-card:hover {
          border-color: rgba(249,115,22,0.18);
          box-shadow: 0 6px 24px rgba(249,115,22,0.09);
          transform: translateY(-1px);
        }
        .mt-meal-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.3), transparent);
        }
        .mt-meal-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
        .mt-meal-name {
          font-family: 'Fraunces', serif; font-size: 16px; font-weight: 700; color: #0f172a;
        }
        .mt-meal-qty { font-size: 11px; color: rgba(15,23,42,0.4); font-weight: 500; margin-top: 2px; }
        .mt-delete-btn {
          width: 30px; height: 30px; border-radius: 10px; border: none; cursor: pointer;
          background: rgba(239,68,68,0.08);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s, transform 0.15s;
        }
        .mt-delete-btn:hover { background: rgba(239,68,68,0.16); transform: scale(1.08); }
        .mt-delete-btn:active { transform: scale(0.94); }

        /* Nutrition grid */
        .mt-nutrition-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
        .mt-nutrient {
          border-radius: 12px; padding: 8px 4px; text-align: center;
          background: rgba(240,245,242,0.7);
          border: 1px solid rgba(15,23,42,0.06);
          transition: transform 0.2s, border-color 0.2s;
        }
        .mt-nutrient:hover { transform: translateY(-2px); border-color: rgba(249,115,22,0.2); }
        .mt-nutrient-val { font-family: 'Fraunces', serif; font-size: 13px; font-weight: 800; color: #ea580c; }
        .mt-nutrient-lbl { font-size: 8px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(15,23,42,0.4); margin-top: 2px; }

        /* AI suggestion */
        .mt-suggestion {
          border-radius: 14px; padding: 11px 13px;
          background: linear-gradient(135deg, rgba(249,115,22,0.08), rgba(251,146,60,0.05));
          border: 1px solid rgba(249,115,22,0.18);
          display: flex; gap: 9px; align-items: flex-start;
          margin-top: 10px;
        }
        .mt-suggestion-text { font-size: 11px; color: rgba(15,23,42,0.65); line-height: 1.65; font-weight: 500; }

        /* Loading skeleton */
        .mt-loading-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; }
        .mt-loading-dots span {
          display: inline-block; width: 5px; height: 5px; border-radius: 50%;
          background: rgba(249,115,22,0.5);
          animation: mt-dot-bounce 1.2s ease-in-out infinite; margin: 0 1.5px;
        }
        .mt-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .mt-loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        /* ── Medicines Strip ── */
        .mt-med-strip {
          border-radius: 16px; padding: 14px;
          background: rgba(249,115,22,0.04);
          border: 1px solid rgba(249,115,22,0.15);
          border-left: 3px solid rgba(249,115,22,0.45);
        }
        .mt-med-title {
          font-family: 'Fraunces', serif; font-size: 12px; font-weight: 700; color: #ea580c;
          display: flex; align-items: center; gap: 6px; margin-bottom: 9px;
        }
        .mt-med-row {
          background: rgba(255,255,255,0.85);
          border: 1px solid rgba(249,115,22,0.12);
          border-radius: 12px; padding: 9px 12px;
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 6px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .mt-med-row:last-child { margin-bottom: 0; }
        .mt-med-row:hover { border-color: rgba(249,115,22,0.3); box-shadow: 0 2px 10px rgba(249,115,22,0.08); }
        .mt-med-name { font-size: 12px; font-weight: 700; color: #111827; }
        .mt-med-detail { font-size: 10px; color: rgba(15,23,42,0.45); font-weight: 500; margin-top: 1px; }
        .mt-med-time {
          font-size: 10px; font-weight: 700; color: #ea580c;
          background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2);
          padding: 3px 9px; border-radius: 100px; flex-shrink: 0; margin-left: 8px;
        }

        /* ── Empty State ── */
        .mt-empty {
          border-radius: 22px; padding: 50px 24px;
          background: rgba(255,255,255,0.7);
          border: 1.5px dashed rgba(249,115,22,0.25);
          backdrop-filter: blur(10px);
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          text-align: center;
          opacity: 0; animation: mt-fade-up 0.5s 0.3s ease forwards;
        }
        .mt-empty-icon {
          width: 72px; height: 72px; border-radius: 24px;
          background: linear-gradient(135deg, rgba(249,115,22,0.16), rgba(251,146,60,0.1));
          border: 1px solid rgba(249,115,22,0.22);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(249,115,22,0.15);
          animation: mt-float 5s ease-in-out infinite;
        }
        .mt-empty-title {
          font-family: 'Fraunces', serif; font-size: 19px; font-weight: 700; color: #0f172a;
        }
        .mt-empty-sub { font-size: 13px; color: rgba(15,23,42,0.45); line-height: 1.55; }

        /* ── Divider ── */
        .mt-divider { display: flex; align-items: center; gap: 10px; }
        .mt-divider-line { flex: 1; height: 1px; background: rgba(15,23,42,0.08); }
        .mt-divider-label { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(15,23,42,0.3); }

        .mt-gap-sm { display: flex; flex-direction: column; gap: 10px; }
        .mt-gap-md { display: flex; flex-direction: column; gap: 14px; }
      `}</style>

      <div className="mt-root">
        
        <div className="mt-bg">
          <div className="mt-grid" />
          <div className="mt-orb mt-orb-1" />
          <div className="mt-orb mt-orb-2" />
          <div className="mt-orb mt-orb-3" />
        </div>

        <div className="mt-content">

          
          <div className="mt-header">
            <div className="mt-header-row">
              <div>
                <div className="mt-chip">
                  <span className="mt-chip-dot" />
                  AI Nutrition
                </div>
                <h1 className="mt-title">
                  Meal<span>Tracker</span>
                </h1>
                <p className="mt-sub">Log meals & get AI suggestions based on your medicines</p>
              </div>
              <div className="mt-icon-badge">
                <UtensilsCrossed size={24} color="#ea580c" />
              </div>
            </div>
          </div>

          
          <div className="mt-summary-strip">
            {[
              { icon: <Flame size={14} color="#d97706" />, iconBg: "rgba(245,158,11,0.12)", num: `${totalCalories}`, lbl: "Calories" },
              { icon: <Pill size={14} color="#ea580c" />, iconBg: "rgba(249,115,22,0.12)", num: `${medicines.length}`, lbl: "Medicines" },
              { icon: <Activity size={14} color="#6366f1" />, iconBg: "rgba(99,102,241,0.12)", num: `${avgAdherence}%`, lbl: "Adherence" },
            ].map(({ icon, iconBg, num, lbl }) => (
              <div key={lbl} className="mt-summary-tile">
                <div className="mt-tile-icon" style={{ background: iconBg }}>{icon}</div>
                <span className="mt-tile-num" style={{ color: lbl === "Calories" ? "#d97706" : lbl === "Adherence" ? "#6366f1" : "#ea580c" }}>{num}</span>
                <span className="mt-tile-lbl">{lbl}</span>
              </div>
            ))}
          </div>

          
          {medicines.length > 0 && (
            <div className="mt-chart-card">
              <div className="mt-chart-top">
                <div className="mt-chart-left">
                  <div className="mt-section-icon">
                    <TrendingUp size={16} color="#ea580c" />
                  </div>
                  <div>
                    <div className="mt-section-title">Weekly Adherence</div>
                    <div style={{ fontSize: 10, color: "rgba(15,23,42,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Last 7 days</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mt-avg-num">{avgAdherence}%</div>
                  <div className="mt-avg-lbl">Average</div>
                </div>
              </div>
              <div style={{ height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} barCategoryGap="22%">
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(15,23,42,0.4)", fontWeight: 600 }} />
                    <YAxis hide domain={[0, 100]} />
                    <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                      {weeklyData.map((entry, index) => (
                        <Cell key={index}
                          fill={entry.percentage >= 80 ? "#f97316" : entry.percentage >= 50 ? "#f59e0b" : "rgba(239,68,68,0.6)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── Add Meal ── */}
          <div className="mt-add-card">
            <div className="mt-section-head">
              <div className="mt-section-icon" style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.18),rgba(234,179,8,0.1))", border: "1px solid rgba(245,158,11,0.22)" }}>
                <Plus size={16} color="#d97706" />
              </div>
              <span className="mt-section-title">Log a Meal</span>
            </div>

            <div className="mt-gap-sm">
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="e.g. Dal Rice, Chicken Biryani, Salad..."
                className="mt-input"
                onKeyDown={(e) => e.key === "Enter" && handleAddMeal()}
              />
              <div className="mt-input-row">
                <input
                  type="text"
                  value={inputQty}
                  onChange={(e) => setInputQty(e.target.value)}
                  placeholder="Quantity (e.g. 200g)"
                  className="mt-input"
                />
                <div /> 
              </div>
              <div className="mt-slot-tabs">
                {(["breakfast","lunch","dinner"] as const).map((s) => (
                  <button
                    key={s}
                    className={`mt-slot-tab${inputSlot === s ? " active" : ""}`}
                    onClick={() => setInputSlot(s)}
                  >
                    {SLOT_META[s].label}
                  </button>
                ))}
              </div>
              <button className="mt-btn-primary" onClick={handleAddMeal}>
                <Sparkles size={16} />
                Add & Analyze
              </button>
            </div>
          </div>

          
          {meals.length > 0 && (
            <div className="mt-cal-banner">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Flame size={17} color="#d97706" />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>Today's Total</div>
                  <div style={{ fontSize: 10, color: "rgba(15,23,42,0.4)", fontWeight: 500 }}>{meals.length} meal{meals.length !== 1 ? "s" : ""} logged</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mt-cal-num">{totalCalories}</div>
                <div style={{ fontSize: 10, color: "rgba(15,23,42,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>kcal</div>
              </div>
            </div>
          )}

          
          {slots.map(({ key }) => {
            const meta = SLOT_META[key];
            const slotMeals = meals.filter((m) => m.slot === key);
            const mealMeds = getMedicinesForSlot(medicines, key);
            if (slotMeals.length === 0 && mealMeds.length === 0) return null;
            return (
              <div key={key} className="mt-gap-md">
                
                <div className="mt-slot-header">
                  <div className="mt-divider-line" />
                  <div className="mt-slot-pill" style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}>
                    {meta.label}
                  </div>
                  <span className="mt-slot-time">{meta.time}</span>
                  <div className="mt-divider-line" />
                </div>

                
                {slotMeals.map((meal) => (
                  <div key={meal.id} className="mt-meal-card">
                    <div className="mt-meal-top">
                      <div>
                        <div className="mt-meal-name">{meal.name}</div>
                        {meal.quantity && <div className="mt-meal-qty">{meal.quantity}</div>}
                      </div>
                      <button className="mt-delete-btn" onClick={() => handleRemoveMeal(meal.id)}>
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>

                    {meal.loading ? (
                      <div className="mt-loading-row">
                        <Loader2 size={15} color="#ea580c" style={{ animation: "spin 0.8s linear infinite" }} />
                        <span style={{ fontSize: 12, color: "rgba(15,23,42,0.5)" }}>Analyzing nutrition</span>
                        <div className="mt-loading-dots">
                          <span /><span /><span />
                        </div>
                      </div>
                    ) : meal.calories != null ? (
                      <>
                        <div className="mt-nutrition-grid">
                          {[
                            { icon: <Flame size={11} color="#d97706" />, label: "Cal", value: `${meal.calories}` },
                            { icon: <Beef size={11} color="#ea580c" />, label: "Protein", value: `${meal.protein}g` },
                            { icon: <Wheat size={11} color="#6366f1" />, label: "Carbs", value: `${meal.carbs}g` },
                            { icon: <Droplets size={11} color="#0891b2" />, label: "Fat", value: `${meal.fat}g` },
                            { icon: <Leaf size={11} color="#ea580c" />, label: "Fiber", value: `${meal.fiber}g` },
                          ].map(({ icon, label, value }) => (
                            <div key={label} className="mt-nutrient">
                              <div style={{ display: "flex", justifyContent: "center", marginBottom: 3 }}>{icon}</div>
                              <div className="mt-nutrient-val">{value}</div>
                              <div className="mt-nutrient-lbl">{label}</div>
                            </div>
                          ))}
                        </div>
                        {meal.suggestion && (
                          <div className="mt-suggestion">
                            <Sparkles size={13} color="#ea580c" style={{ flexShrink: 0, marginTop: 1 }} />
                            <span className="mt-suggestion-text">{meal.suggestion}</span>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                ))}

                {/* Medicines for slot */}
                {mealMeds.length > 0 && (
                  <div className="mt-med-strip">
                    <div className="mt-med-title">
                      <Pill size={13} color="#ea580c" />
                      Medicines to take
                    </div>
                    {mealMeds.map((med, i) => (
                      <div key={i} className="mt-med-row">
                        <div>
                          <div className="mt-med-name">{med.name}</div>
                          <div className="mt-med-detail">{med.dosage} · {med.advisory}</div>
                        </div>
                        <span className="mt-med-time">{med.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          
          {meals.length === 0 && medicines.length === 0 && (
            <div className="mt-empty">
              <div className="mt-empty-icon">
                <UtensilsCrossed size={32} color="#ea580c" />
              </div>
              <div>
                <div className="mt-empty-title">Log your first meal</div>
                <p className="mt-empty-sub">
                  Add a meal above to get instant AI-powered<br />
                  nutrition analysis & medicine pairing tips
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
