export type RecordType = 'feeding' | 'sleep' | 'growth';
export type MilkType = 'formula' | 'breast';
export type TabType = 'home' | 'stats' | 'settings' | 'manual';

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
}

export interface BabyInfo {
  name: string;
  birthday: string;
  avatar?: string;
  lineToken?: string;
  lineUserId?: string;
  lineEnabled?: boolean;
  gasUrl?: string;
  googleClientId?: string;
  googleFolderId?: string;
}
