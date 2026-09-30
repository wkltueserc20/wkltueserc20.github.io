import type { Record, RecordType, MilkType } from '../../types';
import { formatLocalValue } from '../../utils/dateUtils.ts';

// 表單初始值。原本是用 useEffect 把紀錄灌進 state，除了觸發
// react-hooks/set-state-in-effect，records 一變動（例如背景同步）
// 還會把使用者正在打的內容覆寫掉。改成掛載時算一次，
// 什麼時候重算由呼叫端的 key 決定。
export const initialFields = (r: Record | null, defaultType?: RecordType) => ({
  type: r?.type ?? defaultType ?? 'feeding',
  milkType: r?.milkType || ('formula' as MilkType),
  amount: r?.amount || 180,
  weight: r?.weight || 3.5,
  height: r?.height || 50,
  note: r?.note ?? '',
  recordTime: formatLocalValue(new Date(r?.timestamp ?? Date.now())),
  recordEndTime:
    r?.type === 'sleep' && r.endTimestamp ? formatLocalValue(new Date(r.endTimestamp)) : '',
  foodCategory: r?.type === 'babyfood' ? r.subType || '' : '',
  foodName: r?.type === 'babyfood' ? r.label || '' : '',
  foodGrams: r?.type === 'babyfood' ? r.amount ?? 120 : 120,
  foodIngredients: r?.type === 'babyfood' ? r.ingredients ?? [] : [],
  medName: r?.type === 'medication' ? r.label || '' : '',
  medAmount: (r?.type === 'medication' ? r.amount ?? '' : '') as number | '',
  medUnit: r?.type === 'medication' ? r.subType || 'mg' : 'mg',
});
