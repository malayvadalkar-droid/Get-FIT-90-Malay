'use client';

import { useState, useEffect, useCallback } from 'react';
import { Share2, Copy, Trophy } from 'lucide-react';
import {
  getDayNumber,
  getPhase,
  getChecklist,
  getWeeklyStats,
  getProgressEntries,
  getCurrentStreak,
} from '@/lib/storage';
import type { DailyChecklist } from '@/lib/types';

type CardType = 'daily' | 'weekly' | 'transformation';

function ShareCard({
  type,
  dayNumber,
  streak,
  weeklyStats,
  progressEntries,
  checklist,
}: {
  type: CardType;
  dayNumber: number;
  streak: number;
  weeklyStats: ReturnType<typeof getWeeklyStats>;
  progressEntries: ReturnType<typeof getProgressEntries>;
  checklist: DailyChecklist;
}) {
  const phase = getPhase(dayNumber);
  const phaseColors: Record<string, string> = {
    'fat-loss': '#f97316',
    'muscle-build': '#3b82f6',
    definition: '#a855f7',
  };
  const phaseColor = phaseColors[phase.slug] ?? '#f97316';
  const completedCount = [
    checklist.workout,
    checklist.steps,
    checklist.protein,
    checklist.water,
    checklist.sleep,
    checklist.noAlcohol,
  ].filter(Boolean).length;

  const first = progressEntries[0];
  const latest = progressEntries[progressEntries.length - 1];
  const weightChange = first?.weight && latest?.weight ? (latest.weight - first.weight).toFixed(1) : null;
  const waistChange = first?.waist && latest?.waist ? (latest.waist - first.waist).toFixed(1) : null;

  if (type === 'daily') {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1025 100%)',
          borderRadius: '20px',
          padding: '24px',
          border: `1px solid ${phaseColor}44`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: `${phaseColor}22`,
            filter: 'blur(40px)',
          }}
        />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                FIT90
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1.1 }}>
                <span style={{ color: phaseColor }}>Day {dayNumber}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>/90</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>STREAK</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#facc15' }}>🔥{streak}</div>
            </div>
          </div>

          <div
            style={{
              background: `${phaseColor}22`,
              borderRadius: '10px',
              padding: '8px 12px',
              marginBottom: '16px',
              display: 'inline-block',
              color: phaseColor,
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {phase.name}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {[
              { emoji: '🏋️', label: 'Workout', done: checklist.workout },
              { emoji: '👟', label: '10k Steps', done: checklist.steps },
              { emoji: '🥩', label: '180g P', done: checklist.protein },
              { emoji: '💧', label: '3L Water', done: checklist.water },
              { emoji: '😴', label: 'Sleep', done: checklist.sleep },
              { emoji: '🚫', label: 'No Alc', done: checklist.noAlcohol },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: item.done ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  padding: '8px',
                  textAlign: 'center',
                  border: `1px solid ${item.done ? '#22c55e44' : 'transparent'}`,
                }}
              >
                <div style={{ fontSize: '18px' }}>{item.done ? '✅' : item.emoji}</div>
                <div style={{ fontSize: '10px', color: item.done ? '#22c55e' : 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '6px',
              color: 'rgba(255,255,255,0.3)',
              fontSize: '11px',
            }}
          >
            <span>{completedCount}/6 habits · Day {dayNumber} of 90</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'weekly') {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #0d1117 0%, #0f1f2e 100%)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid #3b82f644',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: '#3b82f611',
            filter: 'blur(40px)',
          }}
        />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '11px', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            FIT90 · WEEKLY REPORT
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, marginBottom: '20px' }}>Week {Math.ceil(dayNumber / 7)}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Workouts', value: `${weeklyStats.workoutsCompleted}/7`, color: phaseColor, emoji: '🏋️' },
              { label: 'Avg Protein', value: weeklyStats.avgProtein ? `${weeklyStats.avgProtein}g` : '—', color: '#3b82f6', emoji: '🥩' },
              { label: 'Avg Calories', value: weeklyStats.avgCalories || '—', color: '#22c55e', emoji: '🔥' },
              { label: 'Days Logged', value: weeklyStats.daysLogged, color: '#a855f7', emoji: '📊' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: `${stat.color}11`,
                  borderRadius: '12px',
                  padding: '14px',
                  border: `1px solid ${stat.color}22`,
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.emoji}</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '16px',
              textAlign: 'center',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            Day {dayNumber} of 90 · {phase.name}
          </div>
        </div>
      </div>
    );
  }

  // Transformation card
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0a0010 0%, #1a0020 50%, #0a1020 100%)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid #a855f744',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: '#a855f711',
          filter: 'blur(50px)',
        }}
      />
      <div style={{ position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏆</div>
          <div style={{ fontSize: '11px', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '1px' }}>
            FIT90 · TRANSFORMATION
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, marginTop: '4px' }}>
            <span style={{ color: '#a855f7' }}>{dayNumber}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}> days in</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
          {weightChange && (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: Number(weightChange) < 0 ? '#22c55e' : '#ef4444',
                }}
              >
                {Number(weightChange) < 0 ? '' : '+'}{weightChange}kg
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Weight Change</div>
            </div>
          )}
          {waistChange && (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: Number(waistChange) < 0 ? '#22c55e' : '#ef4444',
                }}
              >
                {Number(waistChange) < 0 ? '' : '+'}{waistChange}cm
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Waist Change</div>
            </div>
          )}
          {!weightChange && !waistChange && (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
              Log weight & waist to see your transformation
            </div>
          )}
        </div>

        <div
          style={{
            background: 'rgba(168,85,247,0.1)',
            borderRadius: '12px',
            padding: '14px',
            textAlign: 'center',
            border: '1px solid rgba(168,85,247,0.2)',
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 700 }}>🔥 {streak}-Day Streak</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
            {phase.name} · {90 - dayNumber} days to go
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SharePage() {
  const [dayNumber, setDayNumber] = useState(1);
  const [streak, setStreak] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState<ReturnType<typeof getWeeklyStats> | null>(null);
  const [progressEntries, setProgressEntries] = useState<ReturnType<typeof getProgressEntries>>([]);
  const [checklist, setChecklist] = useState<DailyChecklist>({
    date: '',
    workout: false,
    steps: false,
    protein: false,
    water: false,
    sleep: false,
    noAlcohol: false,
  });
  const [activeCard, setActiveCard] = useState<CardType>('daily');
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    setDayNumber(getDayNumber());
    setStreak(getCurrentStreak());
    setWeeklyStats(getWeeklyStats());
    setProgressEntries(getProgressEntries());
    setChecklist(getChecklist());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!weeklyStats) return null;

  const shareText = {
    daily: `🔥 Day ${dayNumber}/90 on my FIT90 transformation! ${streak} day streak and counting. #FIT90 #Fitness`,
    weekly: `📊 Week ${Math.ceil(dayNumber / 7)} recap: ${weeklyStats.workoutsCompleted}/7 workouts, ${weeklyStats.avgProtein}g avg protein. Day ${dayNumber}/90. #FIT90`,
    transformation: `🏆 ${dayNumber} days into my 90-day transformation! Building something real. #FIT90 #Transformation`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText[activeCard]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ text: shareText[activeCard] });
    } else {
      handleCopy();
    }
  };

  return (
    <div style={{ paddingBottom: '20px' }}>
      {/* Header */}
      <div
        style={{
          background: 'var(--surface)',
          padding: '52px 20px 20px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '2px' }}>Share</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Show your progress to the world</p>

        {/* Card type selector */}
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
          {([
            { id: 'daily', label: '📅 Daily Win' },
            { id: 'weekly', label: '📊 Weekly' },
            { id: 'transformation', label: '🏆 Journey' },
          ] as { id: CardType; label: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveCard(t.id)}
              style={{
                flex: 1,
                padding: '9px 4px',
                borderRadius: '9px',
                border: 'none',
                background: activeCard === t.id ? 'var(--surface3)' : 'transparent',
                color: activeCard === t.id ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: activeCard === t.id ? 700 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card preview */}
      <div style={{ padding: '20px' }}>
        <ShareCard
          type={activeCard}
          dayNumber={dayNumber}
          streak={streak}
          weeklyStats={weeklyStats}
          progressEntries={progressEntries}
          checklist={checklist}
        />
      </div>

      {/* Share text */}
      <div style={{ padding: '0 20px 16px' }}>
        <div
          style={{
            background: 'var(--surface2)',
            borderRadius: '14px',
            padding: '14px',
            border: '1px solid var(--border)',
            marginBottom: '12px',
          }}
        >
          <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6 }}>
            {shareText[activeCard]}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-secondary"
            onClick={handleCopy}
            style={{ flex: 1 }}
          >
            <Copy size={16} />
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
          <button
            className="btn-primary"
            onClick={handleShare}
            style={{ flex: 1 }}
          >
            <Share2 size={16} />
            Share
          </button>
        </div>
      </div>

      {/* Milestones */}
      <div style={{ padding: '0 20px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>Milestones</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { day: 7, label: '1 Week In', emoji: '⭐', unlocked: dayNumber >= 7 },
            { day: 14, label: '2 Weeks Strong', emoji: '🌟', unlocked: dayNumber >= 14 },
            { day: 30, label: 'Phase 1 Complete', emoji: '🏅', unlocked: dayNumber >= 30 },
            { day: 60, label: 'Phase 2 Complete', emoji: '🥈', unlocked: dayNumber >= 60 },
            { day: 90, label: 'TRANSFORMATION COMPLETE', emoji: '🏆', unlocked: dayNumber >= 90 },
          ].map((m) => (
            <div
              key={m.day}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px',
                background: m.unlocked ? 'rgba(250,204,21,0.08)' : 'var(--surface2)',
                borderRadius: '14px',
                border: `1px solid ${m.unlocked ? '#facc1544' : 'var(--border)'}`,
                opacity: m.unlocked ? 1 : 0.5,
              }}
            >
              <span style={{ fontSize: '28px' }}>{m.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: m.unlocked ? 'var(--text)' : 'var(--text-muted)' }}>
                  {m.label}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Day {m.day}</div>
              </div>
              {m.unlocked && (
                <Trophy size={18} color="#facc15" />
              )}
              {!m.unlocked && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {m.day - dayNumber}d left
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
