import React, { useState, useMemo } from 'react';
import type { Record, BabyInfo } from '../../types';
import { TW_VACCINE_SCHEDULE, getScheduledDate } from './vaccineSchedule';
import { formatLocalValue } from '../../utils/dateUtils';

interface VaccinePageProps {
  records: Record[];
  babyInfo: BabyInfo;
  onAddVaccine: (vaccine: Omit<Record, 'id' | 'time' | 'updatedAt'>) => void;
  onMarkDone: (record: Record, actualDate: number) => void;
  onEditVaccine: (record: Record, newEndTimestamp: number, newNote: string) => void;
}

export const VaccinePage: React.FC<VaccinePageProps> = ({
  records, babyInfo, onAddVaccine, onMarkDone, onEditVaccine,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDose, setCustomDose] = useState('');
  const [customDate, setCustomDate] = useState(formatLocalValue(new Date()));
  const [showScheduleImport, setShowScheduleImport] = useState(false);
  const [editRecord, setEditRecord] = useState<Record | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editNote, setEditNote] = useState('');

  const vaccineRecords = useMemo(() =>
    records.filter(r => r.type === 'vaccine' && !r.isDeleted).sort((a, b) => a.timestamp - b.timestamp),
    [records]
  );

  const completed = vaccineRecords.filter(r => r.endTimestamp);
  const pending = vaccineRecords.filter(r => !r.endTimestamp);

  const alreadyImported = useMemo(() => {
    const keys = new Set(vaccineRecords.map(r => `${r.subType}|${r.label}`));
    return keys;
  }, [vaccineRecords]);

  const unimportedSchedule = TW_VACCINE_SCHEDULE.filter(
    v => !alreadyImported.has(`${v.name}|${v.dose}`)
  );

  const handleImportSchedule = () => {
    unimportedSchedule.forEach(v => {
      const scheduledTs = getScheduledDate(babyInfo.birthday, v.monthAge);
      onAddVaccine({
        type: 'vaccine',
        subType: v.name,
        label: v.dose,
        timestamp: scheduledTs,
        note: `建議 ${v.monthAge} 個月`,
      });
    });
    setShowScheduleImport(false);
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    const ts = new Date(customDate).getTime();
    onAddVaccine({
      type: 'vaccine',
      subType: customName.trim(),
      label: customDose.trim() || '第1劑',
      timestamp: ts,
    });
    setCustomName('');
    setCustomDose('');
    setShowAdd(false);
  };

  const handleOpenEdit = (r: Record) => {
    setEditRecord(r);
    setEditDate(r.endTimestamp ? formatLocalValue(new Date(r.endTimestamp)) : formatLocalValue(new Date()));
    setEditNote(r.note || '');
  };

  const handleSaveEdit = () => {
    if (!editRecord) return;
    const ts = new Date(editDate).getTime();
    if (isNaN(ts)) return;
    onEditVaccine(editRecord, ts, editNote);
    setEditRecord(null);
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('zh-TW', { year: 'numeric', month: 'numeric', day: 'numeric' });
  const daysUntil = (ts: number) => Math.ceil((ts - Date.now()) / 86400000);

  const formatAgeAtShot = (shotTs: number): string => {
    const birth = new Date(babyInfo.birthday);
    const shot = new Date(shotTs);
    let years = shot.getFullYear() - birth.getFullYear();
    let months = shot.getMonth() - birth.getMonth();
    let days = shot.getDate() - birth.getDate();
    if (days < 0) {
      months--;
      days += new Date(shot.getFullYear(), shot.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    const parts = [];
    if (years > 0) parts.push(`${years}歲`);
    if (months > 0) parts.push(`${months}個月`);
    if (days > 0 || parts.length === 0) parts.push(`${days}天`);
    return parts.join('');
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-500">
      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs uppercase active:scale-95 transition-all font-semibold shadow-md"
        >
          {showAdd ? '取消' : '手動新增'}
        </button>
        {unimportedSchedule.length > 0 && (
          <button
            onClick={() => setShowScheduleImport(!showScheduleImport)}
            className="flex-1 py-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-100 dark:border-indigo-800 rounded-xl text-xs uppercase active:scale-95 transition-all font-semibold"
          >
            匯入時程表 ({unimportedSchedule.length})
          </button>
        )}
      </div>

      {/* Import schedule */}
      {showScheduleImport && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-5 space-y-3 border border-indigo-100 dark:border-indigo-800">
          <p className="text-sm text-indigo-700 dark:text-indigo-300 font-semibold">匯入台灣預防接種時程表</p>
          <p className="text-xs text-indigo-500 dark:text-indigo-400">依據寶寶生日 ({babyInfo.birthday}) 自動計算預定日期，共 {unimportedSchedule.length} 項</p>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {unimportedSchedule.map((v, i) => (
              <div key={i} className="text-xs text-indigo-600 dark:text-indigo-400 flex justify-between">
                <span>{v.name} {v.dose}</span>
                <span>{v.monthAge} 個月</span>
              </div>
            ))}
          </div>
          <button onClick={handleImportSchedule} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs uppercase active:scale-95 transition-all font-semibold">
            確認匯入
          </button>
        </div>
      )}

      {/* Add custom */}
      {showAdd && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 space-y-3 border border-slate-100 dark:border-slate-700 shadow-sm">
          <input
            type="text" value={customName} onChange={e => setCustomName(e.target.value)}
            placeholder="疫苗名稱（例：流感疫苗）"
            className="w-full min-w-0 p-3.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 rounded-xl outline-none text-sm border border-slate-100 dark:border-slate-600 box-border"
          />
          <input
            type="text" value={customDose} onChange={e => setCustomDose(e.target.value)}
            placeholder="劑次（例：第1劑）"
            className="w-full min-w-0 p-3.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 rounded-xl outline-none text-sm border border-slate-100 dark:border-slate-600 box-border"
          />
          <input
            type="datetime-local" value={customDate} onChange={e => setCustomDate(e.target.value)}
            className="w-full min-w-0 p-3.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 rounded-xl outline-none text-sm border border-slate-100 dark:border-slate-600 box-border"
          />
          <button onClick={handleAddCustom} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs uppercase active:scale-95 transition-all font-semibold">
            新增疫苗
          </button>
        </div>
      )}

      {/* Completed */}
      <div>
        <h3 className="text-xs text-slate-400 uppercase tracking-widest font-semibold px-1 mb-3">
          已施打 ({completed.length})
        </h3>
        {completed.length === 0 ? (
          <p className="text-xs text-slate-300 text-center py-4">尚無紀錄</p>
        ) : (() => {
          const groups: { dateKey: string; label: string; items: typeof completed }[] = [];
          completed.slice().sort((a, b) => b.endTimestamp! - a.endTimestamp!).forEach(r => {
            const dateKey = new Date(r.endTimestamp!).toLocaleDateString('en-CA');
            const last = groups[groups.length - 1];
            if (last && last.dateKey === dateKey) {
              last.items.push(r);
            } else {
              groups.push({ dateKey, label: formatDate(r.endTimestamp!), items: [r] });
            }
          });
          return (
            <div className="space-y-4">
              {groups.map(group => (
                <div key={group.dateKey}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{group.label}</span>
                    <span className="text-xs text-slate-400">寶寶 {formatAgeAtShot(group.items[0].endTimestamp!)}</span>
                    <div className="flex-1 h-px bg-emerald-100 dark:bg-emerald-900/40" />
                  </div>
                  <div className="border-l-2 border-emerald-200 dark:border-emerald-800 ml-1 pl-3 space-y-2">
                    {group.items.map(r => (
                      <div key={r.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                        <div className="text-lg flex-shrink-0">✅</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{r.subType} {r.label}</div>
                          {r.note && <div className="text-xs text-slate-400 italic mt-0.5">{r.note}</div>}
                        </div>
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl text-xs active:scale-95 transition-all font-semibold flex-shrink-0"
                        >
                          編輯
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Pending */}
      <div>
        <h3 className="text-xs text-slate-400 uppercase tracking-widest font-semibold px-1 mb-3">
          未施打 ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2">
            <span className="text-4xl opacity-30">💉</span>
            <p className="text-xs text-slate-300">沒有待施打的疫苗</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map(r => {
              const days = daysUntil(r.timestamp);
              const isPast = days < 0;
              return (
                <div key={r.id} className={`bg-white dark:bg-slate-800 rounded-2xl p-4 border shadow-sm flex items-center justify-between ${
                  isPast ? 'border-amber-200 dark:border-amber-800' : 'border-slate-100 dark:border-slate-700'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-lg">⬜</div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{r.subType} {r.label}</div>
                      <div className="text-xs text-slate-400">
                        預定 {formatDate(r.timestamp)}
                        {isPast ? <span className="text-amber-500 ml-1">已過 {Math.abs(days)} 天</span>
                          : days === 0 ? <span className="text-indigo-500 ml-1">今天</span>
                          : <span className="ml-1">還有 {days} 天</span>}
                      </div>
                      {r.note && <div className="text-xs text-slate-400">{r.note}</div>}
                    </div>
                  </div>
                  <button
                    onClick={() => onMarkDone(r, Date.now())}
                    className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs active:scale-95 transition-all font-semibold"
                  >
                    已打
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editRecord && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6" onClick={() => setEditRecord(null)}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">修改施打紀錄</span>
              <button onClick={() => setEditRecord(null)} className="text-slate-400 active:scale-90">✕</button>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{editRecord.subType} {editRecord.label}</div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest font-semibold block mb-1.5">施打日期</label>
                <input
                  type="datetime-local"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 rounded-xl outline-none text-sm border border-slate-100 dark:border-slate-600"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest font-semibold block mb-1.5">備註</label>
                <input
                  type="text"
                  value={editNote}
                  onChange={e => setEditNote(e.target.value)}
                  placeholder="備註內容..."
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 rounded-xl outline-none text-sm border border-slate-100 dark:border-slate-600"
                />
              </div>
            </div>
            <button
              onClick={handleSaveEdit}
              className="w-full py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold active:scale-95 transition-all"
            >
              儲存修改
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
