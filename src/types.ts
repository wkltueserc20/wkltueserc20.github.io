export type RecordType = 'feeding' | 'sleep' | 'growth' | 'babyfood' | 'temperature' | 'vaccine' | 'formula_can' | 'formula_price' | 'medication';
export type MilkType = 'formula' | 'breast';
export type TabType = 'home' | 'stats' | 'records' | 'settings';

export interface Record {
  id: string;
  type: RecordType;
  milkType?: MilkType;
  time: string;
  timestamp: number;
  endTimestamp?: number;
  amount?: number;
  weight?: number;
  height?: number;
  note?: string;
  updatedAt?: number;
  isDeleted?: boolean;
  deviceName?: string;
  subType?: string;
  label?: string;
  ingredients?: string[];
}

// RecordForm 送給 handleSaveRecord 的資料形狀（原本兩邊都是 any）
export interface RecordFormData {
  type: RecordType;
  milkType?: MilkType;
  amount?: number;
  weight?: number;
  height?: number;
  subType?: string;
  label?: string;
  ingredients?: string[];
  note: string;
  recordTime: string;
  recordEndTime?: string;
}

export interface BabyInfo {
  name: string;
  birthday: string;
  avatar?: string;
  syncUrl?: string;
  syncSecret?: string;
  feedIntervalHours?: number;
  quietHourStart?: number;
  quietHourEnd?: number;
  quietHourDisabled?: boolean;
  deviceName?: string;
}
