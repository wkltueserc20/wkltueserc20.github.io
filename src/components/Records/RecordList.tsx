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
    (r) => !r.isDeleted &&
      r.type !== 'formula_can' &&
      r.type !== 'formula_price' &&
      isSameDay(getRecordTargetTs(r), searchDate) &&
      (filter === 'all' || r.type === filter)
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2 px-1">
        <h3 className="text-xs text-slate-400 uppercase tracking-widest font-semibold">紀錄清單</h3>
        <div className="relative">
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar pr-6">
          {([
            { value: 'all', label: '全部' },
            { value: 'feeding', label: '🍼 餵奶' },
            { value: 'sleep', label: '💤 睡眠' },
            { value: 'babyfood', label: '🥦 副食品' },
            { value: 'temperature', label: '🌡️ 體溫' },
            { value: 'growth', label: '🌱 成長' },
            { value: 'medication', label: '💊 用藥' },
          ] as { value: 'all' | RecordType; label: string }[]).map(chip => (
            <button
              key={chip.value}
              onClick={() => setFilter(chip.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === chip.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-[#F8FAFC] dark:from-slate-900 to-transparent pointer-events-none" />
        </div>
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
                    : record.type === 'medication' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-500'
                    : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'
                  }`}>
                    {record.type === 'feeding' ? (record.milkType === 'formula' ? '🍼' : '🤱')
                     : record.type === 'sleep' ? '💤'
                     : record.type === 'babyfood' ? '🥦'
                     : record.type === 'temperature' ? '🌡️'
                     : record.type === 'medication' ? '💊'
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
                        : record.type === 'medication'
                        ? `${record.label || '用藥'}${record.amount ? ` ${record.amount}${record.subType || ''}` : ''}`
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
              </div>
            </SwipeableRecordItem>
          );
        })}
      </div>

      {filteredRecords.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-5xl opacity-30">📝</span>
          <p className="text-xs text-slate-300 uppercase tracking-widest">
            {isToday ? '今天還沒有紀錄' : (() => {
              const d = new Date(searchDate + 'T00:00:00');
              return `${d.getMonth() + 1}月${d.getDate()}日沒有紀錄`;
            })()}
          </p>
          {isToday && <p className="text-xs text-slate-300">點下方 ＋ 開始記錄</p>}
        </div>
      )}

      {detailRecord && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6" onClick={() => setDetailRecord(null)}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-4 text-left" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-900 dark:text-slate-100 font-semibold">紀錄詳情</span>
              <button onClick={() => setDetailRecord(null)} className="text-slate-400 active:scale-90">✕</button>
            </div>
            <div className="space-y-3">
              {/* 主要數值 */}
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {detailRecord.type === 'feeding' && `${detailRecord.amount} ml`}
                  {detailRecord.type === 'sleep' && `${Math.floor((detailRecord.amount || 0) / 60)}時 ${(detailRecord.amount || 0) % 60}分`}
                  {detailRecord.type === 'babyfood' && `${detailRecord.label || ''} ${detailRecord.amount}g`}
                  {detailRecord.type === 'temperature' && `${detailRecord.amount}°C`}
                  {detailRecord.type === 'growth' && `${detailRecord.weight} kg / ${detailRecord.height} cm`}
                  {detailRecord.type === 'medication' && `${detailRecord.label || '用藥'}${detailRecord.amount ? ` ${detailRecord.amount}${detailRecord.subType || ''}` : ''}`}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {detailRecord.type === 'feeding' && (detailRecord.milkType === 'formula' ? '配方奶' : '母奶')}
                  {detailRecord.type === 'sleep' && '睡眠'}
                  {detailRecord.type === 'babyfood' && (detailRecord.subType || '副食品')}
                  {detailRecord.type === 'temperature' && (detailRecord.amount && detailRecord.amount >= 37.5 ? '⚠️ 發燒' : '體溫正常')}
                  {detailRecord.type === 'growth' && '成長紀錄'}
                  {detailRecord.type === 'medication' && '用藥紀錄'}
                </div>
              </div>
              {/* 時間 */}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">時間</span>
                <span className="text-slate-700 dark:text-slate-200">{detailRecord.time}</span>
              </div>
              {detailRecord.type === 'sleep' && detailRecord.endTimestamp && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">起床</span>
                  <span className="text-slate-700 dark:text-slate-200">{new Date(detailRecord.endTimestamp).toLocaleString('zh-TW')}</span>
                </div>
              )}
              {detailRecord.note && (
                <div className="flex justify-between text-sm gap-4">
                  <span className="text-slate-400 flex-shrink-0">備註</span>
                  <span className="text-slate-700 dark:text-slate-200 text-right">{detailRecord.note}</span>
                </div>
              )}
              {detailRecord.deviceName && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">裝置</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{detailRecord.deviceName}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-slate-300 dark:text-slate-600 pt-1 border-t border-slate-50 dark:border-slate-700">
                <span>最後修改</span>
                <span>{detailRecord.updatedAt ? new Date(detailRecord.updatedAt).toLocaleString('zh-TW') : '—'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
