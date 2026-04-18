## Why

當使用者點擊既有的副食品（babyfood）記錄進行修改時，`RecordForm` 中的 `useEffect` 沒有針對 `babyfood` 類型恢復 `foodName`、`foodCategory`、`foodGrams` 等欄位，導致表單以空白預設值開啟，使用者必須重新輸入所有內容。

## What Changes

- 在 `RecordForm` 的編輯資料載入邏輯中，補上 `babyfood` 類型的欄位還原（`foodName`、`foodCategory`、`foodGrams`）

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `solid-food-autocomplete`: 編輯既有副食品記錄時，表單須預填 foodName、foodCategory、foodGrams 欄位

## Impact

- `src/components/Records/RecordForm.tsx`：在 useEffect 的 isEditing 分支中新增 babyfood 處理邏輯
