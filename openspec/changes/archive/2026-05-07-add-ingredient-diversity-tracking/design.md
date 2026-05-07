## Context

副食品統計頁（SolidFoodStatsPage）目前以 `label` 分組顯示記錄，但無法追蹤個別食材。`Record.label` 是自由文字（如「南瓜雞肉泥」），可能包含多種食材。目標是讓家長可以標記每個 label 的個別食材，並在頁面頂部顯示已嘗試食材總種類數。

所有運算完全在本地進行，不依賴外部 API，符合 PWA 離線可用需求。

## Goals / Non-Goals

**Goals:**
- 在 Record 型別加入 `ingredients` 欄位，與現有 sync 機制相容
- 副食品統計頁頂部顯示唯一食材種類數
- 每張卡片直接顯示食材 tag，可新增／刪除
- 同一 label 的所有記錄一次批次更新 ingredients
- 本地字典自動推斷，預填建議，可手動修改

**Non-Goals:**
- 不做食材分類或營養分析
- 不做跨記錄的食材引入時間軸（可未來擴充）
- 不使用外部 AI API

## Decisions

### 決策 1：ingredients 存在 Record 上，而非獨立 label-map

**選擇**：`Record.ingredients?: string[]` 直接放在每筆 record

**理由**：
- 沿用現有 IndexedDB + sync 機制，無需新表或新同步路徑
- 舊資料自動相容（欄位為 optional）
- 刪除單筆記錄時資料完整，無孤立映射問題

**替代方案**：維護 `label → ingredients` 的獨立 mapping 表
- 優點：每個 label 只需存一份
- 缺點：需要新的存儲層與同步邏輯，複雜度高

### 決策 2：以 label 為編輯單位，批次套用

**選擇**：UI 以 label 群組編輯，確認後一次更新所有同 label 的 records

**理由**：
- 同一 label 永遠對應相同食材，逐筆編輯沒有意義
- 操作次數從 N 筆降為 1 次
- 與現有 SolidFoodStatsPage 的分組邏輯天然契合

### 決策 3：本地字典自動推斷，不使用 AI API

**選擇**：內建約 60-80 個常見嬰兒副食品食材的字典 + 後綴剝除邏輯

**理由**：
- 離線可用（PWA 核心需求）
- 零 API 成本
- 嬰兒副食品食材集合有限，字典覆蓋率高
- 推斷結果僅為「建議」，用戶可修改，準確率不需完美

**後綴剝除**：泥、糊、粥、汁、羹、泡、蒸

**分詞策略**：從頭開始最長匹配（greedy），命中字典則切割，否則整段保留

### 決策 4：tag 選取 sheet 的資料來源分層

選取 sheet 顯示三層建議：
1. 自動推斷（從當前 label 解析）— 最優先
2. 歷史標籤（所有 records 的 ingredients 聯集去重）— 快速重用
3. 自由輸入（新食材，enter 新增）

## Risks / Trade-offs

- [字典覆蓋不足] 用戶自創食材名稱（如品牌名）無法推斷 → 用戶手動輸入即可，無功能性影響
- [批次更新] 同 label 但食材不同的邊緣情況（極少見）→ 暫不處理；必要時可從 long press 歷史明細進入單筆編輯（未來擴充）
- [sync 衝突] 多裝置同時編輯同 label 的 ingredients → 沿用現有 updatedAt 時間戳 last-write-wins 策略
