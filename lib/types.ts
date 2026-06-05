// ─────────────────────────────────────────────────────────────
// Core Types  — structured for easy Supabase migration later
// ─────────────────────────────────────────────────────────────

export type Phase = 'fat-loss' | 'muscle-build' | 'definition';

export interface AppConfig {
  startDate: string; // ISO date string
  targetWeight?: number;
  currentWeight?: number;
}

export interface DailyChecklist {
  date: string; // YYYY-MM-DD
  workout: boolean;
  steps: boolean;
  protein: boolean;
  water: boolean;
  sleep: boolean;
  noAlcohol: boolean;
  workoutMode?: WorkoutMode;
}

export type WorkoutMode =
  | 'full'
  | 'busy'
  | 'emergency'
  | 'travel';

export type ExerciseCategory = 'push' | 'pull' | 'legs' | 'core' | 'cardio';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  sets?: number;
  reps?: string;
  duration?: string;
  description: string;
  tip: string;
  emoji: string;
  muscleGroup: string;
}

export interface WorkoutPlan {
  id: string;
  mode: WorkoutMode;
  label: string;
  duration: string;
  description: string;
  phase: Phase | 'all';
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  rest: string;
  note?: string;
}

export interface WorkoutLog {
  date: string;
  mode: WorkoutMode;
  completed: boolean;
  durationMinutes?: number;
  swaps?: Record<string, string>; // exerciseId -> replacementId
}

export interface NutritionEntry {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: FoodItem[];
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
}

export interface ProgressEntry {
  date: string;
  weight?: number;    // kg
  waist?: number;     // cm
  notes?: string;
  photoPlaceholder?: boolean;
}

export interface WeeklyProgress {
  weekNumber: number;
  startDate: string;
  endDate: string;
  avgCalories: number;
  avgProtein: number;
  workoutsCompleted: number;
  weightChange?: number;
  waistChange?: number;
}

// ─── Storage shape (mirrors future Supabase tables) ───
export interface AppState {
  config: AppConfig;
  dailyChecklists: Record<string, DailyChecklist>; // keyed by date
  workoutLogs: Record<string, WorkoutLog>;         // keyed by date
  nutritionEntries: Record<string, NutritionEntry>; // keyed by date
  progressEntries: ProgressEntry[];
}
