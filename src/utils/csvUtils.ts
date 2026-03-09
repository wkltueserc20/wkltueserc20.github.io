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
