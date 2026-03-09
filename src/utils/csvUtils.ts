import type { Record } from '../types';

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
  let csv = '\uFEFFID,時間,類別,奶種,數值,狀態,體重,身高,開始時間戳,結束時間戳,備註\n';
  records.forEach((r) => {
    csv += `"${r.id}","${r.time}","${r.type}","${r.milkType || ''}","${r.amount || ''}","","${r.weight || ''}","${r.height || ''}","${r.timestamp}","${r.endTimestamp || ''}","${r.note || ''}"\n`;
  });
  return csv;
};

export const csvToRecords = (csvContent: string): Record[] => {
  const lines = csvContent.split('\n').filter((l) => l.trim() !== '').slice(1);
  const records: Record[] = [];
  lines.forEach((l) => {
    const c = parseCSVLine(l.trim());
    if (c.length < 11) return;
    const ts = Number(c[8]);
    if (isNaN(ts)) return;
    records.push({
      id: c[0] || crypto.randomUUID(),
      time: c[1],
      timestamp: ts,
      type: c[2] as any,
      milkType: c[3] as any,
      amount: c[4] ? Number(c[4]) : undefined,
      weight: c[6] ? Number(c[6]) : undefined,
      height: c[7] ? Number(c[7]) : undefined,
      endTimestamp: c[9] ? Number(c[9]) : undefined,
      note: c[10],
    });
  });
  return records;
};
