export type RecordType = 'feeding' | 'sleep' | 'growth' | 'babyfood' | 'temperature' | 'vaccine';
export type MilkType = 'formula' | 'breast';
export type TabType = 'home' | 'stats' | 'vaccine' | 'settings';

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
}

export interface BabyInfo {
  name: string;
  birthday: string;
  avatar?: string;
  syncUrl?: string;
  syncSecret?: string;
  feedIntervalHours?: number;
  deviceName?: string;
}
