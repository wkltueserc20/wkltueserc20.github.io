## Context

`RecordForm` 使用一個 `useEffect`（依賴 `isEditing`）在進入編輯模式時，從記錄清單中找到對應記錄並還原各欄位狀態。目前已有 `breastfeeding`、`bottle`、`sleep`、`medication` 等類型的還原邏輯，但 `babyfood` 類型的 `foodName`、`foodCategory`、`foodGrams` 欄位未被處理，導致編輯表單以預設空白狀態開啟。

## Goals / Non-Goals

**Goals:**
- 編輯既有 `babyfood` 記錄時，表單自動預填 `foodName`（r.label）、`foodCategory`（r.subType）、`foodGrams`（r.amount）

**Non-Goals:**
- 不修改儲存邏輯、不變更資料結構
- 不影響其他記錄類型的編輯行為

## Decisions

**只在 `useEffect` 的 `babyfood` 分支新增三行 setState**
- 現有各類型以 `if (r.type === '...')` 分支處理，直接跟進相同模式，改動範圍最小
- 不需要新增 hook 或重構，風險極低

## Risks / Trade-offs

- [風險極低] 若記錄的 `label`、`subType`、`amount` 為 undefined，使用 `|| ''` 和 `?? 30` 提供合理預設值，與新增時行為一致
