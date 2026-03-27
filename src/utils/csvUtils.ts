import type { Record, RecordType, MilkType } from '../types';

export const parseCSVLine = (t: string) => {
  const res = [];
  let c = '';
  let q = false;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '"') q = !q;
    else if (t[i] === ',' && !q) {
      res.push(c);
      c = '';
    } else c += t[i];
  }
  res.push(c);
  return res;
};

export const generateCSVString = (records: Record[]) => {
  let csv = '\uFEFFID,時間,類別,奶種,數值,狀態,體重,身高,開始時間戳,結束時間戳,備註,最後修改時間戳\n';
  records.forEach((r) => {
    csv += `"${r.id}","${r.time}","${r.type}","${r.milkType || ''}","${r.amount || ''}","${r.isDeleted ? 'deleted' : ''}","${r.weight || ''}","${r.height || ''}","${r.timestamp}","${r.endTimestamp || ''}","${r.note || ''}","${r.updatedAt || 0}"\n`;
  });
  return csv;
};

const VALID_TYPES = new Set<string>(['feeding', 'sleep', 'growth', 'babyfood', 'temperature', 'vaccine']);
const VALID_MILK = new Set<string>(['formula', 'breast']);

export const csvToRecords = (csvContent: string): Record[] => {
  const lines = csvContent.split('\n').filter((l) => l.trim() !== '').slice(1);
  const records: Record[] = [];
  lines.forEach((l) => {
    const c = parseCSVLine(l.trim());
    if (c.length < 11) return;
    const ts = Number(c[8]);
    if (isNaN(ts)) return;
    const recordType = c[2];
    if (!VALID_TYPES.has(recordType)) return;
    records.push({
      id: c[0] || crypto.randomUUID(),
      time: c[1],
      timestamp: ts,
      type: recordType as RecordType,
      milkType: VALID_MILK.has(c[3]) ? (c[3] as MilkType) : undefined,
      amount: c[4] ? Number(c[4]) : undefined,
      weight: c[6] ? Number(c[6]) : undefined,
      height: c[7] ? Number(c[7]) : undefined,
      endTimestamp: c[9] ? Number(c[9]) : undefined,
      note: c[10],
      updatedAt: c[11] ? Number(c[11]) : 0,
      isDeleted: c[5] === 'deleted',
    });
  });
  return records;
};
