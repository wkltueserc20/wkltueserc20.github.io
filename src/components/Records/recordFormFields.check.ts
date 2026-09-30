// 表單初始值的自我檢查：node src/components/Records/recordFormFields.check.ts
// 這段邏輯原本散在 useEffect 裡，改寫成純函式後用 assert 擋回歸。
import assert from 'node:assert/strict';
import { initialFields } from './recordFormFields.ts';
import type { Record } from '../../types.ts';

const rec = (over: Partial<Record>): Record => ({
  id: 'x', type: 'feeding', time: '', timestamp: new Date(2026, 0, 1, 8, 30).getTime(), ...over,
});

// 新增：預設配方奶 180ml、副食品 120g
const blank = initialFields(null);
assert.equal(blank.type, 'feeding');
assert.equal(blank.milkType, 'formula');
assert.equal(blank.amount, 180);
assert.equal(blank.foodGrams, 120);
assert.equal(blank.note, '');

// 新增時帶 defaultType（從首頁捷徑進來）
assert.equal(initialFields(null, 'babyfood').type, 'babyfood');

// 編輯餵奶：奶類與奶量要還原，不要被預設值蓋掉
const feed = initialFields(rec({ type: 'feeding', milkType: 'breast', amount: 210 }));
assert.equal(feed.milkType, 'breast');
assert.equal(feed.amount, 210);

// 編輯副食品：品名、分類、公克數、食材都要還原
const food = initialFields(rec({
  type: 'babyfood', label: '南瓜粥', subType: '主食', amount: 150, ingredients: ['南瓜', '米'],
}));
assert.equal(food.foodName, '南瓜粥');
assert.equal(food.foodCategory, '主食');
assert.equal(food.foodGrams, 150);
assert.deepEqual(food.foodIngredients, ['南瓜', '米']);

// 編輯睡眠：有起床時間才填 recordEndTime
const sleepDone = initialFields(rec({ type: 'sleep', endTimestamp: new Date(2026, 0, 1, 10, 0).getTime() }));
assert.match(sleepDone.recordEndTime, /^2026-01-01T10:00$/);
assert.equal(initialFields(rec({ type: 'sleep' })).recordEndTime, '');

// 編輯用藥：藥名、劑量、單位要還原
const med = initialFields(rec({ type: 'medication', label: '退燒藥', amount: 2.5, subType: 'ml' }));
assert.equal(med.medName, '退燒藥');
assert.equal(med.medAmount, 2.5);
assert.equal(med.medUnit, 'ml');

// 非該類型的欄位不要殘留上一筆的值
assert.equal(food.medName, '');
assert.equal(med.foodName, '');

// 紀錄時間取自該筆的 timestamp，不是「現在」
assert.match(feed.recordTime, /^2026-01-01T08:30$/);

console.log('recordFormFields.check: ok');
