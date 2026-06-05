'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Circle, Flame, Target, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import {
  getDayNumber,
  getPhase,
  getChecklist,
  updateChecklist,
  getCurrentStreak,
  getConfig,
  updateConfig,
} from '@/lib/storage';
import type { DailyChecklist } from '@/lib/types';

const CHECKLIST_ITEMS: {
  key: keyof Omit<DailyChecklist, 'date' | 'workoutMode'>;
  label: string;
  sublabel: string;
  emoji: string;
}[] = [
  { key: 'workout', label: 'Workout Done', sublabel: 'Any mode counts', emoji: '🏋️' },
  { key: 'steps', label: '10,000 Steps', sublabel: 'Walk, commute, anything', emoji: '👟' },
  { key: 'protein', label: '180g Protein', sublabel: 'Hit your daily target', emoji: '🥩' },
  { key: 'water', label: '3L Water', sublabel: 'Hydration is key', emoji: '💧' },
  { key: 'sleep', label: 'Sleep Logged', sublabel: '7–9 hours', emoji: '😴' },
  { key: 'noAlcohol', label: 'No Alcohol', sublabel: 'Keep the streak clean', emoji: '🚫' },
];

function ProgressRing({
  progress,
  size = 88,
  stroke = 6,
  color = '#f97316',
}: {
  progress: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress / 100);
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#2a2a3a" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="progress-ring-circle"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
    </svg>
  );
}

export default function TodayPage() {
  const [dayNumber, setDayNumber] = useState(1);
  const [checklist, setChecklist] = useState<DailyChecklist>({
    date: '',
    workout: false,
    steps: false,
    protein: false,
    water: false,
    sleep: false,
    noAlcohol: false,
  });
  const [streak, setStreak] = useState(0);
  const [showSetup, setShowSetup] = useState(false);
  const [startDateInput, setStartDateInput] = useState('');

  const load = useCallback(() => {
    const config = getConfig();
    if (!config.startDate) {
      setShowSetup(true);
    }
    setDayNumber(getDayNumber());
    setChecklist(getChecklist());
    setStreak(getCurrentStreak());
    setStartDateInput(config.startDate ?? new Date().toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = (key: keyof Omit<DailyChecklist, 'date' | 'workoutMode'>) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    updateChecklist({ [key]: !checklist[key] });
    setStreak(getCurrentStreak());
  };

  const handleSetup = () => {
    updateConfig({ startDate: startDateInput });
    setShowSetup(false);
    load();
  };

  const phase = getPhase(dayNumber);
  const completed = CHECKLIST_ITEMS.filter((i) => checklist[i.key]).length;
  const progress = Math.round((completed / CHECKLIST_ITEMS.length) * 100);

  const phaseColors: Record<string, string> = {
    'fat-loss': '#f97316',
    'muscle-build': '#3b82f6',
    definition: '#a855f7',
  };
  const phaseColor = phaseColors[phase.slug] ?? '#f97316';

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  if (showSetup) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          gap: '24px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '12px' }}>🔥</div>
          <h1
            style={{ fontSize: '28px', fontWeight: 800, color: '#f97316', marginBottom: '8px' }}
          >
            Welcome to FIT90
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.5 }}>
            Your 90-day transformation starts now.
            <br />
            When did you start?
          </p>
        </div>
        <div className="card" style={{ width: '100%', maxWidth: '380px' }}>
          <label
            style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}
          >
            Start Date
          </label>
          <input
            type="date"
            className="input-dark"
            value={startDateInput}
            onChange={(e) => setStartDateInput(e.target.value)}
          />
          <div style={{ marginTop: '16px' }}>
            <button className="btn-primary" onClick={handleSetup}>
              <Flame size={18} />
              Start My 90 Days
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 16px' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)',
          padding: '52px 20px 20px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>{today}</p>
            <h1
              className="gradient-text-orange"
              style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1.1 }}
            >
              Day {dayNumber}
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '20px' }}>
                /90
              </span>
            </h1>
            <span
              className="phase-badge"
              style={{
                marginTop: '8px',
                background: `${phaseColor}22`,
                color: phaseColor,
                border: `1px solid ${phaseColor}44`,
              }}
            >
              {phase.name}
            </span>
          </div>

          {/* Progress Ring */}
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <ProgressRing progress={progress} color={phaseColor} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                {completed}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/{CHECKLIST_ITEMS.length}</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{ display: 'flex', gap: '8px', marginTop: '16px' }}
        >
          <div
            style={{
              flex: 1,
              background: 'var(--surface2)',
              borderRadius: '12px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid var(--border)',
            }}
          >
            <Flame size={16} color="#f97316" />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>{streak}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Day Streak</div>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              background: 'var(--surface2)',
              borderRadius: '12px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid var(--border)',
            }}
          >
            <Target size={16} color={phaseColor} />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>{90 - dayNumber}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Days Left</div>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              background: 'var(--surface2)',
              borderRadius: '12px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid var(--border)',
            }}
          >
            <Zap size={16} color="#facc15" />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>{progress}%</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase progress bar */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{phase.days}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Day {dayNumber} of 90
          </span>
        </div>
        <div style={{ height: '4px', background: 'var(--surface3)', borderRadius: '100px' }}>
          <div
            style={{
              height: '100%',
              borderRadius: '100px',
              background: `linear-gradient(90deg, ${phaseColor}, ${phaseColor}99)`,
              width: `${Math.round((dayNumber / 90) * 100)}%`,
              transition: 'width 0.6s ease',
            }}
          />
        </div>
        {/* Phase markers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          {['Fat Loss', 'Muscle Build', 'Definition'].map((p, i) => (
            <span key={p} style={{ fontSize: '10px', color: dayNumber > i * 30 ? 'var(--text-muted)' : 'var(--border)' }}>
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Daily Checklist */}
      <div style={{ padding: '20px 20px 0' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>Daily Wins</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {CHECKLIST_ITEMS.map((item) => {
            const done = checklist[item.key] as boolean;
            return (
              <div
                key={item.key}
                className={`check-item${done ? ' checked' : ''}`}
                onClick={() => toggle(item.key)}
              >
                <span style={{ fontSize: '24px', flexShrink: 0 }}>{item.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: done ? 'var(--accent-green)' : 'var(--text)',
                      textDecoration: done ? 'none' : 'none',
                    }}
                  >
                    {item.label}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {item.sublabel}
                  </div>
                </div>
                {done ? (
                  <CheckCircle2 size={22} color="var(--accent-green)" />
                ) : (
                  <Circle size={22} color="var(--border)" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ padding: '20px 20px 0' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>Quick Actions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link href="/workout" style={{ textDecoration: 'none' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                background: 'var(--surface2)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#f9731622',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}
              >
                🏋️
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>Start Workout</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {phase.name} — {checklist.workout ? 'Done ✓' : 'Tap to begin'}
                </div>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
          </Link>

          <Link href="/nutrition" style={{ textDecoration: 'none' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                background: 'var(--surface2)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#22c55e22',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}
              >
                🥗
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>Log Food</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Target: 2100–2300 kcal · 180g protein</div>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
          </Link>

          <Link href="/progress" style={{ textDecoration: 'none' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                background: 'var(--surface2)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#3b82f622',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}
              >
                📊
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>Log Progress</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Weight, waist, photos</div>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
          </Link>
        </div>
      </div>

      {/* Motivational message */}
      {completed === CHECKLIST_ITEMS.length && (
        <div
          style={{
            margin: '20px',
            padding: '20px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #22c55e22, #16a34a11)',
            border: '1px solid #22c55e44',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
          <div style={{ fontWeight: 800, fontSize: '17px', color: '#22c55e' }}>Perfect Day!</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            All habits completed. You're building something real.
          </div>
        </div>
      )}
    </div>
  );
}
