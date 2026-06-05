import type { WorkoutPlan } from '../types';

// ─────────────────────────────────────────────────────────────
// Workout Plans — per phase and per mode
// ─────────────────────────────────────────────────────────────

export const WORKOUT_PLANS: WorkoutPlan[] = [
  // ══════════════════════════════════════════
  // PHASE 1: Fat Loss Foundation (Days 1–30)
  // ══════════════════════════════════════════
  {
    id: 'fl-full',
    mode: 'full',
    label: 'Full Workout',
    duration: '45–50 min',
    description: 'Circuit-style training to maximise calorie burn and build the habit.',
    phase: 'fat-loss',
    exercises: [
      { exerciseId: 'jumping-jack', sets: 3, reps: '45 sec', rest: '15 sec' },
      { exerciseId: 'push-up', sets: 3, reps: '12', rest: '45 sec' },
      { exerciseId: 'squat', sets: 3, reps: '15', rest: '45 sec' },
      { exerciseId: 'mountain-climber', sets: 3, reps: '30 sec', rest: '30 sec' },
      { exerciseId: 'lunge', sets: 3, reps: '10 each', rest: '45 sec' },
      { exerciseId: 'plank', sets: 3, reps: '40 sec', rest: '20 sec' },
      { exerciseId: 'burpee', sets: 3, reps: '8', rest: '60 sec' },
      { exerciseId: 'bicycle-crunch', sets: 3, reps: '20 each', rest: '30 sec' },
    ],
  },
  {
    id: 'fl-busy',
    mode: 'busy',
    label: 'Busy Day Workout',
    duration: '25–30 min',
    description: 'Same results, half the time. Perfect for hectic days.',
    phase: 'fat-loss',
    exercises: [
      { exerciseId: 'high-knees', sets: 3, reps: '30 sec', rest: '15 sec' },
      { exerciseId: 'push-up', sets: 3, reps: '10', rest: '30 sec' },
      { exerciseId: 'squat', sets: 3, reps: '15', rest: '30 sec' },
      { exerciseId: 'plank', sets: 3, reps: '30 sec', rest: '15 sec' },
      { exerciseId: 'glute-bridge', sets: 3, reps: '15', rest: '30 sec' },
    ],
  },
  {
    id: 'fl-emergency',
    mode: 'emergency',
    label: '🚨 Rescue Workout',
    duration: '15 min',
    description: 'No excuses. 15 minutes is all it takes to keep the streak alive.',
    phase: 'fat-loss',
    exercises: [
      { exerciseId: 'jumping-jack', sets: 2, reps: '45 sec', rest: '15 sec' },
      { exerciseId: 'push-up', sets: 2, reps: '10', rest: '20 sec' },
      { exerciseId: 'squat', sets: 2, reps: '15', rest: '20 sec' },
      { exerciseId: 'plank', sets: 2, reps: '30 sec', rest: '15 sec' },
      { exerciseId: 'mountain-climber', sets: 2, reps: '20 sec', rest: '15 sec' },
    ],
  },
  {
    id: 'fl-travel',
    mode: 'travel',
    label: '✈️ Travel Mode',
    duration: '20–25 min',
    description: 'Hotel room or tiny space? No problem. Zero equipment.',
    phase: 'fat-loss',
    exercises: [
      { exerciseId: 'jump-rope', sets: 3, reps: '1 min', rest: '30 sec', note: 'Air jump rope if no rope' },
      { exerciseId: 'push-up', sets: 3, reps: '10', rest: '30 sec' },
      { exerciseId: 'lunge', sets: 3, reps: '10 each', rest: '30 sec' },
      { exerciseId: 'dead-bug', sets: 3, reps: '8 each', rest: '20 sec' },
      { exerciseId: 'high-knees', sets: 3, reps: '30 sec', rest: '15 sec' },
    ],
  },

  // ══════════════════════════════════════════
  // PHASE 2: Muscle Build (Days 31–60)
  // ══════════════════════════════════════════
  {
    id: 'mb-full',
    mode: 'full',
    label: 'Full Workout',
    duration: '50–55 min',
    description: 'Higher volume, progressive overload — build lean muscle.',
    phase: 'muscle-build',
    exercises: [
      { exerciseId: 'push-up', sets: 4, reps: '15', rest: '60 sec' },
      { exerciseId: 'diamond-push-up', sets: 3, reps: '10', rest: '45 sec' },
      { exerciseId: 'pull-up', sets: 4, reps: '6–8', rest: '90 sec', note: 'Or towel rows' },
      { exerciseId: 'inverted-row', sets: 3, reps: '12', rest: '60 sec' },
      { exerciseId: 'squat', sets: 4, reps: '20', rest: '60 sec' },
      { exerciseId: 'single-leg-glute-bridge', sets: 3, reps: '12 each', rest: '45 sec' },
      { exerciseId: 'dips', sets: 3, reps: '12', rest: '60 sec' },
      { exerciseId: 'plank', sets: 3, reps: '60 sec', rest: '30 sec' },
      { exerciseId: 'leg-raise', sets: 3, reps: '12', rest: '30 sec' },
    ],
  },
  {
    id: 'mb-busy',
    mode: 'busy',
    label: 'Busy Day Workout',
    duration: '25 min',
    description: 'Supersets to maximise muscle work in minimum time.',
    phase: 'muscle-build',
    exercises: [
      { exerciseId: 'push-up', sets: 3, reps: '15', rest: '30 sec' },
      { exerciseId: 'inverted-row', sets: 3, reps: '12', rest: '30 sec' },
      { exerciseId: 'squat', sets: 3, reps: '20', rest: '30 sec' },
      { exerciseId: 'plank', sets: 3, reps: '45 sec', rest: '15 sec' },
    ],
  },
  {
    id: 'mb-emergency',
    mode: 'emergency',
    label: '🚨 Rescue Workout',
    duration: '15 min',
    description: 'Quick muscle stimulus — keeps the habit alive.',
    phase: 'muscle-build',
    exercises: [
      { exerciseId: 'push-up', sets: 3, reps: '12', rest: '20 sec' },
      { exerciseId: 'squat', sets: 3, reps: '15', rest: '20 sec' },
      { exerciseId: 'plank', sets: 2, reps: '45 sec', rest: '15 sec' },
    ],
  },
  {
    id: 'mb-travel',
    mode: 'travel',
    label: '✈️ Travel Mode',
    duration: '25 min',
    description: 'Hotel room muscle work — no equipment needed.',
    phase: 'muscle-build',
    exercises: [
      { exerciseId: 'pike-push-up', sets: 4, reps: '10', rest: '45 sec' },
      { exerciseId: 'towel-row', sets: 4, reps: '12', rest: '45 sec' },
      { exerciseId: 'jump-squat', sets: 3, reps: '12', rest: '45 sec' },
      { exerciseId: 'diamond-push-up', sets: 3, reps: '8', rest: '45 sec' },
      { exerciseId: 'side-plank', sets: 3, reps: '30 sec each', rest: '15 sec' },
    ],
  },

  // ══════════════════════════════════════════
  // PHASE 3: Definition Phase (Days 61–90)
  // ══════════════════════════════════════════
  {
    id: 'def-full',
    mode: 'full',
    label: 'Full Workout',
    duration: '55–60 min',
    description: 'High intensity, full body — carve out definition.',
    phase: 'definition',
    exercises: [
      { exerciseId: 'burpee', sets: 4, reps: '10', rest: '45 sec' },
      { exerciseId: 'decline-push-up', sets: 4, reps: '12', rest: '45 sec' },
      { exerciseId: 'pull-up', sets: 4, reps: '8', rest: '60 sec' },
      { exerciseId: 'jump-squat', sets: 4, reps: '15', rest: '45 sec' },
      { exerciseId: 'mountain-climber', sets: 4, reps: '30 sec', rest: '30 sec' },
      { exerciseId: 'dips', sets: 4, reps: '12', rest: '45 sec' },
      { exerciseId: 'single-leg-glute-bridge', sets: 3, reps: '15 each', rest: '30 sec' },
      { exerciseId: 'bicycle-crunch', sets: 4, reps: '25 each', rest: '20 sec' },
      { exerciseId: 'side-plank', sets: 3, reps: '45 sec each', rest: '20 sec' },
    ],
  },
  {
    id: 'def-busy',
    mode: 'busy',
    label: 'Busy Day Workout',
    duration: '25 min',
    description: 'HIIT-style — max effort for definition.',
    phase: 'definition',
    exercises: [
      { exerciseId: 'burpee', sets: 3, reps: '10', rest: '30 sec' },
      { exerciseId: 'push-up', sets: 3, reps: '15', rest: '30 sec' },
      { exerciseId: 'jump-squat', sets: 3, reps: '15', rest: '30 sec' },
      { exerciseId: 'mountain-climber', sets: 3, reps: '30 sec', rest: '15 sec' },
    ],
  },
  {
    id: 'def-emergency',
    mode: 'emergency',
    label: '🚨 Rescue Workout',
    duration: '15 min',
    description: 'Intense short blast — never miss.',
    phase: 'definition',
    exercises: [
      { exerciseId: 'burpee', sets: 3, reps: '8', rest: '20 sec' },
      { exerciseId: 'push-up', sets: 2, reps: '12', rest: '20 sec' },
      { exerciseId: 'high-knees', sets: 2, reps: '30 sec', rest: '15 sec' },
      { exerciseId: 'plank', sets: 2, reps: '45 sec', rest: '15 sec' },
    ],
  },
  {
    id: 'def-travel',
    mode: 'travel',
    label: '✈️ Travel Mode',
    duration: '25 min',
    description: 'Hotel definition circuit — zero excuses.',
    phase: 'definition',
    exercises: [
      { exerciseId: 'jumping-jack', sets: 3, reps: '45 sec', rest: '15 sec' },
      { exerciseId: 'decline-push-up', sets: 3, reps: '12', rest: '30 sec' },
      { exerciseId: 'lunge', sets: 3, reps: '12 each', rest: '30 sec' },
      { exerciseId: 'mountain-climber', sets: 3, reps: '30 sec', rest: '15 sec' },
      { exerciseId: 'bicycle-crunch', sets: 3, reps: '20 each', rest: '20 sec' },
    ],
  },
];

export function getWorkoutsForPhase(phase: string, mode?: string): WorkoutPlan[] {
  return WORKOUT_PLANS.filter(
    (w) =>
      (w.phase === phase || w.phase === 'all') &&
      (mode ? w.mode === mode : true)
  );
}

export function getWorkoutPlan(phase: string, mode: string): WorkoutPlan | undefined {
  return WORKOUT_PLANS.find((w) => (w.phase === phase || w.phase === 'all') && w.mode === mode);
}
