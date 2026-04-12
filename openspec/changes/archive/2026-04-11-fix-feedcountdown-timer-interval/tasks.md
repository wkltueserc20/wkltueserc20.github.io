## 1. 修正 Timer 間隔

- [x] 1.1 在 `src/components/Home/FeedCountdown.tsx` 將 `setInterval(..., 60000)` 改回 `setInterval(..., 1000)`

## 2. 驗證與部署

- [x] 2.1 確認進度條可平滑移動、倒數字串每分鐘自動切換，不需重開頁面
- [x] 2.2 執行 `npm run build` 確認無 TypeScript 錯誤
- [x] 2.3 git commit & push
