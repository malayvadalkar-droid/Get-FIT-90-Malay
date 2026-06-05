'use client';
// ─────────────────────────────────────────────────────────────
// Storage layer — localStorage now, Supabase-ready interface
// ─────────────────────────────────────────────────────────────

import type {
  AppState,
  AppConfig,
  DailyChecklist,
  WorkoutLog,
  NutritionEntry,
  ProgressEntry,
  FoodItem,
} from './types';

const STORAGE_KEY = 'fit90_v1';

function today(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Default state ───────────────────────────────────────────
function defaultState(): AppState {
  return {
    config: {
      startDate: today(),
    },
    dailyChecklists: {},
    workoutLogs: {},
    nutritionEntries: {},
    progressEntries: [],
  };
}

// ─── Load / save ─────────────────────────────────────────────
export function loadState(): AppState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ─── Config ──────────────────────────────────────────────────
export function getConfig(): AppConfig {
  return loadState().config;
}

export function updateConfig(updates: Partial<AppConfig>): void {
  const state = loadState();
  state.config = { ...state.config, ...updates };
  saveState(state);
}

// ─── Day / phase helpers ─────────────────────────────────────
export function getDayNumber(): number {
  const { startDate } = getConfig();
  const start = new Date(startDate);
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(1, Math.min(diff + 1, 90));
}

export function getPhase(dayNumber?: number): {
  name: string;
  slug: 'fat-loss' | 'muscle-build' | 'definition';
  color: string;
  days: string;
} {
  const day = dayNumber ?? getDayNumber();
  if (day <= 30)
    return { name: 'Fat Loss Foundation', slug: 'fat-loss', color: '#f97316', days: 'Days 1–30' };
  if (day <= 60)
    return { name: 'Muscle Build', slug: 'muscle-build', color: '#3b82f6', days: 'Days 31–60' };
  return { name: 'Definition Phase', slug: 'definition', color: '#a855f7', days: 'Days 61–90' };
}

// ─── Daily Checklist ─────────────────────────────────────────
export function getChecklist(date?: string): DailyChecklist {
  const d = date ?? today();
  const state = loadState();
  return (
    state.dailyChecklists[d] ?? {
      date: d,
      workout: false,
      steps: false,
      protein: false,
      water: false,
      sleep: false,
      noAlcohol: false,
    }
  );
}

export function updateChecklist(updates: Partial<DailyChecklist>, date?: string): void {
  const d = date ?? today();
  const state = loadState();
  state.dailyChecklists[d] = { ...getChecklist(d), ...updates, date: d };
  saveState(state);
}

// ─── Workout Logs ────────────────────────────────────────────
export function getWorkoutLog(date?: string): WorkoutLog | null {
  const d = date ?? today();
  return loadState().workoutLogs[d] ?? null;
}

export function saveWorkoutLog(log: WorkoutLog): void {
  const state = loadState();
  state.workoutLogs[log.date] = log;
  saveState(state);
}

// ─── Nutrition ───────────────────────────────────────────────
export function getNutritionEntry(date?: string): NutritionEntry {
  const d = date ?? today();
  return (
    loadState().nutritionEntries[d] ?? {
      date: d,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      items: [],
    }
  );
}

export function addFoodItem(item: FoodItem, date?: string): void {
  const d = date ?? today();
  const state = loadState();
  const entry = getNutritionEntry(d);
  entry.items.push(item);
  entry.calories += item.calories * item.quantity;
  entry.protein += item.protein * item.quantity;
  entry.carbs += item.carbs * item.quantity;
  entry.fat += item.fat * item.quantity;
  state.nutritionEntries[d] = entry;
  saveState(state);
}

export function removeFoodItem(itemId: string, date?: string): void {
  const d = date ?? today();
  const state = loadState();
  const entry = getNutritionEntry(d);
  const item = entry.items.find((i) => i.id === itemId);
  if (item) {
    entry.calories -= item.calories * item.quantity;
    entry.protein -= item.protein * item.quantity;
    entry.carbs -= item.carbs * item.quantity;
    entry.fat -= item.fat * item.quantity;
    entry.items = entry.items.filter((i) => i.id !== itemId);
    state.nutritionEntries[d] = entry;
    saveState(state);
  }
}

// ─── Progress ────────────────────────────────────────────────
export function getProgressEntries(): ProgressEntry[] {
  return loadState().progressEntries;
}

export function addProgressEntry(entry: ProgressEntry): void {
  const state = loadState();
  // Replace if same date
  const idx = state.progressEntries.findIndex((e) => e.date === entry.date);
  if (idx >= 0) {
    state.progressEntries[idx] = entry;
  } else {
    state.progressEntries.push(entry);
  }
  state.progressEntries.sort((a, b) => a.date.localeCompare(b.date));
  saveState(state);
}

// ─── Weekly summary ──────────────────────────────────────────
export function getWeeklyStats(weekOffset = 0) {
  const state = loadState();
  const end = new Date();
  end.setDate(end.getDate() - weekOffset * 7);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);

  const dates: string[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }

  const checklists = dates.map((d) => state.dailyChecklists[d]).filter(Boolean);
  const nutrition = dates.map((d) => state.nutritionEntries[d]).filter(Boolean);

  const workoutsCompleted = checklists.filter((c) => c.workout).length;
  const avgCalories =
    nutrition.length > 0
      ? Math.round(nutrition.reduce((s, n) => s + n.calories, 0) / nutrition.length)
      : 0;
  const avgProtein =
    nutrition.length > 0
      ? Math.round(nutrition.reduce((s, n) => s + n.protein, 0) / nutrition.length)
      : 0;

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    workoutsCompleted,
    avgCalories,
    avgProtein,
    daysLogged: checklists.length,
  };
}

// ─── Streak ──────────────────────────────────────────────────
export function getCurrentStreak(): number {
  const state = loadState();
  let streak = 0;
  const d = new Date();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const key = d.toISOString().split('T')[0];
    const cl = state.dailyChecklists[key];
    if (!cl || !cl.workout) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
