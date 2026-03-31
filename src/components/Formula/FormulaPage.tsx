import React, { useState, useMemo } from 'react';
import type { Record } from '../../types';
import { BottomSheet } from '../Layout/BottomSheet';

interface FormulaPageProps {
  records: Record[];
  onAdd: (data: Omit<Record, 'id' | 'time' | 'updatedAt'>) => void;
  onUpdate: (record: Record) => void;
  onDelete: (id: string) => void;
}

const todayDateString = () => new Date().toLocaleDateString('en-CA');

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export const FormulaPage: React.FC<FormulaPageProps> = ({ records, onAdd, onUpdate, onDelete }) => {
  const [showCanForm, setShowCanForm] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [editRecord, setEditRecord] = useState<Record | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedPriceGroups, setExpandedPriceGroups] = useState<Set<string>>(new Set());

  // 奶粉使用記錄
  const canRecords = useMemo(() =>
    records.filter(r => r.type === 'formula_can' && !r.isDeleted),
    [records]
  );

  // 店家價格表
  const priceRecords = useMemo(() =>
    records.filter(r => r.type === 'formula_price' && !r.isDeleted),
    [records]
  );

  // 使用中
  const activeCans = useMemo(() =>
    canRecords.filter(r => !r.endTimestamp),
    [canRecords]
  );

  // 已用完，依品牌分群
  const finishedByBrand = useMemo(() => {
    const finished = canRecords.filter(r => r.endTimestamp);
    const map = new Map<string, Record[]>();
    finished.forEach(r => {
      const brand = r.subType || '未命名';
      if (!map.has(brand)) map.set(brand, []);
      map.get(brand)!.push(r);
    });
    return map;
  }, [canRecords]);

  // 使用中依品牌分群
  const activeByBrand = useMemo(() => {
    const map = new Map<string, Record[]>();
    activeCans.forEach(r => {
      const brand = r.subType || '未命名';
      if (!map.has(brand)) map.set(brand, []);
      map.get(brand)!.push(r);
    });
    return map;
  }, [activeCans]);

  // 價格表依品牌分群
  const priceByBrand = useMemo(() => {
    const map = new Map<string, Record[]>();
    priceRecords.forEach(r => {
      const brand = r.subType || '未命名';
      if (!map.has(brand)) map.set(brand, []);
      map.get(brand)!.push(r);
    });
    return map;
  }, [priceRecords]);

  // 既有品牌清單
  const brandOptions = useMemo(() => {
    const set = new Set<string>();
    canRecords.forEach(r => r.subType && set.add(r.subType));
    priceRecords.forEach(r => r.subType && set.add(r.subType));
    return Array.from(set).sort();
  }, [canRecords, priceRecords]);

  // 取得某品牌+店家的定價
  const getPriceForStoreAndBrand = (brand: string, store: string) => {
    const match = priceRecords.find(r => r.subType === brand && r.label === store);
    return match?.amount;
  };

  // 取得某品牌的店家清單
  const getStoresForBrand = (brand: string) => {
    const set = new Set<string>();
    priceRecords.filter(r => r.subType === brand && r.label).forEach(r => set.add(r.label!));
    canRecords.filter(r => r.subType === brand && r.label).forEach(r => set.add(r.label!));
    return Array.from(set).sort();
  };

  const toggleGroup = (brand: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(brand) ? next.delete(brand) : next.add(brand);
      return next;
    });
  };

  const togglePriceGroup = (brand: string) => {
    setExpandedPriceGroups(prev => {
      const next = new Set(prev);
      next.has(brand) ? next.delete(brand) : next.add(brand);
      return next;
    });
  };

  const totalSpentByBrand = (brand: string) => {
    return canRecords
      .filter(r => r.subType === brand && r.amount)
      .reduce((sum, r) => sum + (r.amount || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* 使用記錄 */}
      <section>
        <h3 className="text-xs text-slate-400 uppercase tracking-widest mb-3">使用記錄</h3>

        {/* 使用中 */}
        {activeByBrand.size > 0 && (
          <div className="space-y-3 mb-4">
            <p className="text-[11px] text-indigo-500 font-semibold uppercase tracking-wider">使用中</p>
            {Array.from(activeByBrand.entries()).map(([brand, cans]) => (
              <div key={brand} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center px-4 py-3 border-b border-slate-50 dark:border-slate-700">
                  <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{brand}</span>
                  <span className="text-xs text-slate-400">
                    共 ${totalSpentByBrand(brand).toLocaleString()}
                  </span>
                </div>
                {cans.map(can => (
                  <CanRow
                    key={can.id}
                    can={can}
                    onEdit={() => { setEditRecord(can); setShowCanForm(true); }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* 已用完 */}
        {finishedByBrand.size > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">已用完</p>
            {Array.from(finishedByBrand.entries()).map(([brand, cans]) => {
              const expanded = expandedGroups.has(brand);
              return (
                <div key={brand} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                  <button
                    className="w-full flex justify-between items-center px-4 py-3 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
                    onClick={() => toggleGroup(brand)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{brand}</span>
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[11px] px-2 py-0.5 rounded-full">
                        {cans.length} 罐
                      </span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600 text-sm">{expanded ? '▾' : '▸'}</span>
                  </button>
                  {expanded && (
                    <div className="border-t border-slate-50 dark:border-slate-700">
                      {cans.map(can => (
                        <CanRow
                          key={can.id}
                          can={can}
                          onEdit={() => { setEditRecord(can); setShowCanForm(true); }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {canRecords.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-8">
            <span className="text-4xl opacity-30">🍼</span>
            <p className="text-xs text-slate-400 text-center">還沒有奶粉記錄</p>
            <button
              onClick={() => { setEditRecord(null); setShowCanForm(true); }}
              className="text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full font-semibold active:scale-95 transition-all"
            >
              + 新增第一罐
            </button>
          </div>
        )}
      </section>

      {/* 店家價格表 */}
      <section>
        <h3 className="text-xs text-slate-400 uppercase tracking-widest mb-3">店家價格表</h3>
        {priceByBrand.size > 0 ? (
          <div className="space-y-2">
            {Array.from(priceByBrand.entries()).map(([brand, prices]) => {
              const expanded = expandedPriceGroups.has(brand);
              return (
                <div key={brand} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                  <button
                    className="w-full flex justify-between items-center px-4 py-3 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
                    onClick={() => togglePriceGroup(brand)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{brand}</span>
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[11px] px-2 py-0.5 rounded-full">
                        {prices.length} 間
                      </span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600 text-sm">{expanded ? '▾' : '▸'}</span>
                  </button>
                  {expanded && (
                    <div className="border-t border-slate-50 dark:border-slate-700">
                      {prices.map(p => (
                        <div key={p.id} className="flex justify-between items-center px-4 py-3 border-b border-slate-50 dark:border-slate-700 last:border-0">
                          <span className="text-sm text-slate-600 dark:text-slate-300">{p.label}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-indigo-600">${(p.amount || 0).toLocaleString()}</span>
                            <button
                              onClick={() => { setEditRecord(p); setShowPriceForm(true); }}
                              className="text-xs text-slate-400 active:text-indigo-500 transition-colors"
                            >
                              ✏️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-slate-300 dark:text-slate-600 text-sm py-4">還沒有價格記錄</p>
        )}
      </section>

      {/* 底部按鈕 */}
      <div className="flex gap-3 pb-2">
        <button
          onClick={() => { setEditRecord(null); setShowCanForm(true); }}
          className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl text-sm font-medium shadow active:scale-95 transition-all"
        >
          + 新增一罐
        </button>
        <button
          onClick={() => { setEditRecord(null); setShowPriceForm(true); }}
          className="flex-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 py-3.5 rounded-2xl text-sm font-medium active:scale-95 transition-all"
        >
          + 新增價格
        </button>
      </div>

      {/* 新增/編輯一罐 */}
      <BottomSheet
        isOpen={showCanForm}
        onClose={() => { setShowCanForm(false); setEditRecord(null); }}
        title={editRecord ? '編輯奶粉記錄' : '新增一罐'}
      >
        <CanForm
          initial={editRecord?.type === 'formula_can' ? editRecord : null}
          brandOptions={brandOptions}
          getStoresForBrand={getStoresForBrand}
          getPriceForStoreAndBrand={getPriceForStoreAndBrand}
          onSave={(data) => {
            if (editRecord) {
              onUpdate({ ...editRecord, ...data, updatedAt: Date.now() });
            } else {
              onAdd({ ...data, type: 'formula_can' } as Omit<Record, 'id' | 'time' | 'updatedAt'>);
            }
            setShowCanForm(false);
            setEditRecord(null);
          }}
          onDelete={editRecord ? () => { onDelete(editRecord.id); setShowCanForm(false); setEditRecord(null); } : undefined}
          onCancel={() => { setShowCanForm(false); setEditRecord(null); }}
        />
      </BottomSheet>

      {/* 新增/編輯價格 */}
      <BottomSheet
        isOpen={showPriceForm}
        onClose={() => { setShowPriceForm(false); setEditRecord(null); }}
        title={editRecord ? '編輯店家價格' : '新增店家價格'}
      >
        <PriceForm
          initial={editRecord?.type === 'formula_price' ? editRecord : null}
          brandOptions={brandOptions}
          onSave={(data) => {
            if (editRecord) {
              onUpdate({ ...editRecord, ...data, updatedAt: Date.now() });
            } else {
              onAdd({ ...data, type: 'formula_price' } as Omit<Record, 'id' | 'time' | 'updatedAt'>);
            }
            setShowPriceForm(false);
            setEditRecord(null);
          }}
          onDelete={editRecord ? () => { onDelete(editRecord.id); setShowPriceForm(false); setEditRecord(null); } : undefined}
          onCancel={() => { setShowPriceForm(false); setEditRecord(null); }}
        />
      </BottomSheet>
    </div>
  );
};

// ── CanRow ──────────────────────────────────────────────────────────────────
const CanRow: React.FC<{ can: Record; onEdit: () => void }> = ({ can, onEdit }) => (
  <div className="flex justify-between items-center px-4 py-3 border-b border-slate-50 dark:border-slate-700 last:border-0">
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {can.label || '—'}
        {can.amount ? <span className="ml-2 text-indigo-500">${can.amount.toLocaleString()}</span> : null}
      </span>
      <span className="text-[11px] text-slate-400">
        {formatDate(can.timestamp)} → {can.endTimestamp ? formatDate(can.endTimestamp) : <span className="text-emerald-500">使用中</span>}
      </span>
    </div>
    <button onClick={onEdit} className="text-slate-300 active:text-indigo-500 transition-colors text-sm px-2">✏️</button>
  </div>
);

// ── CanForm ──────────────────────────────────────────────────────────────────
interface CanFormProps {
  initial: Record | null;
  brandOptions: string[];
  getStoresForBrand: (brand: string) => string[];
  getPriceForStoreAndBrand: (brand: string, store: string) => number | undefined;
  onSave: (data: Partial<Record>) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const CanForm: React.FC<CanFormProps> = ({
  initial, brandOptions, getStoresForBrand, getPriceForStoreAndBrand,
  onSave, onDelete, onCancel,
}) => {
  const [brandInput, setBrandInput] = useState(initial?.subType || '');
  const [storeInput, setStoreInput] = useState(initial?.label || '');
  const [amount, setAmount] = useState(initial?.amount?.toString() || '');
  const [openDate, setOpenDate] = useState(
    initial ? new Date(initial.timestamp).toLocaleDateString('en-CA') : todayDateString()
  );
  const [finishDate, setFinishDate] = useState(
    initial?.endTimestamp ? new Date(initial.endTimestamp).toLocaleDateString('en-CA') : ''
  );
  const [note, setNote] = useState(initial?.note || '');

  const storeOptions = getStoresForBrand(brandInput);

  const handleBrandChange = (val: string) => {
    setBrandInput(val);
  };

  const handleStoreChange = (val: string) => {
    setStoreInput(val);
    const price = getPriceForStoreAndBrand(brandInput, val);
    if (price !== undefined) setAmount(price.toString());
  };

  const handleSave = () => {
    if (!brandInput.trim()) return;
    const ts = new Date(openDate).getTime();
    const endTs = finishDate ? new Date(finishDate).getTime() : undefined;
    onSave({
      subType: brandInput.trim(),
      label: storeInput.trim() || undefined,
      amount: amount ? Number(amount) : undefined,
      timestamp: ts,
      endTimestamp: endTs,
      note: note.trim() || undefined,
    });
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="space-y-1">
        <label className="text-xs text-slate-400 uppercase tracking-wider">奶粉名稱</label>
        <input
          list="brand-options"
          value={brandInput}
          onChange={e => handleBrandChange(e.target.value)}
          placeholder="例：明治一段"
          className="w-full p-3.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm"
        />
        <datalist id="brand-options">
          {brandOptions.map(b => <option key={b} value={b} />)}
        </datalist>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400 uppercase tracking-wider">店家</label>
        <input
          list="store-options"
          value={storeInput}
          onChange={e => handleStoreChange(e.target.value)}
          placeholder="例：好市多"
          className="w-full p-3.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm"
        />
        <datalist id="store-options">
          {storeOptions.map(s => <option key={s} value={s} />)}
        </datalist>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400 uppercase tracking-wider">金額</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0"
          className="w-full p-3.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-400 uppercase tracking-wider">開瓶日期</label>
          <input
            type="date"
            value={openDate}
            onChange={e => setOpenDate(e.target.value)}
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400 uppercase tracking-wider">用完日期</label>
          <input
            type="date"
            value={finishDate}
            onChange={e => setFinishDate(e.target.value)}
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400 uppercase tracking-wider">備註</label>
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="可選"
          className="w-full p-3.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-sm active:scale-95 transition-all"
        >
          取消
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="py-3.5 px-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 text-sm active:scale-95 transition-all"
          >
            刪除
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!brandInput.trim()}
          className="flex-1 py-3.5 rounded-2xl bg-indigo-600 text-white text-sm font-medium shadow active:scale-95 transition-all disabled:opacity-40"
        >
          儲存
        </button>
      </div>
    </div>
  );
};

// ── PriceForm ────────────────────────────────────────────────────────────────
interface PriceFormProps {
  initial: Record | null;
  brandOptions: string[];
  onSave: (data: Partial<Record>) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const PriceForm: React.FC<PriceFormProps> = ({ initial, brandOptions, onSave, onDelete, onCancel }) => {
  const [brandInput, setBrandInput] = useState(initial?.subType || '');
  const [storeInput, setStoreInput] = useState(initial?.label || '');
  const [amount, setAmount] = useState(initial?.amount?.toString() || '');

  const handleSave = () => {
    if (!brandInput.trim() || !storeInput.trim()) return;
    onSave({
      subType: brandInput.trim(),
      label: storeInput.trim(),
      amount: amount ? Number(amount) : undefined,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="space-y-1">
        <label className="text-xs text-slate-400 uppercase tracking-wider">奶粉名稱</label>
        <input
          list="price-brand-options"
          value={brandInput}
          onChange={e => setBrandInput(e.target.value)}
          placeholder="例：明治一段"
          className="w-full p-3.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm"
        />
        <datalist id="price-brand-options">
          {brandOptions.map(b => <option key={b} value={b} />)}
        </datalist>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400 uppercase tracking-wider">店家</label>
        <input
          type="text"
          value={storeInput}
          onChange={e => setStoreInput(e.target.value)}
          placeholder="例：好市多"
          className="w-full p-3.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400 uppercase tracking-wider">定價</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0"
          className="w-full p-3.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-sm active:scale-95 transition-all"
        >
          取消
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="py-3.5 px-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 text-sm active:scale-95 transition-all"
          >
            刪除
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!brandInput.trim() || !storeInput.trim()}
          className="flex-1 py-3.5 rounded-2xl bg-indigo-600 text-white text-sm font-medium shadow active:scale-95 transition-all disabled:opacity-40"
        >
          儲存
        </button>
      </div>
    </div>
  );
};
