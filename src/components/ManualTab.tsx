export const ManualTab: React.FC = () => (
  <div className="space-y-6 pb-16 animate-in fade-in duration-500 text-left">
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
      <h2 className="text-xl text-indigo-600 flex items-center gap-2 font-bold">
        <span className="text-2xl">📖</span> 操作手冊
      </h2>

      <section className="space-y-2">
        <h3 className="text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl inline-block font-semibold">
          🍼 餵奶紀錄
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          新增餵奶紀錄後，首頁會顯示距離下一餐的倒數計時（間隔可在設定中調整）。
          <br />• <b>深夜靜音：</b> 23:00~01:00 的紀錄不會顯示倒數。
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl inline-block font-semibold">
          ☁️ 雲端同步
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          系統透過 Cloudflare 雲端實現<b>多設備即時同步</b>。
          <br />• <b>快速同步：</b> 每次儲存自動同步，延遲不到 1 秒。
          <br />• <b>全自動：</b> 回到 App 或網路恢復時自動靜默同步。
          <br />• <b>多人協作：</b> 家人共用同一組同步密碼即可共享資料。
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-xl inline-block font-semibold">
          📶 離線支援 (PWA)
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          本應用支援<b>完全斷網紀錄</b>。
          <br />• <b>秒開體驗：</b> 加入主畫面後，即便在飛航模式也能秒開 App。
          <br />• <b>離線紀錄：</b> 斷網時的紀錄會暫存在手機，連線後自動併入雲端。
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-xl inline-block font-semibold">
          ⚙️ 故障排除
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          若資料未同步，請嘗試：
          <br />1. 點擊設定頁的 <b>「立即雙向同步」</b> 按鈕。
          <br />2. 確認設定中的 <b>同步伺服器 URL</b> 與 <b>同步密碼</b> 是否正確。
          <br />3. 確認網路連線正常。
        </p>
      </section>
    </div>
  </div>
);
