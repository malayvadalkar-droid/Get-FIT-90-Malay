'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Search, X } from 'lucide-react';
import { getNutritionEntry, addFoodItem, removeFoodItem, updateChecklist } from '@/lib/storage';
import { QUICK_ADD_FOODS, NUTRITION_TARGETS } from '@/lib/data/nutrition';
import type { NutritionEntry, FoodItem } from '@/lib/types';

function MacroBar({
  label,
  value,
  target,
  color,
  unit = 'g',
}: {
  label: string;
  value: number;
  target: number;
  color: string;
  unit?: string;
}) {
  const pct = Math.min((value / target) * 100, 100);
  const over = value > target;
  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '5px',
          fontSize: '12px',
        }}
      >
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontWeight: 700, color: over ? '#ef4444' : 'var(--text)' }}>
          {value}
          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/{target}{unit}</span>
        </span>
      </div>
      <div style={{ height: '6px', background: 'var(--surface3)', borderRadius: '100px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            borderRadius: '100px',
            background: over ? '#ef4444' : color,
            width: `${pct}%`,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}

function CalorieRing({ calories, target }: { calories: number; target: number }) {
  const size = 110;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(calories / target, 1);
  const offset = circ * (1 - pct);
  const color = calories > target ? '#ef4444' : '#22c55e';

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
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
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
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
        <span style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1, color }}>{calories}</span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>kcal</span>
      </div>
    </div>
  );
}

export default function NutritionPage() {
  const [entry, setEntry] = useState<NutritionEntry>({
    date: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    items: [],
  });
  const [search, setSearch] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customItem, setCustomItem] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    quantity: '1',
  });

  const load = useCallback(() => {
    setEntry(getNutritionEntry());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-check protein goal
  useEffect(() => {
    if (entry.protein >= NUTRITION_TARGETS.protein.min) {
      updateChecklist({ protein: true });
    }
  }, [entry.protein]);

  const filtered = QUICK_ADD_FOODS.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleQuickAdd = (food: typeof QUICK_ADD_FOODS[number]) => {
    const item: FoodItem = { ...food, id: `${food.id}-${Date.now()}`, quantity: 1 };
    addFoodItem(item);
    load();
  };

  const handleRemove = (itemId: string) => {
    removeFoodItem(itemId);
    load();
  };

  const handleCustomAdd = () => {
    if (!customItem.name || !customItem.calories) return;
    const item: FoodItem = {
      id: `custom-${Date.now()}`,
      name: customItem.name,
      calories: Number(customItem.calories),
      protein: Number(customItem.protein) || 0,
      carbs: Number(customItem.carbs) || 0,
      fat: Number(customItem.fat) || 0,
      quantity: Number(customItem.quantity) || 1,
      unit: 'serving',
    };
    addFoodItem(item);
    setCustomItem({ name: '', calories: '', protein: '', carbs: '', fat: '', quantity: '1' });
    setShowCustom(false);
    setShowAddPanel(false);
    load();
  };

  const remaining = Math.max(0, NUTRITION_TARGETS.calories.max - entry.calories);

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
        <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '2px' }}>Nutrition</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Target: 2100–2300 kcal · 180g protein
        </p>

        {/* Calorie overview */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <CalorieRing
            calories={entry.calories}
            target={NUTRITION_TARGETS.calories.max}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <MacroBar
              label="Protein"
              value={entry.protein}
              target={NUTRITION_TARGETS.protein.min}
              color="#3b82f6"
            />
            <MacroBar
              label="Carbs"
              value={entry.carbs}
              target={NUTRITION_TARGETS.carbs.max}
              color="#f97316"
            />
            <MacroBar
              label="Fat"
              value={entry.fat}
              target={NUTRITION_TARGETS.fat.max}
              color="#a855f7"
            />
          </div>
        </div>

        {/* Remaining */}
        <div
          style={{
            marginTop: '14px',
            padding: '10px 14px',
            background: 'var(--surface2)',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '13px',
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>Calories remaining</span>
          <span style={{ fontWeight: 700, color: remaining > 0 ? '#22c55e' : '#ef4444' }}>
            {entry.calories > NUTRITION_TARGETS.calories.max
              ? `+${entry.calories - NUTRITION_TARGETS.calories.max} over`
              : `${remaining} left`}
          </span>
        </div>
      </div>

      {/* Protein goal status */}
      {entry.protein >= NUTRITION_TARGETS.protein.min && (
        <div
          style={{
            margin: '16px 20px 0',
            padding: '10px 14px',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid #22c55e44',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>✅</span>
          <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: 600 }}>
            Protein goal hit! {entry.protein}g / {NUTRITION_TARGETS.protein.min}g
          </span>
        </div>
      )}

      {/* Food log */}
      <div style={{ padding: '20px 20px 0' }}>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}
        >
          <h2 style={{ fontSize: '17px', fontWeight: 700 }}>
            Today&apos;s Log
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '14px' }}>
              {' '}({entry.items.length} items)
            </span>
          </h2>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 16px', fontSize: '14px' }}
            onClick={() => setShowAddPanel(true)}
          >
            <Plus size={16} />
            Add Food
          </button>
        </div>

        {entry.items.length === 0 ? (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              background: 'var(--surface2)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🥗</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              No food logged yet.
              <br />
              Tap Add Food to get started.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {entry.items.map((item) => (
              <div
                key={item.id}
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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {item.calories * item.quantity} kcal ·{' '}
                    <span style={{ color: '#3b82f6' }}>{item.protein * item.quantity}g P</span>
                    {' · '}
                    <span style={{ color: '#f97316' }}>{item.carbs * item.quantity}g C</span>
                    {' · '}
                    <span style={{ color: '#a855f7' }}>{item.fat * item.quantity}g F</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add food panel */}
      {showAddPanel && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={() => setShowAddPanel(false)}
        >
          <div
            style={{
              width: '100%',
              background: 'var(--surface)',
              borderRadius: '24px 24px 0 0',
              padding: '20px',
              maxHeight: '88vh',
              overflowY: 'auto',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Add Food</h3>
              <button
                onClick={() => setShowAddPanel(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="input-dark"
                placeholder="Search foods..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>

            {/* Custom entry toggle */}
            <button
              className="btn-secondary"
              style={{ marginBottom: '16px', fontSize: '13px', padding: '10px 16px' }}
              onClick={() => setShowCustom(!showCustom)}
            >
              <Plus size={14} />
              {showCustom ? 'Hide' : 'Add custom item'}
            </button>

            {showCustom && (
              <div
                style={{
                  background: 'var(--surface2)',
                  borderRadius: '14px',
                  padding: '14px',
                  marginBottom: '16px',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    className="input-dark"
                    placeholder="Food name"
                    value={customItem.name}
                    onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input
                      className="input-dark"
                      placeholder="Calories"
                      type="number"
                      value={customItem.calories}
                      onChange={(e) => setCustomItem({ ...customItem, calories: e.target.value })}
                    />
                    <input
                      className="input-dark"
                      placeholder="Protein (g)"
                      type="number"
                      value={customItem.protein}
                      onChange={(e) => setCustomItem({ ...customItem, protein: e.target.value })}
                    />
                    <input
                      className="input-dark"
                      placeholder="Carbs (g)"
                      type="number"
                      value={customItem.carbs}
                      onChange={(e) => setCustomItem({ ...customItem, carbs: e.target.value })}
                    />
                    <input
                      className="input-dark"
                      placeholder="Fat (g)"
                      type="number"
                      value={customItem.fat}
                      onChange={(e) => setCustomItem({ ...customItem, fat: e.target.value })}
                    />
                  </div>
                  <button className="btn-primary" onClick={handleCustomAdd}>
                    Add Custom Item
                  </button>
                </div>
              </div>
            )}

            {/* Quick-add list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filtered.map((food) => (
                <div
                  key={food.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'var(--surface2)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    handleQuickAdd(food);
                    setShowAddPanel(false);
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{food.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {food.calories} kcal ·{' '}
                      <span style={{ color: '#3b82f6' }}>{food.protein}g protein</span>
                    </div>
                  </div>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--accent-orange)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Plus size={16} color="white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
