import React, { useState, useEffect, useMemo } from 'react';
import type { Record, RecordType, MilkType } from '../../types';
import { formatLocalValue } from '../../utils/dateUtils';
import { inferIngredients } from '../../utils/ingredientInference';

interface RecordFormProps {
  isEditing: string | null;
  records: Record[];
  onSave: (recordData: any) => void;
  onCancel: () => void;
  activeSleep: Record | null;
  onStartSleep: (time: string) => void;
  onFinishSleep: () => void;
  solidFoodLabels: string[];
  medicationLabels: string[];
  defaultType?: RecordType;
}

export const RecordForm: React.FC<RecordFormProps> = ({
  isEditing, records, onSave, onCancel, activeSleep, onStartSleep, onFinishSleep, solidFoodLabels, medicationLabels, defaultType,
}) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!activeSleep) return;
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, [activeSleep]);

  const [type, setType] = useState<RecordType>(defaultType || 'feeding');
  const [milkType, setMilkType] = useState<MilkType>('breast');
  const [amount, setAmount] = useState<number>(180);
  const [weight, setWeight] = useState<number>(3.5);
  const [height, setHeight] = useState<number>(50);
  const [note, setNote] = useState<string>('');
  const [recordTime, setRecordTime] = useState<string>('');
  const [recordEndTime, setRecordEndTime] = useState<string>('');
  const [foodCategory, setFoodCategory] = useState('');
  const [foodName, setFoodName] = useState('');
  const [foodGrams, setFoodGrams] = useState(30);
  const [foodIngredients, setFoodIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [temperature, setTemperature] = useState(36.5);
  const [medName, setMedName] = useState('');
  const [medAmount, setMedAmount] = useState<number | ''>('');
  const [medUnit, setMedUnit] = useState('mg');

  useEffect(() => {
    if (isEditing) {
      const r = records.find((rec) => rec.id === isEditing);
      if (r) {
        setType(r.type);
        if (r.milkType) setMilkType(r.milkType);
        if (r.amount) setAmount(r.amount);
        if (r.weight) setWeight(r.weight);
        if (r.height) setHeight(r.height);
        if (r.note) setNote(r.note);
        setRecordTime(formatLocalValue(new Date(r.timestamp)));
        if (r.type === 'sleep' && r.endTimestamp) {
          setRecordEndTime(formatLocalValue(new Date(r.endTimestamp)));
        } else {
          setRecordEndTime('');
        }
        if (r.type === 'medication') {
          setMedName(r.label || '');
          setMedAmount(r.amount ?? '');
          setMedUnit(r.subType || 'mg');
        }
        if (r.type === 'babyfood') {
          setFoodName(r.label || '');
          setFoodCategory(r.subType || '');
          setFoodGrams(r.amount ?? 30);
          setFoodIngredients(r.ingredients ?? []);
        }
      }
    } else {
      setRecordTime(formatLocalValue(new Date()));
    }
  }, [isEditing, records]);

  useEffect(() => {
    if (!isEditing) setRecordTime(formatLocalValue(new Date()));
  }, [type, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type,
      milkType: type === 'feeding' ? milkType : undefined,
      amount: type === 'feeding' || type === 'sleep' ? amount
        : type === 'babyfood' ? foodGrams
        : type === 'temperature' ? temperature
        : type === 'medication' ? (medAmount === '' ? undefined : medAmount)
        : undefined,
      weight: type === 'growth' ? weight : undefined,
      height: type === 'growth' ? height : undefined,
      subType: type === 'babyfood' ? foodCategory : type === 'medication' ? medUnit : undefined,
      label: type === 'babyfood' ? foodName : type === 'medication' ? medName : undefined,
      ingredients: type === 'babyfood' ? foodIngredients : undefined,
      note, recordTime,
      recordEndTime: type === 'sleep' ? recordEndTime : undefined,
    });
    if (!isEditing) {
      setAmount(180); setNote(''); setWeight(3.5); setHeight(50); setMilkType('breast'); setType('feeding');
      setFoodCategory(''); setFoodName(''); setFoodGrams(30); setFoodIngredients([]); setIngredientInput(''); setTemperature(36.5);
      setMedName(''); setMedAmount(''); setMedUnit('mg');
    }
  };

  // 所有歷史食材（從 records 計算）
  const allUsedIngredients = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => r.type === 'babyfood' && r.ingredients?.forEach(i => set.add(i)));
    return Array.from(set);
  }, [records]);

  // 自動推斷 (foodName 變化時更新)
  const inferred = useMemo(() => inferIngredients(foodName), [foodName]);

  const inputCls = "w-full min-w-0 p-3.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 rounded-xl outline-none text-sm border border-slate-100 dark:border-slate-600 box-border";

  return (
    <div className="space-y-6">
      {activeSleep && (
        <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl animate-pulse flex justify-between items-center border border-indigo-400/30">
          <div className="space-y-1 text-left">
            <p className="text-xs opacity-60 uppercase">正在錄睡眠中</p>
            <p className="text-3xl font-bold">
              {Math.max(0, Math.floor((now - activeSleep.timestamp) / 60000))}
              <span className="text-sm ml-1 opacity-50 font-normal">分</span>
            </p>
          </div>
          <button onClick={onFinishSleep} className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold text-sm active:scale-95 transition-all shadow-lg">
            起來了 ☀️
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 border border-slate-100 dark:border-slate-700 space-y-6 animate-in slide-in-from-bottom-6 duration-500 text-slate-800 dark:text-slate-200 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-700 p-1.5 rounded-xl space-y-1">
          <div className="flex gap-1">
            {([
              { key: 'feeding', label: '餵奶🍼' },
              { key: 'sleep', label: '睡眠💤' },
            ] as { key: RecordType; label: string }[]).map((t) => (
              <button
                key={t.key} type="button" onClick={() => setType(t.key)}
                className={`flex-1 py-3 rounded-xl text-sm transition-all font-semibold ${
                  type === t.key ? 'bg-white dark:bg-slate-600 shadow-md text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {([
              { key: 'babyfood', label: '副食品🥦' },
              { key: 'temperature', label: '體溫🌡️' },
              { key: 'growth', label: '成長🌱' },
              { key: 'medication', label: '用藥💊' },
            ] as { key: RecordType; label: string }[]).map((t) => (
              <button
                key={t.key} type="button" onClick={() => setType(t.key)}
                className={`flex-1 py-2 rounded-xl text-xs transition-all font-semibold ${
                  type === t.key ? 'bg-white dark:bg-slate-600 shadow-md text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 overflow-hidden">
          <div className="flex justify-between items-center px-1">
            <label className="text-xs text-slate-400 uppercase tracking-widest font-semibold">紀錄時間</label>
            <button onClick={() => setRecordTime(formatLocalValue(new Date()))} className="text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg active:scale-90 font-semibold">
              填入現在
            </button>
          </div>
          <input type="datetime-local" value={recordTime} onChange={(e) => setRecordTime(e.target.value)} className={inputCls} />

          {type === 'sleep' && isEditing && (
            <div className="space-y-1.5 animate-in fade-in text-left">
              <label className="text-xs text-slate-400 uppercase tracking-widest px-1 font-semibold">起床時刻</label>
              <input type="datetime-local" value={recordEndTime} onChange={(e) => setRecordEndTime(e.target.value)} className={inputCls} />
            </div>
          )}

          {type === 'feeding' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex gap-3">
                {(['formula', 'breast'] as MilkType[]).map((m) => (
                  <button key={m} type="button" onClick={() => setMilkType(m)}
                    className={`flex-1 py-3 rounded-xl text-xs border-2 transition-all font-semibold ${
                      milkType === m ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'border-slate-100 dark:border-slate-600 text-slate-400'
                    }`}
                  >
                    {m === 'formula' ? '配方奶' : '母奶'}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                {[120, 150, 180, 210, 240].map((v) => (
                  <button key={v} type="button" onClick={() => setAmount(v)}
                    className={`flex-1 min-w-[50px] py-2.5 rounded-xl text-xs transition-all font-semibold ${
                      amount === v ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-700 text-slate-400 border border-slate-100 dark:border-slate-600'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-4 rounded-2xl border border-slate-100 dark:border-slate-600">
                <button type="button" onClick={() => setAmount(Math.max(0, amount - 5))} className="w-12 h-12 bg-white dark:bg-slate-600 rounded-xl shadow text-xl text-indigo-600 dark:text-indigo-400 active:scale-90">-</button>
                <div className="text-center">
                  <span className="text-4xl text-slate-900 dark:text-slate-100 tracking-tighter font-bold">{amount}</span>
                  <span className="text-xs ml-2 text-slate-400 uppercase">ML</span>
                </div>
                <button type="button" onClick={() => setAmount(amount + 5)} className="w-12 h-12 bg-white dark:bg-slate-600 rounded-xl shadow text-xl text-indigo-600 dark:text-indigo-400 active:scale-90">+</button>
              </div>
            </div>
          )}

          {type === 'sleep' && !isEditing && (
            <div className="text-center py-3 animate-in fade-in">
              {!activeSleep ? (
                <button onClick={() => onStartSleep(recordTime)} className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all">
                  開始睡覺 😴
                </button>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl text-xs text-slate-400 uppercase">正在紀錄睡眠中...</div>
              )}
            </div>
          )}

          {type === 'growth' && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in text-left">
              <div className="relative">
                <input type="number" step="0.01" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className={`${inputCls} pr-14`} />
                <span className="absolute right-4 top-4 text-xs text-slate-300 uppercase">KG</span>
              </div>
              <div className="relative">
                <input type="number" step="1" value={height} onChange={(e) => setHeight(Number(e.target.value))} className={`${inputCls} pr-14`} />
                <span className="absolute right-4 top-4 text-xs text-slate-300 uppercase">CM</span>
              </div>
            </div>
          )}

          {type === 'babyfood' && (
            <div className="space-y-4 animate-in fade-in">
              <input
                type="text"
                list="food-name-list"
                value={foodName}
                onChange={e => setFoodName(e.target.value)}
                placeholder="食物名稱（例：紅蘿蔔泥）"
                className={inputCls}
              />
              {solidFoodLabels.length > 0 && (
                <datalist id="food-name-list">
                  {solidFoodLabels.map(name => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              )}

              {/* 食材標籤區 */}
              <div className="space-y-2.5">
                <label className="text-xs text-slate-400 uppercase tracking-widest px-1 font-semibold">
                  食材{foodIngredients.length > 0 && <span className="normal-case tracking-normal ml-1 text-emerald-500">（已選 {foodIngredients.length}）</span>}
                </label>

                {/* 已加入的食材 */}
                {foodIngredients.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {foodIngredients.map(i => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 rounded-full text-xs font-medium">
                        {i}
                        <button type="button" className="text-emerald-400 hover:text-emerald-600 leading-none" onClick={() => setFoodIngredients(prev => prev.filter(x => x !== i))}>×</button>
                      </span>
                    ))}
                  </div>
                )}

                {/* 自動建議 */}
                {inferred.filter(i => !foodIngredients.includes(i)).length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1.5">💡 自動建議</p>
                    <div className="flex flex-wrap gap-1.5">
                      {inferred.filter(i => !foodIngredients.includes(i)).map(i => (
                        <button key={i} type="button"
                          className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 rounded-full text-xs font-medium"
                          onClick={() => setFoodIngredients(prev => [...prev, i])}
                        >+ {i}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 歷史食材 */}
                {allUsedIngredients.filter(i => !foodIngredients.includes(i) && !inferred.includes(i)).length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1.5">📌 已用過的食材</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allUsedIngredients.filter(i => !foodIngredients.includes(i) && !inferred.includes(i)).map(i => (
                        <button key={i} type="button"
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-full text-xs"
                          onClick={() => setFoodIngredients(prev => [...prev, i])}
                        >{i}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 自訂輸入 */}
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 rounded-xl px-3 py-2 border border-slate-100 dark:border-slate-600">
                  <input
                    type="text"
                    className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 outline-none placeholder-slate-400"
                    placeholder="輸入新食材..."
                    value={ingredientInput}
                    onChange={e => setIngredientInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const v = ingredientInput.trim();
                        if (v && !foodIngredients.includes(v)) setFoodIngredients(prev => [...prev, v]);
                        setIngredientInput('');
                      }
                    }}
                  />
                  {ingredientInput.trim() && (
                    <button type="button"
                      className="text-xs bg-emerald-500 text-white rounded-lg px-2.5 py-1 font-medium"
                      onClick={() => {
                        const v = ingredientInput.trim();
                        if (v && !foodIngredients.includes(v)) setFoodIngredients(prev => [...prev, v]);
                        setIngredientInput('');
                      }}
                    >新增</button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-4 rounded-2xl border border-slate-100 dark:border-slate-600">
                <button type="button" onClick={() => setFoodGrams(Math.max(0, foodGrams - 5))} className="w-12 h-12 bg-white dark:bg-slate-600 rounded-xl shadow text-xl text-emerald-600 dark:text-emerald-400 active:scale-90">-</button>
                <div className="text-center">
                  <span className="text-4xl text-slate-900 dark:text-slate-100 tracking-tighter font-bold">{foodGrams}</span>
                  <span className="text-xs ml-2 text-slate-400 uppercase">g</span>
                </div>
                <button type="button" onClick={() => setFoodGrams(foodGrams + 5)} className="w-12 h-12 bg-white dark:bg-slate-600 rounded-xl shadow text-xl text-emerald-600 dark:text-emerald-400 active:scale-90">+</button>
              </div>
            </div>
          )}

          {type === 'temperature' && (
            <div className="space-y-4 animate-in fade-in">
              <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                temperature >= 37.5 ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' : 'bg-slate-50 dark:bg-slate-700 border-slate-100 dark:border-slate-600'
              }`}>
                <button type="button" onClick={() => setTemperature(Math.max(35, +(temperature - 0.1).toFixed(1)))} className="w-12 h-12 bg-white dark:bg-slate-600 rounded-xl shadow text-xl text-indigo-600 dark:text-indigo-400 active:scale-90">-</button>
                <div className="text-center">
                  <span className={`text-4xl tracking-tighter font-bold ${temperature >= 37.5 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>{temperature.toFixed(1)}</span>
                  <span className="text-xs ml-1 text-slate-400">°C</span>
                  {temperature >= 37.5 && <div className="text-xs text-rose-500 mt-1">發燒</div>}
                </div>
                <button type="button" onClick={() => setTemperature(+(temperature + 0.1).toFixed(1))} className="w-12 h-12 bg-white dark:bg-slate-600 rounded-xl shadow text-xl text-indigo-600 dark:text-indigo-400 active:scale-90">+</button>
              </div>
            </div>
          )}

          {type === 'medication' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest px-1 mb-1.5 block font-semibold">藥名</label>
                <input
                  type="text"
                  list="medication-name-list"
                  value={medName}
                  onChange={e => setMedName(e.target.value)}
                  placeholder="藥名（例：布洛芬）"
                  className={inputCls}
                />
                {medicationLabels.length > 0 && (
                  <datalist id="medication-name-list">
                    {medicationLabels.map(name => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                )}
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 uppercase tracking-widest px-1 mb-1.5 block font-semibold">劑量</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={medAmount}
                    onChange={e => setMedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="例：5"
                    className={inputCls}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 uppercase tracking-widest px-1 mb-1.5 block font-semibold">單位</label>
                  <select
                    value={medUnit}
                    onChange={e => setMedUnit(e.target.value)}
                    className={inputCls}
                  >
                    <option value="mg">mg</option>
                    <option value="ml">ml</option>
                    <option value="顆">顆</option>
                    <option value="包">包</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="備註內容..." className={inputCls} />
        </div>

        {(type !== 'sleep' || isEditing) && type !== 'vaccine' && (
          <div className="flex gap-4 pt-2">
            <button onClick={handleSubmit} className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-semibold shadow-xl active:scale-95 transition-transform text-sm uppercase">
              {isEditing ? '儲存修改' : '新增紀錄'}
            </button>
            {isEditing && (
              <button onClick={onCancel} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-500 py-4 rounded-2xl text-xs">取消</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
