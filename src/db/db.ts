import Dexie, { type Table } from 'dexie';
import type { Record } from '../types';

export class BabyTrackerDexie extends Dexie {
  records!: Table<Record>;

  constructor() {
    super('BabyTrackerDB');
    this.version(1).stores({
      records: 'id, type, timestamp' // Primary key is id, index on type and timestamp
    });
  }
}

export const db = new BabyTrackerDexie();
