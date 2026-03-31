import Dexie, { type Table } from 'dexie';
import type { Record } from '../types';

export class BabyTrackerDexie extends Dexie {
  records!: Table<Record>;

  constructor() {
    super('BabyTrackerDB');
    this.version(1).stores({
      records: 'id, type, timestamp' // Primary key is id, index on type and timestamp
    });
    this.version(2).stores({
      records: 'id, type, timestamp, subType'
    });
  }
}

export const db = new BabyTrackerDexie();
