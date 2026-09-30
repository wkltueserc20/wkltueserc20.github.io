import type { Record } from '../types';

export const formatLocalValue = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const isSameDay = (ts: number, target: string) => {
  const d = new Date(ts);
  const [y, m, day] = target.split('-').map(Number);
  return d.getFullYear() === y && (d.getMonth() + 1) === m && d.getDate() === day;
};

export const getYesterdayDateString = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return date.toLocaleDateString('en-CA');
};

export const getRecordTargetTs = (r: Record) => {
  if (r.type === 'sleep') {
    if (r.endTimestamp) return r.endTimestamp;
    if (r.amount) return r.timestamp + r.amount * 60000;
  }
  return r.timestamp;
};

export const formatTimeWithPeriod = (ts: number) => {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes();
  let period = '';
  if (h < 5) period = '凌晨';
  else if (h < 11) period = '早上';
  else if (h < 13) period = '中午';
  else if (h < 18) period = '下午';
  else period = '晚上';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${period}${displayH}:${m < 10 ? '0' + m : m}`;
};

// 睡眠備註的時間段前綴。新增(handleFinishSleep)和編輯(handleSaveRecord)原本各拼一次
// 字串、格式還不一樣（早上8:30 vs 08:30），所以編輯時剝不掉舊前綴，備註看起來就沒更新。
const SLEEP_NOTE_PREFIX =
  /^睡覺: (?:凌晨|早上|中午|下午|晚上)?\d{1,2}:\d{2} ~ (?:凌晨|早上|中午|下午|晚上)?\d{1,2}:\d{2}(?: - )?/;

export const buildSleepNote = (startTs: number, endTs: number, note = '') => {
  let pure = note;
  // 迴圈是為了把舊 bug 疊出來的多層前綴一次清掉
  while (SLEEP_NOTE_PREFIX.test(pure)) pure = pure.replace(SLEEP_NOTE_PREFIX, '');
  if (pure.trim() === '睡覺中...') pure = ''; // 開始睡覺時塞的佔位字，不是使用者備註
  const range = `${formatTimeWithPeriod(startTs)} ~ ${formatTimeWithPeriod(endTs)}`;
  return `睡覺: ${range}${pure.trim() ? ' - ' + pure.trim() : ''}`;
};
