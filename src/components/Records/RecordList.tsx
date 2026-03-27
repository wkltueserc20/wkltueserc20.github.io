import React, { useState } from 'react';
import type { Record, RecordType } from '../../types';
import { getRecordTargetTs, isSameDay, formatTimeWithPeriod } from '../../utils/dateUtils';
import { SwipeableRecordItem } from './SwipeableRecordItem';

interface RecordListProps {
  records: Record[];
  searchDate: string;
  filter: 'all' | RecordType;
  setFilter: (filter: 'all' | RecordType) => void;
  onEdit: (record: Record) => void;
  onDelete: (id: string) => void;
}

const formatRelativeTime = (ts: number): string => {
  const diff = Date.now() - ts;
  if (diff < 60000) return '剛剛';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分鐘前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小時前`;
  return '';
};

export const RecordList: React.FC<RecordListProps> = ({
  records, searchDate, filter, setFilter, onEdit, onDelete,
}) => {
  const [detailRecord, setDetailRecord] = useState<Record | null>(null);
  const isToday = searchDate === new Date().toLocaleDateString('en-CA');
  const filteredRecords = records.filter(
    (r) => !r.isDeleted && isSameDay(getRecordTargetTs(r), searchDate) && (filter === 'all' || r.type === filter)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-3 text-left">
        <h3 className="text-xs text-slate-400 uppercase tracking-widest font-semibold">紀錄清單</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | RecordType)}
          aria-label="篩選紀錄類型"
          className="bg-transparent text-xs text-indigo-600 outline-none border-b-2 border-indigo-500/20 pb-1 font-semibold"
        >
          <option value="all">全部紀錄</option>
          <option value="feeding">餵奶</option>
          <option value="sleep">睡眠</option>
          <option value="babyfood">副食品</option>
          <option value="temperature">體溫</option>
          <option value="growth">成長</option>
        </select>
      </div>

      <div className="space-y-3 text-left text-slate-800 dark:text-slate-200">
        {filteredRecords.map((record) => {
          const relative = isToday ? formatRelativeTime(record.timestamp) : '';
          return (
            <SwipeableRecordItem
              key={record.id}
              onEdit={() => onEdit(record)}
              onDelete={() => onDelete(record.id)}
              onLongPress={() => setDetailRecord(record)}
            >
              <div className="bg-white dark:bg-slate-800 p-5 shadow-sm flex items-center border border-slate-50 dark:border-slate-700">
                <div className="flex gap-4 items-center flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                    record.type === 'feeding' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500'
                    : record.type === 'sleep' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-500'
                    : record.type === 'babyfood' ? 'bg-green-50 dark:bg-green-900/30 text-green-500'
                    : record.type === 'temperature' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-500'
                    : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'
                  }`}>
                    {record.type === 'feeding' ? (record.milkType === 'formula' ? '🍼' : '🤱')
                     : record.type === 'sleep' ? '💤'
                     : record.type === 'babyfood' ? '🥦'
                     : record.type === 'temperature' ? '🌡️'
                     : '🌱'}
                  </div>
                  <div>
                    <div className="text-sm text-slate-900 dark:text-slate-100 leading-tight mb-1 font-semibold">
                      {record.type === 'feeding'
                        ? `${record.amount}ml ${record.milkType === 'formula' ? '配方' : '母奶'}`
                        : record.type === 'sleep'
                        ? `${Math.floor((record.amount || 0) / 60)}時 ${(record.amount || 0) % 60}分`
                        : record.type === 'babyfood'
                        ? `${record.label || '副食品'} ${record.amount}g`
                        : record.type === 'temperature'
                        ? <span className={record.amount && record.amount >= 37.5 ? 'text-rose-600' : ''}>{record.amount}°C{record.amount && record.amount >= 37.5 ? ' ⚠️' : ''}</span>
                        : `${record.weight}kg / ${record.height}cm`}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400">{formatTimeWithPeriod(record.timestamp)}</span>
                      {relative && <span className="text-xs text-slate-300">{relative}</span>}
                      {record.deviceName && (
                        <span className="text-xs text-slate-300 bg-slate-50 dark:bg-slate-700 px-1.5 py-0.5 rounded">{record.deviceName}</span>
                      )}
                    </div>
                    {record.note && (
                      <div className="text-xs text-slate-400 mt-1.5 italic border-l-2 border-slate-100 dark:border-slate-600 pl-2 font-normal leading-relaxed">
                        {record.note}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-slate-200 dark:text-slate-600 ml-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </SwipeableRecordItem>
          );
        })}
      </div>

      {filteredRecords.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-5xl opacity-30">📝</span>
          <p className="text-xs text-slate-300 uppercase tracking-widest">還沒有紀錄</p>
          <p className="text-xs text-slate-300">點下方 ＋ 開始記錄</p>
        </div>
      )}

      {detailRecord && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6" onClick={() => setDetailRecord(null)}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-3 text-left" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-900 dark:text-slate-100 font-semibold">紀錄詳情</span>
              <button onClick={() => setDetailRecord(null)} className="text-slate-400 active:scale-90">✕</button>
            </div>
            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <div><span className="text-slate-400">ID:</span> {detailRecord.id}</div>
              <div><span className="text-slate-400">類型:</span> {detailRecord.type}{detailRecord.milkType ? ` (${detailRecord.milkType})` : ''}</div>
              <div><span className="text-slate-400">時間:</span> {detailRecord.time}</div>
              <div><span className="text-slate-400">Timestamp:</span> {detailRecord.timestamp}</div>
              {detailRecord.endTimestamp && <div><span className="text-slate-400">EndTimestamp:</span> {detailRecord.endTimestamp}</div>}
              {detailRecord.amount != null && <div><span className="text-slate-400">Amount:</span> {detailRecord.amount}</div>}
              {detailRecord.weight != null && <div><span className="text-slate-400">Weight:</span> {detailRecord.weight}</div>}
              {detailRecord.height != null && <div><span className="text-slate-400">Height:</span> {detailRecord.height}</div>}
              {detailRecord.note && <div><span className="text-slate-400">Note:</span> {detailRecord.note}</div>}
              <div><span className="text-slate-400">UpdatedAt:</span> {detailRecord.updatedAt ? new Date(detailRecord.updatedAt).toLocaleString('zh-TW') : 'N/A'}</div>
              {detailRecord.deviceName && <div><span className="text-slate-400">Device:</span> {detailRecord.deviceName}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
