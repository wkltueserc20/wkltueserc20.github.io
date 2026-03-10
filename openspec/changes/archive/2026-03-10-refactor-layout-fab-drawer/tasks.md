## 1. 容器組件建立 (Layout)

- [x] 1.1 建立 `src/components/Layout/BottomSheet.tsx`，實作遮罩與滑動容器。
- [x] 1.2 在 `App.tsx` 中引入 `BottomSheet` 並放置於 DOM 底部。

## 2. 導覽列重構 (Navbar)

- [x] 2.1 修改 `App.tsx` 的導覽列佈局，正中央插入圓形「＋」按鈕。
- [x] 2.2 為圓形按鈕添加 `onClick` 觸發開啟表單狀態。
- [x] 2.3 調整現有 4 個 Tab 的寬度，預留空間給中央按鈕。

## 3. 狀態整合 (State Logic)

- [x] 3.1 在 `App.tsx` 新增 `showForm` 狀態。
- [x] 3.2 更新 `onEdit` 回呼：設定 `isEditing` 同時開啟 `showForm`。
- [x] 3.3 更新 `handleSaveRecord`：儲存成功後呼叫 `setShowForm(false)`。
- [x] 3.4 移除 `App.tsx` 中原本在頁面中間的 `RecordForm` 渲染邏輯。

## 4. 驗證與測試 (Verification)

- [x] 4.1 驗證「＋」按鈕：點擊後抽屜能平滑滑出。
- [x] 4.2 驗證遮罩：點擊後能正確關閉抽屜。
- [x] 4.3 執行 `npm run build` 確認佈局與型別正確（已通過）。
