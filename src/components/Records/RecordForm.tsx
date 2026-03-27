import React, { useState, useEffect } from 'react';
import type { Record, RecordType, MilkType } from '../../types';
import { formatLocalValue } from '../../utils/dateUtils';

interface RecordFormProps {
  isEditing: string | null;
  records: Record[];
  onSave: (recordData: any) => void;
  onCancel: () => void;
  activeSleep: Record | null;
  onStartSleep: (time: string) => void;
  onFinishSleep: () => void;
}

export const RecordForm: React.FC<RecordFormProps> = ({
  isEditing, records, onSave, onCancel, activeSleep, onStartSleep, onFinishSleep,
}) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!activeSleep) return;
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, [activeSleep]);

  const [type, setType] = useState<RecordType>('feeding');
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
  const [temperature, setTemperature] = useState(36.5);

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
      amount: type === 'feeding' || type === 'sleep' ? amount : type === 'babyfood' ? foodGrams : type === 'temperature' ? temperature : undefined,
      weight: type === 'growth' ? weight : undefined,
      height: type === 'growth' ? height : undefined,
      subType: type === 'babyfood' ? foodCategory : undefined,
      label: type === 'babyfood' ? foodName : undefined,
      note, recordTime,
      recordEndTime: type === 'sleep' ? recordEndTime : undefined,
    });
    if (!isEditing) {
      setAmount(180); setNote(''); setWeight(3.5); setHeight(50); setMilkType('breast'); setType('feeding');
      setFoodCategory(''); setFoodName(''); setFoodGrams(30); setTemperature(36.5);
    }
  };

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
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest px-1 mb-1.5 block font-semibold">食物類別</label>
                <div className="flex gap-2 flex-wrap">
                  {['米糊', '蔬菜泥', '水果泥', '蛋白質', '其他'].map(c => (
                    <button key={c} type="button" onClick={() => setFoodCategory(c)}
                      className={`px-4 py-2 rounded-xl text-xs transition-all font-semibold ${
                        foodCategory === c ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-700 text-slate-400 border border-slate-100 dark:border-slate-600'
                      }`}
                    >{c}</button>
                  ))}
                </div>
                {foodCategory === '其他' && (
                  <input type="text" value={foodCategory === '其他' ? '' : foodCategory} onChange={e => setFoodCategory(e.target.value || '其他')} placeholder="自訂類別..." className={`${inputCls} mt-2`} />
                )}
              </div>
              <input type="text" value={foodName} onChange={e => setFoodName(e.target.value)} placeholder="食物名稱（例：紅蘿蔔泥）" className={inputCls} />
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
