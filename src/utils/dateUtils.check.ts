// 睡眠備註的自我檢查：node src/utils/dateUtils.check.ts
// 沒有測試框架，只靠 assert。備註在編輯時剝不掉舊前綴是修過的 bug，這裡擋回歸。
import assert from 'node:assert/strict';
import { buildSleepNote } from './dateUtils.ts';

const at = (h: number, m: number) => new Date(2026, 0, 1, h, m).getTime();

// 新建：佔位字不該被當成使用者備註留下來
assert.equal(buildSleepNote(at(8, 30), at(10, 0), '睡覺中...'), '睡覺: 早上8:30 ~ 早上10:00');

// 編輯起床時間：前綴要換成新時間，使用者備註要留著
assert.equal(
  buildSleepNote(at(8, 30), at(11, 0), '睡覺: 早上8:30 ~ 早上10:00 - 睡得不安穩'),
  '睡覺: 早上8:30 ~ 中午11:00 - 睡得不安穩'
);

// 舊的 24 小時制前綴（歷史資料）也要剝得掉
assert.equal(
  buildSleepNote(at(8, 30), at(11, 0), '睡覺: 08:30 ~ 10:00 - 有翻身'),
  '睡覺: 早上8:30 ~ 中午11:00 - 有翻身'
);

// 舊 bug 疊出來的多層前綴，一次清乾淨
assert.equal(
  buildSleepNote(at(8, 30), at(11, 0), '睡覺: 08:30 ~ 10:00 - 睡覺: 早上8:30 ~ 早上10:00 - 吵醒兩次'),
  '睡覺: 早上8:30 ~ 中午11:00 - 吵醒兩次'
);

// 沒有備註就只有時間段，不要留下孤單的 " - "
assert.equal(buildSleepNote(at(13, 5), at(14, 0), ''), '睡覺: 下午1:05 ~ 下午2:00');

console.log('dateUtils.check: ok');
