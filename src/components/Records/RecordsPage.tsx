import React, { useState } from 'react';
import type { Record, BabyInfo } from '../../types';
import { VaccinePage } from '../Vaccine/VaccinePage';
import { FormulaPage } from '../Formula/FormulaPage';
import { SolidFoodStatsPage } from '../SolidFood/SolidFoodStatsPage';

interface RecordsPageProps {
  records: Record[];
  babyInfo: BabyInfo;
  onAddVaccine: (data: Omit<Record, 'id' | 'time' | 'updatedAt'>) => void;
  onMarkVaccineDone: (record: Record, actualDate: number) => void;
  onEditVaccine: (record: Record, newEndTimestamp: number, newNote: string, newSubType: string, newLabel: string, newAmount?: number) => void;
  onDeleteVaccine: (id: string) => void;
  onFormulaAdd: (data: Omit<Record, 'id' | 'time' | 'updatedAt'>) => void;
  onFormulaUpdate: (record: Record) => void;
  onFormulaDelete: (id: string) => void;
}

type SubTab = 'babyfood' | 'vaccine' | 'formula';

export const RecordsPage: React.FC<RecordsPageProps> = ({
  records, babyInfo,
  onAddVaccine, onMarkVaccineDone, onEditVaccine, onDeleteVaccine,
  onFormulaAdd, onFormulaUpdate, onFormulaDelete,
}) => {
  const [subTab, setSubTab] = useState<SubTab>('babyfood');

  return (
    <div className="space-y-5">
      {/* 子標籤 */}
      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
        {([
          { id: 'babyfood', label: '🥣 副食品' },
          { id: 'formula', label: '🍼 奶粉' },
          { id: 'vaccine', label: '💉 疫苗' },
        ] as { id: SubTab; label: string }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              subTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'babyfood' && (
        <SolidFoodStatsPage records={records} />
      )}

      {subTab === 'vaccine' && (
        <VaccinePage
          records={records}
          babyInfo={babyInfo}
          onAddVaccine={onAddVaccine}
          onMarkDone={onMarkVaccineDone}
          onEditVaccine={onEditVaccine}
          onDeleteVaccine={onDeleteVaccine}
        />
      )}

      {subTab === 'formula' && (
        <FormulaPage
          records={records}
          onAdd={onFormulaAdd}
          onUpdate={onFormulaUpdate}
          onDelete={onFormulaDelete}
        />
      )}
    </div>
  );
};
