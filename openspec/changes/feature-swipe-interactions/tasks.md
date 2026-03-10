## 1. 環境與依賴 (Setup)

- [x] 1.1 安裝 `framer-motion` 依賴。
- [x] 1.2 在 `tailwind.config.js` 中確認是否需要針對手勢增加特定配置（已確認不需要）。

## 2. 組件開發 (Component Development)

- [x] 2.1 建立 `src/components/Records/SwipeableRecordItem.tsx`。
- [x] 2.2 在組件中實作底層的紅色刪除區域。
- [x] 2.3 實作頂層的 `motion.div` 拖曳邏輯，包含位移鎖定與回彈。
- [x] 2.4 整合 `onTap` 觸發編輯功能。

## 3. 列表整合 (List Integration)

- [x] 3.1 修改 `src/components/Records/RecordList.tsx`，引入 `SwipeableRecordItem`。
- [x] 3.2 移除原本紀錄卡片右側的靜態 SVG 按鈕。
- [x] 3.3 調整卡片樣式，確保其符合「可點擊區域」的視覺提示。

## 4. 驗證與優化 (Verification)

- [x] 4.1 測試滑動刪除流程：左滑 -> 點擊紅色區域 -> 跳出確認彈窗 -> 成功刪除。
- [x] 4.2 測試點擊編輯流程：點擊卡片 -> 正確開啟編輯抽屜。
- [x] 4.3 驗證在快速捲動列表時，手勢處理穩定。
- [x] 4.4 執行 `npm run build` 確認系統穩定（已通過）。
