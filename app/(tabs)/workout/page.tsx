'use client';

import { useState, useEffect } from 'react';
import { Clock, Dumbbell, RefreshCw, ChevronDown, ChevronUp, CheckCircle2, Info } from 'lucide-react';
import {
  getDayNumber,
  getPhase,
  saveWorkoutLog,
  updateChecklist,
  getChecklist,
} from '@/lib/storage';
import { getWorkoutPlan, WORKOUT_PLANS } from '@/lib/data/workouts';
import { getExerciseById, EXERCISES } from '@/lib/data/exercises';
import type { WorkoutMode, WorkoutPlan, ExerciseCategory } from '@/lib/types';

const MODE_META: Record<WorkoutMode, { label: string; emoji: string; color: string; desc: string }> = {
  full: { label: 'Full Workout', emoji: '🏋️', color: '#f97316', desc: '45–55 min • Full program' },
  busy: { label: 'Busy Day', emoji: '⚡', color: '#3b82f6', desc: '25–30 min • Condensed' },
  emergency: { label: 'Rescue', emoji: '🚨', color: '#ef4444', desc: '15 min • Never miss a day' },
  travel: { label: 'Travel Mode', emoji: '✈️', color: '#a855f7', desc: '20–25 min • Zero equipment' },
};

const CATEGORY_META: Record<ExerciseCategory, { label: string; color: string; emoji: string }> = {
  push: { label: 'Push', color: '#f97316', emoji: '💪' },
  pull: { label: 'Pull', color: '#3b82f6', emoji: '🤸' },
  legs: { label: 'Legs', color: '#22c55e', emoji: '🦵' },
  core: { label: 'Core', color: '#a855f7', emoji: '🔥' },
  cardio: { label: 'Cardio', color: '#ef4444', emoji: '🏃' },
};

function ExerciseInfoCard({
  exerciseId,
  swapTarget,
  onSwap,
  onClose,
}: {
  exerciseId: string;
  swapTarget?: string;
  onSwap: (from: string, to: string) => void;
  onClose: () => void;
}) {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return null;
  const alternatives = EXERCISES.filter(
    (e) => e.category === exercise.category && e.id !== exerciseId
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
        padding: '0',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          background: 'var(--surface)',
          borderRadius: '24px 24px 0 0',
          padding: '20px 20px 40px',
          maxHeight: '85vh',
          overflowY: 'auto',
          border: '1px solid var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
          <div className="exercise-emoji">{exercise.emoji}</div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{exercise.name}</h3>
            <p style={{ fontSize: '13px', color: CATEGORY_META[exercise.category].color }}>
              {exercise.muscleGroup}
            </p>
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface2)',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '16px',
          }}
        >
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text)' }}>
            {exercise.description}
          </p>
        </div>

        <div
          style={{
            background: '#f9731611',
            border: '1px solid #f9731633',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '20px',
            display: 'flex',
            gap: '8px',
          }}
        >
          <span>💡</span>
          <p style={{ fontSize: '13px', color: '#fb923c' }}>{exercise.tip}</p>
        </div>

        {swapTarget && (
          <>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>
              Swap with:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {alternatives.map((alt) => (
                <div
                  key={alt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    background: 'var(--surface2)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    onSwap(swapTarget, alt.id);
                    onClose();
                  }}
                >
                  <span style={{ fontSize: '22px' }}>{alt.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{alt.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {alt.muscleGroup}
                    </div>
                  </div>
                  <RefreshCw size={16} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
                </div>
              ))}
            </div>
          </>
        )}

        <button
          className="btn-secondary"
          style={{ marginTop: '20px' }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function WorkoutPage() {
  const [dayNumber, setDayNumber] = useState(1);
  const [selectedMode, setSelectedMode] = useState<WorkoutMode>('full');
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [swaps, setSwaps] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [infoExercise, setInfoExercise] = useState<string | null>(null);
  const [swapTarget, setSwapTarget] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [workoutDone, setWorkoutDone] = useState(false);
  const [activeTab, setActiveTab] = useState<'workout' | 'library'>('workout');
  const [libraryCategory, setLibraryCategory] = useState<ExerciseCategory | 'all'>('all');

  useEffect(() => {
    const day = getDayNumber();
    setDayNumber(day);
    const phase = getPhase(day);
    const plan = getWorkoutPlan(phase.slug, selectedMode);
    setActivePlan(plan ?? null);
    const cl = getChecklist();
    setWorkoutDone(cl.workout);
  }, [selectedMode]);

  const phase = getPhase(dayNumber);
  const phaseColors: Record<string, string> = {
    'fat-loss': '#f97316',
    'muscle-build': '#3b82f6',
    definition: '#a855f7',
  };
  const phaseColor = phaseColors[phase.slug] ?? '#f97316';

  const handleSwap = (from: string, to: string) => {
    setSwaps((prev) => ({ ...prev, [from]: to }));
  };

  const getEffectiveExerciseId = (exerciseId: string) => swaps[exerciseId] ?? exerciseId;

  const toggleExerciseComplete = (exerciseId: string) => {
    setCompletedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });
  };

  const handleCompleteWorkout = () => {
    if (!activePlan) return;
    const today = new Date().toISOString().split('T')[0];
    saveWorkoutLog({
      date: today,
      mode: selectedMode,
      completed: true,
      swaps,
    });
    updateChecklist({ workout: true, workoutMode: selectedMode });
    setWorkoutDone(true);
  };

  const libraryExercises =
    libraryCategory === 'all'
      ? EXERCISES
      : EXERCISES.filter((e) => e.category === libraryCategory);

  return (
    <div style={{ paddingBottom: '20px' }}>
      {/* Header */}
      <div
        style={{
          background: 'var(--surface)',
          padding: '52px 20px 16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="phase-badge"
            style={{
              background: `${phaseColor}22`,
              color: phaseColor,
              border: `1px solid ${phaseColor}44`,
            }}
          >
            {phase.name}
          </span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '2px' }}>Workout</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Day {dayNumber}/90</p>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '16px',
            background: 'var(--surface2)',
            borderRadius: '12px',
            padding: '4px',
          }}
        >
          {(['workout', 'library'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '9px',
                border: 'none',
                background: activeTab === tab ? 'var(--surface3)' : 'transparent',
                color: activeTab === tab ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab === 'workout' ? '🏋️ Workout' : '📚 Library'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'workout' && (
        <>
          {/* Mode selector */}
          <div style={{ padding: '16px 20px 0' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-muted)' }}>
              SELECT MODE
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {(Object.keys(MODE_META) as WorkoutMode[]).map((mode) => {
                const meta = MODE_META[mode];
                const active = selectedMode === mode;
                return (
                  <div
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      background: active ? `${meta.color}22` : 'var(--surface2)',
                      border: `1px solid ${active ? meta.color + '66' : 'var(--border)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '22px', marginBottom: '4px' }}>{meta.emoji}</div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '13px',
                        color: active ? meta.color : 'var(--text)',
                      }}
                    >
                      {meta.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {meta.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Never-fail nudge */}
          {!workoutDone && (
            <div
              style={{
                margin: '16px 20px 0',
                padding: '12px 14px',
                background: '#f9731611',
                border: '1px solid #f9731633',
                borderRadius: '12px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              <span>💡</span>
              <p style={{ fontSize: '13px', color: '#fb923c', lineHeight: 1.5 }}>
                Can&apos;t do a full workout? Try <strong>Rescue (15 min)</strong> or{' '}
                <strong>Travel Mode</strong> — a short session beats skipping!
              </p>
            </div>
          )}

          {/* Active plan */}
          {activePlan && (
            <div style={{ padding: '16px 20px 0' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <h2 style={{ fontSize: '17px', fontWeight: 800 }}>{activePlan.label}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <Clock size={14} />
                  {activePlan.duration}
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {activePlan.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activePlan.exercises.map((we, idx) => {
                  const effectiveId = getEffectiveExerciseId(we.exerciseId);
                  const exercise = getExerciseById(effectiveId);
                  if (!exercise) return null;
                  const isExpanded = expanded === we.exerciseId;
                  const isDone = completedExercises.has(we.exerciseId);
                  const wasSwapped = swaps[we.exerciseId] !== undefined;
                  const catMeta = CATEGORY_META[exercise.category];

                  return (
                    <div
                      key={we.exerciseId}
                      style={{
                        background: isDone ? 'rgba(34,197,94,0.08)' : 'var(--surface2)',
                        border: `1px solid ${isDone ? '#22c55e44' : 'var(--border)'}`,
                        borderRadius: '14px',
                        overflow: 'hidden',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px',
                          cursor: 'pointer',
                        }}
                        onClick={() => setExpanded(isExpanded ? null : we.exerciseId)}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: `${catMeta.color}22`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            flexShrink: 0,
                          }}
                        >
                          {exercise.emoji}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: '14px',
                                color: isDone ? 'var(--accent-green)' : 'var(--text)',
                              }}
                            >
                              {exercise.name}
                            </span>
                            {wasSwapped && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  background: '#a855f722',
                                  color: '#a855f7',
                                  borderRadius: '6px',
                                  padding: '2px 6px',
                                }}
                              >
                                swapped
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {we.sets}×{we.reps} · Rest {we.rest}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExerciseComplete(we.exerciseId);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {isDone ? (
                              <CheckCircle2 size={22} color="var(--accent-green)" />
                            ) : (
                              <div
                                style={{
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '50%',
                                  border: '2px solid var(--border)',
                                }}
                              />
                            )}
                          </div>
                          {isExpanded ? (
                            <ChevronUp size={16} color="var(--text-muted)" />
                          ) : (
                            <ChevronDown size={16} color="var(--text-muted)" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div
                          style={{
                            padding: '0 14px 14px',
                            borderTop: '1px solid var(--border)',
                            paddingTop: '12px',
                          }}
                        >
                          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '12px' }}>
                            {exercise.description}
                          </p>
                          <div
                            style={{
                              background: '#f9731611',
                              borderRadius: '8px',
                              padding: '8px 10px',
                              marginBottom: '12px',
                              fontSize: '12px',
                              color: '#fb923c',
                            }}
                          >
                            💡 {exercise.tip}
                          </div>
                          {we.note && (
                            <div
                              style={{
                                background: '#3b82f611',
                                borderRadius: '8px',
                                padding: '8px 10px',
                                marginBottom: '12px',
                                fontSize: '12px',
                                color: '#60a5fa',
                              }}
                            >
                              📝 {we.note}
                            </div>
                          )}
                          <button
                            className="btn-secondary"
                            style={{ fontSize: '13px', padding: '10px 16px' }}
                            onClick={() => {
                              setSwapTarget(we.exerciseId);
                              setInfoExercise(effectiveId);
                            }}
                          >
                            <RefreshCw size={14} />
                            Swap Exercise
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Complete workout button */}
              <div style={{ marginTop: '20px' }}>
                {workoutDone ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '16px',
                      background: 'rgba(34,197,94,0.1)',
                      border: '1px solid #22c55e44',
                      borderRadius: '14px',
                      color: '#22c55e',
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle2 size={22} />
                    Workout Complete! 🎉
                  </div>
                ) : (
                  <button className="btn-primary" onClick={handleCompleteWorkout}>
                    <Dumbbell size={18} />
                    Mark Workout Complete
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Exercise Library Tab */}
      {activeTab === 'library' && (
        <div style={{ padding: '16px 20px 0' }}>
          {/* Category filter */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '16px' }}>
            <button
              onClick={() => setLibraryCategory('all')}
              style={{
                padding: '7px 14px',
                borderRadius: '100px',
                border: '1px solid var(--border)',
                background: libraryCategory === 'all' ? 'var(--text)' : 'var(--surface2)',
                color: libraryCategory === 'all' ? 'var(--bg)' : 'var(--text)',
                fontSize: '13px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              All
            </button>
            {(Object.keys(CATEGORY_META) as ExerciseCategory[]).map((cat) => {
              const meta = CATEGORY_META[cat];
              const active = libraryCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setLibraryCategory(cat)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '100px',
                    border: `1px solid ${active ? meta.color + '88' : 'var(--border)'}`,
                    background: active ? `${meta.color}22` : 'var(--surface2)',
                    color: active ? meta.color : 'var(--text-muted)',
                    fontSize: '13px',
                    fontWeight: active ? 700 : 500,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  {meta.emoji} {meta.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {libraryExercises.map((ex) => {
              const catMeta = CATEGORY_META[ex.category];
              return (
                <div
                  key={ex.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px',
                    background: 'var(--surface2)',
                    borderRadius: '14px',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setInfoExercise(ex.id);
                    setSwapTarget(null);
                  }}
                >
                  <div className="exercise-emoji" style={{ width: '48px', height: '48px', fontSize: '24px' }}>
                    {ex.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{ex.name}</div>
                    <div style={{ fontSize: '12px', color: catMeta.color, marginTop: '2px' }}>
                      {catMeta.emoji} {ex.muscleGroup}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {ex.sets ? `${ex.sets} sets × ${ex.reps}` : ex.duration}
                    </div>
                  </div>
                  <Info size={16} color="var(--text-muted)" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Exercise info modal */}
      {infoExercise && (
        <ExerciseInfoCard
          exerciseId={infoExercise}
          swapTarget={swapTarget ?? undefined}
          onSwap={handleSwap}
          onClose={() => {
            setInfoExercise(null);
            setSwapTarget(null);
          }}
        />
      )}
    </div>
  );
}
