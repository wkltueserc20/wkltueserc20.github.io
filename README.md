# 👶 育兒助手 - 現代化高品質 Web App (v9.8)

這是一個專為父母設計的高品質育兒紀錄助手。採用 **React 19** + **Vite** 構建，具備 **PWA** 離線能力與 **Google Drive** 自動雙向同步。

[![🚀 在線演示](https://img.shields.io/badge/演示-wkltueserc20.github.io-6366f1?style=for-the-badge&logo=react)](https://wkltueserc20.github.io)
[![📖 功能手冊](https://img.shields.io/badge/手冊-README_FEATURES-10b981?style=for-the-badge&logo=markdown)](README_FEATURES.md)

---

## ✨ 核心亮點 (v9.8)

- **⚡ 極速 SmartSync 協定**：將 Client-GAS 通訊從 2 次 HTTP 請求合併為 **1 次**，GAS 內部使用 `fetchAll()` 並行化所有 Drive API 呼叫，同步時間從 20+ 秒大幅降至 3-5 秒。
- **🔄 自適應推送 (Dirty Date Tracking)**：自動追蹤有變更的日期，不再固定只推送今天和昨天，補登舊日期紀錄也能正確同步。
- **☀️ 睡眠日期修正**：以起床時間作為歸屬，完美處理跨夜覺統計。
- **💤 睡眠即時監控**：首頁動態橫幅顯示入睡時長，支援一鍵起床紀錄。
- **📂 雲端自動歸檔**：Google Drive 備份自動收納於專屬資料夾，整潔有序。
- **📈 統計區間切換**：支援 7天 / 14天 / 28天 趨勢觀察。
- **📱 絲滑手勢互動**：專為 iPhone 優化的左滑刪除與軸向鎖定技術。
- **🏗️ 現代化 FAB 佈局**：底部圓形動作按鈕與優雅的抽屜式表單 (Bottom Sheet)。
- **☁️ 長效代理同步**：透過專屬 GAS 代理實現一次授權、數月有效的無感雲端同步。
- **📊 智能數據洞察**：自動計算今日 vs 昨日奶量對比，提供長覺睡眠分析。
- **🔌 多人協作**：支援多設備同時紀錄，資料自動合併不覆蓋。

---

## 🚀 快速開始

### 本地開發
```bash
git clone https://github.com/wkltueserc20/wkltueserc20.github.io.git
cd wkltueserc20.github.io
npm install
npm run dev
```

---

## 🛠 技術規格

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Framer Motion
- **Database**: IndexedDB (via Dexie.js)
- **Synchronization**: Google Drive API + Google Apps Script (GAS) SmartSync Proxy (fetchAll parallel)
- **PWA**: Service Worker (via vite-plugin-pwa) for offline support

---

## 📂 更多文件

- [📘 詳細功能與 LINE 通知設定手冊](README_FEATURES.md)
- [📦 GAS 後端原始碼](openspec/GAS_SCRIPT.gs)

---
*Created with ❤️ for better parenting.*
