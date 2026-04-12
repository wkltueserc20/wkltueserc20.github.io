## Context

`FeedCountdown` 使用 `setInterval` 驅動 `now` 狀態，進而讓 `useMemo` 重新計算倒數文字與進度條。v9.12 將間隔從 1000ms 改為 60000ms，目的是節省資源，但造成進度條 60 秒才動一次、畫面看起來凍結的問題。

## Goals / Non-Goals

**Goals:**
- 恢復倒數計時的即時感（進度條平滑移動）
- 不引入額外複雜度

**Non-Goals:**
- 精確對齊到整分鐘邊界
- 重新設計 FeedCountdown 的渲染架構

## Decisions

**保留 1000ms interval**

倒數字串（`Xh Ym`）雖然每分鐘才換一次，但進度條 `width` 每秒都在微調，配合 `transition-all duration-1000` 的 CSS 動畫，讓元件看起來有生命感。改為 60000ms 後進度條完全靜止，與使用者預期不符。

1000ms vs 替代方案比較：
- 10000ms（10s）：進度條每 10 秒跳一次，仍感覺不流暢
- requestAnimationFrame：過於複雜，收益不大
- 1000ms：最簡單，與原始行為一致，元件本身夠輕量，CPU 負擔可接受

## Risks / Trade-offs

- [效能] 每秒 re-render 一次 → 元件輕量（只有一個 `div` + 進度條），實際影響極小
