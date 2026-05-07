import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import type { Record } from '../../types';
import { inferIngredients } from '../../utils/ingredientInference';

interface SolidFoodStatsPageProps {
  records: Record[];
  onUpdateIngredients: (label: string, newIngredients: string[]) => void;
}

interface FoodGroup {
  label: string;
  count: number;
  totalGrams: number;
  latestTimestamp: number;
  latestGrams: number;
  history: { timestamp: number; grams: number }[];
  ingredients: string[];
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const LONG_PRESS_MS = 500;

interface IngredientSheetProps {
  label: string;
  current: string[];
  suggested: string[];
  allUsed: string[];
  onAdd: (ingredient: string) => void;
  onClose: () => void;
}

const IngredientSheet: React.FC<IngredientSheetProps> = ({ label, current, suggested, allUsed, onAdd, onClose }) => {
  const [input, setInput] = useState('');
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  // Track keyboard height via visualViewport so sheet slides above keyboard on iOS
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardOffset(offset);
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  const filteredSuggested = useMemo(
    () => suggested.filter(i => !current.includes(i)),
    [suggested, current]
  );

  const filteredHistory = useMemo(() => {
    const q = input.trim().toLowerCase();
    return allUsed.filter(i => !current.includes(i) && (q === '' || i.includes(q)));
  }, [allUsed, current, input]);

  const handleAdd = (ingredient: string) => {
    const trimmed = ingredient.trim();
    if (trimmed && !current.includes(trimmed)) {
      onAdd(trimmed);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      handleAdd(input);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl p-5 pb-8 max-h-[75vh] overflow-y-auto transition-[margin] duration-150"
        style={{ marginBottom: keyboardOffset }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
          「{label}」的食材
        </p>

        {/* Chips first — visible without triggering keyboard */}
        {filteredSuggested.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">💡 自動建議</p>
            <div className="flex flex-wrap gap-2">
              {filteredSuggested.map(i => (
                <button
                  key={i}
                  className="px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 rounded-full text-sm font-medium"
                  onClick={() => handleAdd(i)}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredHistory.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">📌 已新增過的食材</p>
            <div className="flex flex-wrap gap-2">
              {filteredHistory.map(i => (
                <button
                  key={i}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-full text-sm"
                  onClick={() => handleAdd(i)}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input below chips — keyboard appears only when user taps here */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-xl px-3 py-2">
          <input
            className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 outline-none placeholder-slate-400"
            placeholder="輸入新食材名稱..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {input.trim() && (
            <button
              className="text-xs bg-green-500 text-white rounded-lg px-2.5 py-1 font-medium"
              onClick={() => handleAdd(input)}
            >
              新增
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const SolidFoodStatsPage: React.FC<SolidFoodStatsPageProps> = ({ records, onUpdateIngredients }) => {
  const [expandedFood, setExpandedFood] = useState<string | null>(null);
  const [sheetLabel, setSheetLabel] = useState<string | null>(null);
  const [showIngredientList, setShowIngredientList] = useState(false);

  const groups = useMemo<FoodGroup[]>(() => {
    const map = new Map<string, FoodGroup>();
    records
      .filter(r => !r.isDeleted && r.type === 'babyfood' && r.label)
      .forEach(r => {
        const label = r.label!;
        if (!map.has(label)) {
          map.set(label, { label, count: 0, totalGrams: 0, latestTimestamp: 0, latestGrams: 0, history: [], ingredients: [] });
        }
        const g = map.get(label)!;
        g.count += 1;
        g.totalGrams += r.amount || 0;
        g.history.push({ timestamp: r.timestamp, grams: r.amount || 0 });
        if (r.timestamp > g.latestTimestamp) {
          g.latestTimestamp = r.timestamp;
          g.latestGrams = r.amount || 0;
        }
        if (g.ingredients.length === 0 && r.ingredients && r.ingredients.length > 0) {
          g.ingredients = r.ingredients;
        }
      });

    return Array.from(map.values())
      .map(g => ({ ...g, history: [...g.history].sort((a, b) => b.timestamp - a.timestamp) }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  // 所有已標記食材的聯集
  const allUsedIngredients = useMemo<string[]>(() => {
    const set = new Set<string>();
    groups.forEach(g => g.ingredients.forEach(i => set.add(i)));
    return Array.from(set);
  }, [groups]);

  // 已嘗試唯一食材數
  const uniqueIngredientCount = allUsedIngredients.length;

  // ingredient → 出現的 label 清單
  const ingredientToLabels = useMemo(() => {
    const map = new Map<string, string[]>();
    groups.forEach(g => {
      g.ingredients.forEach(i => {
        if (!map.has(i)) map.set(i, []);
        map.get(i)!.push(g.label);
      });
    });
    return map;
  }, [groups]);

  const toggleExpand = useCallback((label: string) => {
    setExpandedFood(prev => (prev === label ? null : label));
    try { navigator.vibrate?.(10); } catch {}
  }, []);

  const handleRemoveIngredient = (label: string, ingredient: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const group = groups.find(g => g.label === label);
    if (!group) return;
    const updated = group.ingredients.filter(i => i !== ingredient);
    onUpdateIngredients(label, updated);
  };

  const handleAddIngredient = (label: string, ingredient: string) => {
    const group = groups.find(g => g.label === label);
    if (!group) return;
    if (group.ingredients.includes(ingredient)) return;
    onUpdateIngredients(label, [...group.ingredients, ingredient]);
  };

  const activeGroup = sheetLabel ? groups.find(g => g.label === sheetLabel) : null;

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <span className="text-5xl">🥣</span>
        <p className="text-slate-400 dark:text-slate-500 text-sm">還沒有副食品記錄</p>
        <p className="text-slate-300 dark:text-slate-600 text-xs">從日常頁點「＋」新增副食品記錄</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* 食材多樣性摘要 */}
        <button
          className="w-full bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl px-5 py-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform duration-150"
          onClick={() => uniqueIngredientCount > 0 && setShowIngredientList(true)}
        >
          <span className="text-2xl">🥬</span>
          <div className="flex-1 text-left">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">已嘗試食材種類</p>
            <p className="text-xl font-bold text-green-700 dark:text-green-300">
              {uniqueIngredientCount} <span className="text-sm font-normal">種</span>
            </p>
          </div>
          {uniqueIngredientCount > 0 && (
            <span className="text-xs text-green-400 dark:text-green-600">點擊查看 ›</span>
          )}
        </button>

        {groups.map(g => (
          <div key={g.label}>
            <div
              className={`bg-white dark:bg-slate-800 rounded-2xl px-5 py-4 shadow-sm border border-slate-100 dark:border-slate-700 select-none cursor-pointer active:scale-[0.99] transition-transform duration-100 ${
                expandedFood === g.label ? 'rounded-b-none border-b-0' : ''
              }`}
              onClick={() => toggleExpand(g.label)}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-800 dark:text-slate-100">{g.label}</span>
                <span className="text-slate-300 dark:text-slate-600 text-sm leading-none">
                  {expandedFood === g.label ? '∧' : '∨'}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                <span>共 <b className="text-slate-700 dark:text-slate-200">{g.count}</b> 次</span>
                <span>·</span>
                <span>總計 <b className="text-slate-700 dark:text-slate-200">{g.totalGrams}g</b></span>
              </div>
              <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                最近：{formatTime(g.latestTimestamp)} · {g.latestGrams}g
              </div>

              {/* 食材標籤區 */}
              <div className="mt-2.5" onClick={e => e.stopPropagation()}>
                {g.ingredients.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {g.ingredients.map(ingredient => (
                        <span
                          key={ingredient}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 rounded-full text-xs font-medium"
                        >
                          {ingredient}
                          <button
                            className="text-green-400 dark:text-green-500 hover:text-green-600 dark:hover:text-green-300 leading-none"
                            onClick={e => handleRemoveIngredient(g.label, ingredient, e)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <button
                      className="text-xs text-slate-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors py-1"
                      onClick={() => setSheetLabel(g.label)}
                    >
                      ＋ 新增食材
                    </button>
                  </>
                ) : (
                  <button
                    className="w-full py-2 border border-dashed border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-400 dark:text-slate-500 hover:border-green-300 dark:hover:border-green-700 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    onClick={() => setSheetLabel(g.label)}
                  >
                    ＋ 標記食材
                  </button>
                )}
              </div>
            </div>

            {expandedFood === g.label && (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-b-2xl border border-t-0 border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
                {g.history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{formatTime(h.timestamp)}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{h.grams}g</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {sheetLabel && activeGroup && (
        <IngredientSheet
          label={sheetLabel}
          current={activeGroup.ingredients}
          suggested={inferIngredients(sheetLabel)}
          allUsed={allUsedIngredients.filter(i => !activeGroup.ingredients.includes(i))}
          onAdd={ingredient => handleAddIngredient(sheetLabel, ingredient)}
          onClose={() => setSheetLabel(null)}
        />
      )}

      {showIngredientList && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/40" onClick={() => setShowIngredientList(false)}>
          <div
            className="w-full bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl p-5 pb-10 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              已嘗試食材種類
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
              共 {uniqueIngredientCount} 種
            </p>
            <div className="space-y-2.5">
              {[...allUsedIngredients].sort((a, b) => a.localeCompare(b, 'zh-TW')).map(ingredient => {
                const labels = ingredientToLabels.get(ingredient) ?? [];
                return (
                  <div key={ingredient} className="flex items-start justify-between gap-3 py-2.5 border-b border-slate-50 dark:border-slate-700 last:border-0">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{ingredient}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 text-right shrink-0 max-w-[55%] leading-relaxed">
                      {labels.join('、')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
