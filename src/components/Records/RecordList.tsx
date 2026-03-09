import React from 'react';
import type { Record, RecordType } from '../../types';
import { getRecordTargetTs, isSameDay } from '../../utils/dateUtils';

interface RecordListProps {
  records: Record[];
  searchDate: string;
  filter: 'all' | RecordType;
  setFilter: (filter: 'all' | RecordType) => void;
  onEdit: (record: Record) => void;
  onDelete: (id: string) => void;
}

export const RecordList: React.FC<RecordListProps> = ({
  records,
  searchDate,
  filter,
  setFilter,
  onEdit,
  onDelete,
}) => {
  const filteredRecords = records.filter(
    (r) => !r.isDeleted && isSameDay(getRecordTargetTs(r), searchDate) && (filter === 'all' || r.type === filter)
  );

  return (
    <div className="space-y-5 font-black">
      <div className="flex justify-between items-center px-3 font-black text-left">
        <h3 className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black">
          紀錄清單
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-transparent text-[11px] text-indigo-600 outline-none border-b-2 border-indigo-500/20 pb-1 font-black"
        >
          <option value="all">全部紀錄</option>
          <option value="feeding">餵奶</option>
          <option value="sleep">睡眠</option>
          <option value="growth">成長</option>
        </select>
      </div>
      <div className="space-y-4 font-black text-left text-slate-800">
        {filteredRecords.map((record) => (
          <div
            key={record.id}
            className="bg-white p-6 rounded-[2.25rem] shadow-sm flex justify-between items-center border border-slate-50 active:scale-[0.98] transition-all font-black"
          >
            <div className="flex gap-5 items-center font-black">
              <div
                className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-2xl font-black ${
                  record.type === 'feeding'
                    ? 'bg-indigo-50 text-indigo-500'
                    : record.type === 'sleep'
                    ? 'bg-purple-50 text-purple-500'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {record.type === 'feeding' ? (record.milkType === 'formula' ? '🍼' : '🤱') : record.type === 'sleep' ? '💤' : '🌱'}
              </div>
              <div className="font-black">
                <div className="text-[15px] text-slate-900 leading-tight mb-1 font-black">
                  {record.type === 'feeding'
                    ? `${record.amount}ml ${record.milkType === 'formula' ? '配方' : '母奶'}`
                    : record.type === 'sleep'
                    ? `${Math.floor((record.amount || 0) / 60)}時 ${(record.amount || 0) % 60}分`
                    : `${record.weight}kg / ${record.height}cm`}
                </div>
                <div className="text-[11px] text-slate-400 font-black uppercase">
                  {record.time.split(' ')[1]}
                </div>
                {record.note && (
                  <div className="text-[11px] text-slate-400 mt-2 italic border-l-4 border-slate-50 pl-3 font-normal leading-relaxed">
                    {record.note}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-1.5 font-black">
              <button
                onClick={() => onEdit(record)}
                className="p-3 text-indigo-200 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                onClick={() => onDelete(record.id)}
                className="p-3 text-rose-100 hover:text-rose-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
