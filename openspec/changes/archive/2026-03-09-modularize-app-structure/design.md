## Context

目前系統是單一檔案（Single File）架構，所有的狀態與 UI 邏輯高度耦合在 `App.tsx` 中。這雖然方便初期的快速開發，但隨著同步邏輯、多種類紀錄、以及圖表顯示等功能的加入，單一檔案的維護成本已經過高。

## Goals / Non-Goals

**Goals:**
- 將型別定義移至 `src/types.ts`。
- 將非同步副作用（Sync, LocalStorage）移至 `src/hooks/`。
- 將 UI 片段拆分為具備獨立職責的組件（例如 `RecordForm`, `RecordList`, `Settings`）。
- **維持資料持久性**：確保 LocalStorage 中的數據在重構後依然能被正確讀取。

**Non-Goals:**
- 不改變 `Record` 物件的結構。
- 不引入新的狀態管理庫（如 Redux 或 Zustand），維持 React 內建的 State 管理（除非未來有更複雜的需求）。
- 不改動現有的 CSS 樣式邏輯（Tailwind classes）。

## Decisions

### 1. 檔案組織結構
- **`src/types.ts`**: 作為全域型別來源，避免循環依賴。
- **`src/hooks/`**: 用於存放封裝後的業務邏輯。例如 `useSync.ts` 將整合原本在 App 裡的 Google Drive 與 LINE 通知邏輯。
- **`src/components/`**: 存放 React 組件。

### 2. 資料同步封裝 (Sync Hooks)
- 原本在 `App.tsx` 中的數個 `useEffect` 和 API 呼叫函式將整合進一個自定義 Hook。
- 這個 Hook 會接收目前的 `records` 與 `babyInfo` 作為輸入，並處理所有的背景同步（Drive, GAS）。

### 3. 組件間的通訊
- 使用 **「提升狀態 (Lifting State Up)」** 的策略，將主要狀態保留在 `App.tsx` 中（或一個頂層的 Hook），並透過 `props` 傳遞給子組件。
- 子組件則透過 `onAction`（如 `onSave`, `onDelete`）通知父組件進行狀態更新。

## Risks / Trade-offs

- **[Risk] 閉包陷阱與副作用同步**：在將邏輯搬移至 Hook 時，需特別注意原本 `useRef` 與 `useEffect` 的依賴關係，避免造成同步循環或數據不一致。
    - 🛡️ **Mitigation**: 在拆解前對 `App.tsx` 中的關鍵邏輯進行詳細註釋，並逐步遷移與測試。
- **[Trade-off] 代碼行數增加**：雖然單一檔案行數減少，但專案總檔案數會增加，且需要處理更多的 `import/export`。
    - 🛡️ **Mitigation**: 使用現代化 IDE 的導航功能與清晰的資料夾命名。
