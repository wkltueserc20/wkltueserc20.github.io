import React from 'react';
import type { Record, RecordType } from '../../types';
import { getRecordTargetTs, isSameDay } from '../../utils/dateUtils';
import { SwipeableRecordItem } from './SwipeableRecordItem';

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
          <SwipeableRecordItem
            key={record.id}
            onEdit={() => onEdit(record)}
            onDelete={() => onDelete(record.id)}
          >
            <div className="bg-white p-6 shadow-sm flex items-center border border-slate-50 font-black">
              <div className="flex gap-5 items-center flex-1 font-black">
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
              <div className="text-slate-200 ml-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </SwipeableRecordItem>
        ))}
      </div>
      {filteredRecords.length === 0 && (
        <p className="text-center text-[10px] text-slate-300 py-12 uppercase tracking-widest font-black">
          目前尚無數據
        </p>
      )}
    </div>
  );
};
