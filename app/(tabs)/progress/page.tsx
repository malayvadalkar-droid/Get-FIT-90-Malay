'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, TrendingDown, TrendingUp, Camera } from 'lucide-react';
import {
  getProgressEntries,
  addProgressEntry,
  getDayNumber,
  getPhase,
  getWeeklyStats,
  getConfig,
} from '@/lib/storage';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { ProgressEntry } from '@/lib/types';

function StatCard({
  label,
  value,
  unit,
  change,
  color,
  emoji,
}: {
  label: string;
  value: number | null;
  unit: string;
  change?: number;
  color: string;
  emoji: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: 'var(--surface2)',
        borderRadius: '14px',
        padding: '14px',
        border: '1px solid var(--border)',
      }}
    >
      <div style={{ fontSize: '20px', marginBottom: '6px' }}>{emoji}</div>
      <div style={{ fontSize: '22px', fontWeight: 800, color: value !== null ? color : 'var(--text-muted)' }}>
        {value !== null ? `${value}` : '—'}
        <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>{unit}</span>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
      {change !== undefined && change !== 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            marginTop: '4px',
            fontSize: '12px',
            color: change < 0 ? '#22c55e' : '#ef4444',
          }}
        >
          {change < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
          {Math.abs(change).toFixed(1)}{unit} {change < 0 ? 'down' : 'up'}
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '10px 12px',
          fontSize: '13px',
        }}
      >
        <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color, fontWeight: 700 }}>
            {p.value} {p.name === 'weight' ? 'kg' : 'cm'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProgressPage() {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ weight: '', waist: '', notes: '' });
  const [dayNumber, setDayNumber] = useState(1);
  const [weeklyStats, setWeeklyStats] = useState<ReturnType<typeof getWeeklyStats> | null>(null);
  const [activeChart, setActiveChart] = useState<'weight' | 'waist'>('weight');

  const load = useCallback(() => {
    setEntries(getProgressEntries());
    setDayNumber(getDayNumber());
    setWeeklyStats(getWeeklyStats());
    // future: use config.currentWeight as baseline
    getConfig();
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const latest = entries[entries.length - 1] ?? null;
  const first = entries[0] ?? null;
  const weightChange =
    latest?.weight && first?.weight ? latest.weight - first.weight : undefined;
  const waistChange =
    latest?.waist && first?.waist ? latest.waist - first.waist : undefined;

  const phase = getPhase(dayNumber);
  const phaseColors: Record<string, string> = {
    'fat-loss': '#f97316',
    'muscle-build': '#3b82f6',
    definition: '#a855f7',
  };
  const phaseColor = phaseColors[phase.slug] ?? '#f97316';

  const chartData = entries.map((e) => ({
    date: e.date.slice(5), // MM-DD
    weight: e.weight,
    waist: e.waist,
  }));

  const handleSave = () => {
    const today = new Date().toISOString().split('T')[0];
    const entry: ProgressEntry = {
      date: today,
      weight: form.weight ? Number(form.weight) : undefined,
      waist: form.waist ? Number(form.waist) : undefined,
      notes: form.notes || undefined,
    };
    addProgressEntry(entry);
    setForm({ weight: '', waist: '', notes: '' });
    setShowForm(false);
    load();
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '2px' }}>Progress</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Day {dayNumber}/90 · {phase.name}
            </p>
          </div>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 16px', fontSize: '14px' }}
            onClick={() => setShowForm(true)}
          >
            <Plus size={16} />
            Log
          </button>
        </div>

        {/* Current stats */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <StatCard
            label="Current Weight"
            value={latest?.weight ?? null}
            unit="kg"
            change={weightChange}
            color="#3b82f6"
            emoji="⚖️"
          />
          <StatCard
            label="Waist"
            value={latest?.waist ?? null}
            unit="cm"
            change={waistChange}
            color="#f97316"
            emoji="📏"
          />
        </div>
      </div>

      {/* Weekly summary */}
      {weeklyStats && (
        <div style={{ padding: '16px 20px 0' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>This Week</h2>
          <div
            style={{
              background: 'var(--surface2)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '16px',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Workouts', value: `${weeklyStats.workoutsCompleted}/7`, color: phaseColor },
                { label: 'Avg Calories', value: weeklyStats.avgCalories || '—', color: '#22c55e' },
                { label: 'Avg Protein', value: weeklyStats.avgProtein ? `${weeklyStats.avgProtein}g` : '—', color: '#3b82f6' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {entries.length > 1 && (
        <div style={{ padding: '16px 20px 0' }}>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}
          >
            <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Trend</h2>
            <div
              style={{
                display: 'flex',
                gap: '6px',
                background: 'var(--surface2)',
                borderRadius: '10px',
                padding: '3px',
              }}
            >
              {(['weight', 'waist'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveChart(tab)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeChart === tab ? 'var(--surface3)' : 'transparent',
                    color: activeChart === tab ? 'var(--text)' : 'var(--text-muted)',
                    fontSize: '13px',
                    fontWeight: activeChart === tab ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {tab === 'weight' ? 'Weight' : 'Waist'}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              background: 'var(--surface2)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '16px 8px 8px',
            }}
          >
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#888899', fontSize: 11 }}
                  axisLine={{ stroke: '#2a2a3a' }}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: '#888899', fontSize: 11 }}
                  axisLine={{ stroke: '#2a2a3a' }}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey={activeChart}
                  stroke={activeChart === 'weight' ? '#3b82f6' : '#f97316'}
                  strokeWidth={2.5}
                  dot={{ fill: activeChart === 'weight' ? '#3b82f6' : '#f97316', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Photos placeholder */}
      <div style={{ padding: '16px 20px 0' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>Progress Photos</h2>
        <div
          style={{
            background: 'var(--surface2)',
            borderRadius: '16px',
            border: '2px dashed var(--border)',
            padding: '32px 20px',
            textAlign: 'center',
          }}
        >
          <Camera size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>Photo Tracking</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Take front, side, and back photos
            <br />
            weekly at the same time and lighting.
          </p>
          <div
            style={{
              marginTop: '16px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
            }}
          >
            {['Front', 'Side', 'Back'].map((pose) => (
              <div
                key={pose}
                style={{
                  background: 'var(--surface3)',
                  borderRadius: '10px',
                  padding: '14px 8px',
                  border: '1px solid var(--border)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                <Camera size={16} color="var(--text-muted)" style={{ margin: '0 auto 6px' }} />
                {pose}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px' }}>
            Photo upload coming in next update
          </p>
        </div>
      </div>

      {/* History */}
      {entries.length > 0 && (
        <div style={{ padding: '16px 20px 0' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...entries].reverse().slice(0, 10).map((e) => (
              <div
                key={e.date}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  background: 'var(--surface2)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>
                    {new Date(e.date).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                  {e.notes && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {e.notes}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', fontWeight: 700 }}>
                  {e.weight && (
                    <span style={{ color: '#3b82f6' }}>{e.weight}kg</span>
                  )}
                  {e.waist && (
                    <span style={{ color: '#f97316' }}>{e.waist}cm</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log form modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={() => setShowForm(false)}
        >
          <div
            style={{
              width: '100%',
              background: 'var(--surface)',
              borderRadius: '24px 24px 0 0',
              padding: '24px 20px 40px',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>
              Log Today&apos;s Progress
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                  Weight (kg)
                </label>
                <input
                  type="number"
                  className="input-dark"
                  placeholder="e.g. 78.5"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  step="0.1"
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                  Waist (cm)
                </label>
                <input
                  type="number"
                  className="input-dark"
                  placeholder="e.g. 85"
                  value={form.waist}
                  onChange={(e) => setForm({ ...form, waist: e.target.value })}
                  step="0.5"
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                  Notes (optional)
                </label>
                <input
                  type="text"
                  className="input-dark"
                  placeholder="How are you feeling?"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSave}>
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
