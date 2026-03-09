import React, { useState, useEffect } from 'react';
import type { Record, RecordType, MilkType } from '../../types';
import { formatLocalValue } from '../../utils/dateUtils';

interface RecordFormProps {
  isEditing: string | null;
  records: Record[];
  onSave: (recordData: any) => void;
  onCancel: () => void;
  sleepStartTime: number | null;
  onStartSleep: (time: string) => void;
  onWakeUp: () => void;
  now: number;
}

export const RecordForm: React.FC<RecordFormProps> = ({
  isEditing,
  records,
  onSave,
  onCancel,
  sleepStartTime,
  onStartSleep,
  onWakeUp,
  now,
}) => {
  const [type, setType] = useState<RecordType>('feeding');
  const [milkType, setMilkType] = useState<MilkType>('breast');
  const [amount, setAmount] = useState<number>(180);
  const [weight, setWeight] = useState<number>(3.5);
  const [height, setHeight] = useState<number>(50);
  const [note, setNote] = useState<string>('');
  const [recordTime, setRecordTime] = useState<string>('');
  const [recordEndTime, setRecordEndTime] = useState<string>('');

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

  // Auto-fill time logic for new records
  useEffect(() => {
    if (!isEditing) {
      setRecordTime(formatLocalValue(new Date()));
    }
  }, [type, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type,
      milkType: type === 'feeding' ? milkType : undefined,
      amount: type === 'feeding' || type === 'sleep' ? amount : undefined,
      weight: type === 'growth' ? weight : undefined,
      height: type === 'growth' ? height : undefined,
      note,
      recordTime,
      recordEndTime: type === 'sleep' ? recordEndTime : undefined,
    });
    if (!isEditing) {
      // Reset form if not editing
      setAmount(180);
      setNote('');
      setWeight(3.5);
      setHeight(50);
      setMilkType('breast');
      setType('feeding');
    }
  };

  return (
    <div className="space-y-7 font-black">
      {sleepStartTime && (
        <div className="bg-indigo-600 text-white p-7 rounded-[2.5rem] shadow-2xl animate-pulse flex justify-between items-center border-2 border-indigo-400/30 font-black">
          <div className="space-y-1.5 text-left">
            <p className="text-[11px] opacity-60 uppercase font-black">正在錄睡眠中 💤</p>
            <p className="text-4xl font-black">
              {Math.max(0, Math.floor((now - sleepStartTime) / 60000))}
              <span className="text-sm ml-1.5 opacity-50 font-black">分</span>
            </p>
          </div>
          <button
            onClick={onWakeUp}
            className="bg-white text-indigo-600 px-9 py-5 rounded-[1.75rem] font-black text-sm uppercase active:scale-95 transition-all shadow-xl font-black"
          >
            起來了 ☀️
          </button>
        </div>
      )}

      <div className="bg-white rounded-[3rem] shadow-2xl p-7 border border-slate-100 space-y-7 animate-in slide-in-from-bottom-6 duration-500 font-black text-slate-800">
        <div className="flex bg-slate-50 p-2 rounded-[1.5rem] font-black">
          {(['feeding', 'sleep', 'growth'] as RecordType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-4 rounded-[1.25rem] text-[11px] transition-all font-black ${
                type === t ? 'bg-white shadow-md text-indigo-600 font-black' : 'text-slate-400'
              }`}
            >
              {t === 'feeding' ? '餵奶🍼' : t === 'sleep' ? '睡眠💤' : '成長🌱'}
            </button>
          ))}
        </div>
        <div className="space-y-5 font-black">
          <div className="flex justify-between items-center px-1 font-black">
            <label className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
              紀錄時間
            </label>
            <button
              onClick={() => setRecordTime(formatLocalValue(new Date()))}
              className="text-[9px] text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl active:scale-90 font-black"
            >
              填入現在
            </button>
          </div>
          <input
            type="datetime-local"
            value={recordTime}
            onChange={(e) => setRecordTime(e.target.value)}
            className="w-full p-5 bg-slate-50 rounded-[1.5rem] outline-none text-sm font-black border border-slate-100 font-black"
          />
          {type === 'sleep' && isEditing && (
            <div className="space-y-1.5 animate-in fade-in font-black text-left">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest px-1 font-black">
                起床時刻
              </label>
              <input
                type="datetime-local"
                value={recordEndTime}
                onChange={(e) => setRecordEndTime(e.target.value)}
                className="w-full p-5 bg-slate-50 rounded-[1.5rem] outline-none text-sm font-black border border-slate-100"
              />
            </div>
          )}
          {type === 'feeding' && (
            <div className="space-y-5 animate-in fade-in font-black">
              <div className="flex gap-3 font-black">
                {(['formula', 'breast'] as MilkType[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMilkType(m)}
                    className={`flex-1 py-4 rounded-[1.25rem] text-[11px] border-2 transition-all font-black ${
                      milkType === m
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-slate-50 text-slate-400'
                    }`}
                  >
                    {m === 'formula' ? '配方奶' : '母奶'}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-5 rounded-[2rem] border border-slate-100 font-black">
                <button
                  onClick={() => setAmount(Math.max(0, amount - 5))}
                  className="w-14 h-14 bg-white rounded-[1.25rem] shadow-lg text-2xl text-indigo-600 active:scale-90"
                >
                  -
                </button>
                <div className="text-center font-black">
                  <span className="text-5xl text-slate-900 tracking-tighter">{amount}</span>
                  <span className="text-xs ml-2 text-slate-400 uppercase font-black">ML</span>
                </div>
                <button
                  onClick={() => setAmount(amount + 5)}
                  className="w-14 h-14 bg-white rounded-[1.25rem] shadow-lg text-2xl text-indigo-600 active:scale-90"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {type === 'sleep' && !isEditing && (
            <div className="text-center py-3 animate-in fade-in font-black">
              {!sleepStartTime ? (
                <button
                  onClick={() => onStartSleep(recordTime)}
                  className="w-full bg-slate-900 text-white py-7 rounded-[2.5rem] font-black text-xl shadow-2xl active:scale-95 transition-all font-black"
                >
                  開始睡覺 😴
                </button>
              ) : (
                <div className="p-5 bg-slate-50 rounded-[1.5rem] text-[11px] text-slate-400 uppercase font-black">
                  正在紀錄睡眠中...
                </div>
              )}
            </div>
          )}
          {type === 'growth' && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in text-left font-black">
              <div className="relative font-black">
                <input
                  type="number"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full p-5 pr-14 bg-slate-50 rounded-[1.5rem] outline-none font-black"
                />
                <span className="absolute right-5 top-5 text-[10px] text-slate-300 uppercase">
                  KG
                </span>
              </div>
              <div className="relative font-black">
                <input
                  type="number"
                  step="1"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full p-5 pr-14 bg-slate-50 rounded-[1.5rem] outline-none font-black"
                />
                <span className="absolute right-5 top-5 text-[10px] text-slate-300 uppercase font-black">
                  CM
                </span>
              </div>
            </div>
          )}
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="備註內容..."
            className="w-full p-5 bg-slate-50 rounded-[1.5rem] outline-none text-sm font-black border border-transparent"
          />
        </div>
        {(type !== 'sleep' || isEditing) && (
          <div className="flex gap-4 pt-3 font-black">
            <button
              onClick={handleSubmit}
              className="flex-[2] bg-indigo-600 text-white py-6 rounded-[2rem] font-black shadow-2xl active:scale-95 transition-transform text-base uppercase font-black"
            >
              {isEditing ? '儲存修改' : '新增紀錄'}
            </button>
            {isEditing && (
              <button
                onClick={onCancel}
                className="flex-1 bg-slate-100 text-slate-500 py-6 rounded-[2rem] font-black text-[11px]"
              >
                取消
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
