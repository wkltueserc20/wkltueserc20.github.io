import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import type { Record, TabType, RecordType } from './types';
import { useBabyInfo } from './hooks/useBabyInfo';
import { useRecords } from './hooks/useRecords';
import { useSync } from './hooks/useSync';
import {
  isSameDay,
  getYesterdayDateString,
  getRecordTargetTs,
  formatTimeWithPeriod,
} from './utils/dateUtils';
import { parseCSVLine } from './utils/csvUtils';
import { SummaryCards } from './components/Stats/SummaryCards';
const StatsTab = lazy(() => import('./components/Stats/StatsTab').then(m => ({ default: m.StatsTab })));
import { RecordForm } from './components/Records/RecordForm';
import { RecordList } from './components/Records/RecordList';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { SyncStatus } from './components/Layout/SyncStatus';
import { BottomSheet } from './components/Layout/BottomSheet';
import { SleepBanner } from './components/Layout/SleepBanner';
import { ConfirmDialog } from './components/Layout/ConfirmDialog';
import { QuickRecord } from './components/Home/QuickRecord';
import { SyncGuide } from './components/Home/SyncGuide';
import { FeedCountdown } from './components/Home/FeedCountdown';
import { VaccinePage } from './components/Vaccine/VaccinePage';
import type { MilkType } from './types';

const MS_PER_DAY = 86400000;
const MS_PER_MIN = 60000;

function App() {
  // --- States & Hooks ---
  const { babyInfo, setBabyInfo } = useBabyInfo();
  const { records, isLoading, addRecord, updateRecord, setAllRecords } = useRecords();
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark-mode');
    if (saved !== null) return saved === '1';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [filter, setFilter] = useState<'all' | RecordType>('all');
  const [searchDate, setSearchDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const activeSleep = useMemo(() =>
    records.find(r => r.type === 'sleep' && !r.endTimestamp && !r.isDeleted && !r.amount) ?? null,
    [records]
  );
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showSyncGuide, setShowSyncGuide] = useState(() => !localStorage.getItem('sync-guide-dismissed'));
  const [isPulling, setIsPulling] = useState(false);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string, undo?: () => void) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, undo });
    toastTimerRef.current = setTimeout(() => setToast(null), undo ? 5000 : 2500);
  }, []);

  const haptic = useCallback((ms = 10) => {
    try { navigator.vibrate?.(ms); } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('dark-mode', darkMode ? '1' : '0');
  }, [darkMode]);

  const {
    isConnected,
    isSyncing,
    syncError,
    fullSync,
  } = useSync(babyInfo, showToast);

  const recordsRef = useRef(records);
  const pullYRef = useRef<number | null>(null);
  useEffect(() => { recordsRef.current = records; }, [records]);

  const initialSyncRef = useRef(false);
  useEffect(() => {
    if (isConnected && babyInfo && !initialSyncRef.current) {
      initialSyncRef.current = true;
      fullSync(recordsRef.current, setAllRecords);
    }
  }, [isConnected, babyInfo, fullSync, setAllRecords]);

  useEffect(() => {
    if (!isConnected || !babyInfo) return;

    const triggerSync = () => {
      fullSync(recordsRef.current, setAllRecords, { silent: true });
    };

    const handleAutoSync = () => {
      if (document.visibilityState === 'visible') triggerSync();
    };

    const handleOnline = () => triggerSync();

    document.addEventListener('visibilitychange', handleAutoSync);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleAutoSync);
      window.removeEventListener('online', handleOnline);
    };
  }, [isConnected, fullSync, setAllRecords]);

  // --- Derived Data (Stats) ---
  const stats = useMemo(() => {
    const dayRecords = records.filter((r) => !r.isDeleted && isSameDay(getRecordTargetTs(r), searchDate));
    const yesterdayDate = getYesterdayDateString(searchDate);
    const yesterdayRecords = records.filter((r) => !r.isDeleted && isSameDay(getRecordTargetTs(r), yesterdayDate));

    const milkTotal = dayRecords.reduce((acc, curr) => acc + (curr.type === 'feeding' ? curr.amount || 0 : 0), 0);
    const sleepMins = dayRecords.reduce((acc, curr) => acc + (curr.type === 'sleep' ? curr.amount || 0 : 0), 0);
    const maxSleepSession = dayRecords
      .filter((r) => r.type === 'sleep')
      .reduce((max, r) => Math.max(max, r.amount || 0), 0);

    const yMilkTotal = yesterdayRecords.reduce((acc, curr) => acc + (curr.type === 'feeding' ? curr.amount || 0 : 0), 0);
    const ySleepMins = yesterdayRecords.reduce((acc, curr) => acc + (curr.type === 'sleep' ? curr.amount || 0 : 0), 0);

    const latestGrowth = records.find((r) => !r.isDeleted && r.type === 'growth');
    const daysSinceGrowth = latestGrowth
      ? Math.floor((new Date(searchDate).getTime() - latestGrowth.timestamp) / MS_PER_DAY)
      : null;

    const tempRecords = dayRecords.filter(r => r.type === 'temperature');
    const maxTemp = tempRecords.length > 0
      ? Math.max(...tempRecords.map(r => r.amount || 0))
      : null;

    return {
      milkTotal,
      sleepH: Math.floor(sleepMins / 60),
      sleepM: sleepMins % 60,
      maxSleepSession,
      latestGrowth,
      daysSinceGrowth,
      maxTemp,
      tempCount: tempRecords.length,
      yesterday: {
        milkTotal: yMilkTotal,
        sleepMins: ySleepMins
      }
    };
  }, [records, searchDate]);

  // --- Actions ---
  const myDevice = babyInfo?.deviceName || '';

  const handleStartSleep = (time: string) => {
    const st = new Date(time).getTime();
    if (isNaN(st)) return;
    const newRec: Record = {
      id: crypto.randomUUID(),
      type: 'sleep',
      time: new Date(st).toLocaleString('zh-TW'),
      timestamp: st,
      amount: 0,
      note: '睡覺中...',
      updatedAt: Date.now(),
      deviceName: myDevice,
    };
    addRecord(newRec);
    haptic();
    const newRecords = [newRec, ...records].sort((a, b) => b.timestamp - a.timestamp);
    fullSync(newRecords, setAllRecords);
    showToast('開始紀錄睡眠 😴');
  };

  const handleFinishSleep = () => {
    if (!activeSleep) return;
    const nowTs = Date.now();
    const diffMins = Math.floor((nowTs - activeSleep.timestamp) / MS_PER_MIN);
    const updatedRec: Record = {
      ...activeSleep,
      time: new Date(nowTs).toLocaleString('zh-TW'),
      endTimestamp: nowTs,
      amount: diffMins,
      note: `睡覺: ${formatTimeWithPeriod(activeSleep.timestamp)} ~ ${formatTimeWithPeriod(nowTs)}`,
      updatedAt: nowTs,
    };
    updateRecord(updatedRec);
    haptic(20);
    const updatedRecords = records.map(r => r.id === activeSleep.id ? updatedRec : r);
    fullSync(updatedRecords, setAllRecords);
    showToast('寶寶起床了 ☀️ 紀錄已存檔');
  };

  const handleSaveRecord = (recordData: any) => {
    const ts = new Date(recordData.recordTime).getTime();
    let fAm = recordData.amount;
    let fEnd = recordData.recordEndTime ? new Date(recordData.recordEndTime).getTime() : undefined;
    let fNt = recordData.note;
    let fTime = new Date(ts).toLocaleString('zh-TW');

    if (recordData.type === 'sleep' && fEnd) {
      fAm = Math.max(0, Math.round((fEnd - ts) / MS_PER_MIN));
      fTime = new Date(fEnd).toLocaleString('zh-TW');
      const pureNote = recordData.note.replace(/^睡覺: \d{2}:\d{2} ~ \d{2}:\d{2}( - )?/, '');
      const timeRange = `${new Date(ts).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })} ~ ${new Date(fEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      fNt = `睡覺: ${timeRange}${pureNote ? ' - ' + pureNote : ''}`;
    }

    const base: Partial<Record> = {
      type: recordData.type,
      note: fNt,
      time: fTime,
      timestamp: ts,
      endTimestamp: fEnd,
      milkType: recordData.milkType,
      amount: fAm,
      weight: recordData.weight,
      height: recordData.height,
      subType: recordData.subType,
      label: recordData.label,
      updatedAt: Date.now(),
      deviceName: myDevice,
    };

    let updatedRecords: Record[];
    if (isEditing) {
      const target = records.find((r) => r.id === isEditing);
      const newRec = { ...target, ...base } as Record;
      updateRecord(newRec);
      updatedRecords = records.map((r) => (r.id === isEditing ? newRec : r));
      setIsEditing(null);
      showToast('修改成功 ✅');
    } else {
      const newId = crypto.randomUUID();
      const newRec = { id: newId, ...base } as Record;
      addRecord(newRec);
      updatedRecords = [newRec, ...records];
      showToast('新增成功 ✨');
    }
    setShowForm(false);
    fullSync(updatedRecords, setAllRecords);
  };

  const handleDeleteRecord = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const target = records.find((r) => r.id === deleteTarget);
    if (!target) return;
    const updatedRec = { ...target, isDeleted: true, updatedAt: Date.now() };
    updateRecord(updatedRec);
    const newRecs = records.map(r => r.id === deleteTarget ? updatedRec : r);
    haptic(15);
    fullSync(newRecs, setAllRecords);
    setDeleteTarget(null);

    const undoDelete = () => {
      const restored = { ...target, isDeleted: false, updatedAt: Date.now() };
      updateRecord(restored);
      const restoredRecs = records.map(r => r.id === target.id ? restored : r);
      fullSync(restoredRecs, setAllRecords);
      showToast('已復原 ✅');
    };
    showToast('已刪除 🗑️', undoDelete);
  };

  const handleQuickFeed = (milkType: MilkType, amount: number) => {
    const nowTs = Date.now();
    const newRec: Record = {
      id: crypto.randomUUID(),
      type: 'feeding',
      milkType,
      time: new Date(nowTs).toLocaleString('zh-TW'),
      timestamp: nowTs,
      amount,
      updatedAt: nowTs,
      deviceName: myDevice,
    };
    addRecord(newRec);
    const updatedRecords = [newRec, ...records];
    haptic();
    showToast(`${milkType === 'formula' ? '配方' : '母奶'} ${amount}ml ✨`);
    fullSync(updatedRecords, setAllRecords);
  };

  const handleAddVaccine = (data: Omit<Record, 'id' | 'time' | 'updatedAt'>) => {
    const nowTs = Date.now();
    const newRec: Record = {
      ...data,
      id: crypto.randomUUID(),
      time: new Date(data.timestamp).toLocaleString('zh-TW'),
      updatedAt: nowTs,
      deviceName: myDevice,
    };
    addRecord(newRec);
    const updated = [newRec, ...records];
    fullSync(updated, setAllRecords);
  };

  const handleMarkVaccineDone = (record: Record, actualDate: number) => {
    const updatedRec = { ...record, endTimestamp: actualDate, updatedAt: Date.now() };
    updateRecord(updatedRec);
    haptic();
    const updated = records.map(r => r.id === record.id ? updatedRec : r);
    fullSync(updated, setAllRecords);
    showToast(`${record.subType} ${record.label} 已施打 ✅`);
  };

  const handleEditVaccine = (record: Record, newEndTimestamp: number, newNote: string) => {
    const updatedRec = { ...record, endTimestamp: newEndTimestamp, note: newNote, updatedAt: Date.now() };
    updateRecord(updatedRec);
    haptic();
    const updated = records.map(r => r.id === record.id ? updatedRec : r);
    fullSync(updated, setAllRecords);
    showToast(`${record.subType} ${record.label} 已更新 ✅`);
  };

  const handlePullRefresh = useCallback(() => {
    if (isPulling || !isConnected) return;
    setIsPulling(true);
    fullSync(recordsRef.current, setAllRecords, { silent: true });
    setTimeout(() => setIsPulling(false), 1500);
  }, [isPulling, isConnected, fullSync, setAllRecords]);

  const handleExportCSVLocal = () => {
    const now = new Date();
    const dateStr = now
      .toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
      .replace(/\//g, '');
    const timeStr = now
      .toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' })
      .replace(/:/g, '');
    const fileName = `baby_records_${dateStr}_${timeStr}.csv`;

    let csv = '\uFEFFID,時間,類別,奶種,數值,狀態,體重,身高,開始時間戳,結束時間戳,備註,最後修改時間戳\n';
    records.forEach((r) => {
      csv += `"${r.id}","${r.time}","${r.type}","${r.milkType || ''}","${r.amount || ''}","${r.isDeleted ? 'deleted' : ''}","${
        r.weight || ''
      }","${r.height || ''}","${r.timestamp}","${r.endTimestamp || ''}","${r.note || ''}","${r.updatedAt || ''}"\n`;
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;' }));
    link.download = fileName;
    link.click();
    showToast(`已匯出 ${fileName} 📥`);
  };

  const handleImportCSVLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        if (!text) return;
        const lines = text
          .split('\n')
          .filter((l) => l.trim() !== '')
          .slice(1);
        let count = 0;
        const validTypes = new Set(['feeding', 'sleep', 'growth']);
        const newRecs = [...records];
        lines.forEach((l) => {
          try {
            const c = parseCSVLine(l.trim());
            if (c.length < 11) return;
            const ts = Number(c[8]);
            const recordType = c[2] as RecordType;
            if (!validTypes.has(recordType) || isNaN(ts) || newRecs.some((rr) => rr.timestamp === ts)) return;
            newRecs.push({
              id: c[0] || crypto.randomUUID(),
              time: c[1],
              timestamp: ts,
              type: recordType,
              milkType: (c[3] === 'formula' || c[3] === 'breast') ? c[3] : undefined,
              amount: c[4] ? Number(c[4]) : undefined,
              weight: c[6] ? Number(c[6]) : undefined,
              height: c[7] ? Number(c[7]) : undefined,
              endTimestamp: c[9] ? Number(c[9]) : undefined,
              note: c[10],
              updatedAt: c[11] ? Number(c[11]) : Date.now(),
            });
            count++;
          } catch { /* skip malformed line */ }
        });
        if (count > 0) {
          setAllRecords(newRecs);
          showToast(`成功匯入 ${count} 筆資料 📥`);
        } else {
          showToast('未找到可匯入的資料');
        }
      } catch {
        showToast('匯入失敗，CSV 格式錯誤 ❌');
      }
    };
    rd.readAsText(f);
    e.target.value = '';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 300;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > MAX) {
            h *= MAX / w;
            w = MAX;
          }
        } else {
          if (h > MAX) {
            w *= MAX / h;
            h = MAX;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        if (babyInfo) setBabyInfo({ ...babyInfo, avatar: canvas.toDataURL('image/jpeg', 0.7) });
        showToast('頭像更換成功 📸');
      };
      img.src = ev.target?.result as string;
    };
    rd.readAsDataURL(f);
  };

  const isTodaySearch = searchDate === new Date().toLocaleDateString('en-CA');

  const TAB_ORDER: TabType[] = ['home', 'stats', 'vaccine', 'settings'];
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const handleSwipeStart = (e: React.TouchEvent) => {
    swipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleSwipeEnd = (e: React.TouchEvent) => {
    if (!swipeRef.current) return;
    const dx = e.changedTouches[0].clientX - swipeRef.current.x;
    const dy = e.changedTouches[0].clientY - swipeRef.current.y;
    swipeRef.current = null;
    const tag = (document.activeElement as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;
    const idx = TAB_ORDER.indexOf(currentTab);
    if (dx < 0 && idx < TAB_ORDER.length - 1) setCurrentTab(TAB_ORDER[idx + 1]);
    if (dx > 0 && idx > 0) setCurrentTab(TAB_ORDER[idx - 1]);
  };

  const [setupName, setSetupName] = useState('');
  const [setupBirthday, setSetupBirthday] = useState('');

  if (!babyInfo) {
    return (
      <div className="min-h-screen bg-indigo-50 dark:bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-10 space-y-8 border-b-8 border-indigo-100 dark:border-indigo-900">
          <h2 className="text-4xl text-indigo-600">育兒助手</h2>
          <div className="space-y-5 text-left">
            <input
              type="text"
              value={setupName}
              onChange={e => setSetupName(e.target.value)}
              className="w-full p-5 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10"
              placeholder="請輸入名字"
            />
            <input
              type="date"
              value={setupBirthday}
              onChange={e => setSetupBirthday(e.target.value)}
              className="w-full p-5 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
          <button
            onClick={() => { if (setupName && setupBirthday) setBabyInfo({ name: setupName, birthday: setupBirthday }); }}
            className="w-full bg-indigo-600 text-white py-6 rounded-3xl shadow-xl active:scale-95 transition-all text-xl"
          >
            開始使用
          </button>
        </div>
      </div>
    );
  }

  const babyAge = (() => {
    const birth = new Date(babyInfo.birthday);
    const totalDays = Math.floor((Date.now() - birth.getTime()) / MS_PER_DAY);
    const years = Math.floor(totalDays / 365);
    const weeks = Math.floor((totalDays % 365) / 7);
    const days = (totalDays % 365) % 7;
    return {
      text: `${years > 0 ? years + '歲 ' : ''}${weeks > 0 ? weeks + '週 ' : ''}${days}天`,
      days: totalDays,
    };
  })();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 pb-32 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {toast && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md text-white px-6 py-3.5 rounded-full shadow-2xl text-[11px] border border-white/10 uppercase flex items-center gap-3">
            <span>{toast.msg}</span>
            {toast.undo && (
              <button
                onClick={() => { toast.undo?.(); setToast(null); }}
                className="text-indigo-300 underline underline-offset-2 active:text-white transition-colors"
              >
                復原
              </button>
            )}
          </div>
        </div>
      )}
      <header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="max-w-md mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4 text-left">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border-4 border-white shadow-lg overflow-hidden flex-shrink-0 flex items-center justify-center active:scale-95 transition-transform">
              {babyInfo.avatar ? (
                <img src={babyInfo.avatar} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">👶</span>
              )}
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tighter leading-none mb-1.5">
                {babyInfo.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-xs shadow-md font-semibold">
                  {babyAge.text}
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-widest">
                  第 {babyAge.days} 天
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label="切換深色模式"
              className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 w-9 h-9 rounded-2xl flex items-center justify-center text-sm shadow-xl active:scale-90 transition-all"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <SyncStatus isSyncing={isSyncing} syncError={syncError} />
          </div>
        </div>
      </header>

      <main
        className="max-w-md mx-auto px-6 pt-8 space-y-7"
        onTouchStart={(e) => {
          pullYRef.current = e.touches[0].clientY;
          handleSwipeStart(e);
        }}
        onTouchEnd={(e) => {
          if (pullYRef.current !== null) {
            const endY = e.changedTouches[0].clientY;
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            if (scrollTop <= 0 && endY - pullYRef.current > 80) handlePullRefresh();
            pullYRef.current = null;
          }
          handleSwipeEnd(e);
        }}
      >
        {isPulling && (
          <div className="flex justify-center py-3 animate-in fade-in duration-200">
            <div className="w-6 h-6 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        )}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-xs text-slate-400 uppercase tracking-widest">載入中...</p>
          </div>
        ) : <>
        <SleepBanner startTime={activeSleep?.timestamp ?? null} onFinish={handleFinishSleep} />
        <div key={currentTab} className="animate-in fade-in duration-300">

        {currentTab === 'home' && (
          <>
            {showSyncGuide && !isConnected && (
              <SyncGuide
                onGoToSettings={() => { setCurrentTab('settings'); setShowSyncGuide(false); }}
                onDismiss={() => { setShowSyncGuide(false); localStorage.setItem('sync-guide-dismissed', '1'); }}
              />
            )}

            <QuickRecord records={records} onQuickFeed={handleQuickFeed} />

            <FeedCountdown records={records} feedIntervalMs={(babyInfo.feedIntervalHours || 4) * 3600000} />

            <SummaryCards
              searchDate={searchDate}
              setSearchDate={setSearchDate}
              isTodaySearch={isTodaySearch}
              stats={stats}
            />

            <RecordList
              records={records}
              searchDate={searchDate}
              filter={filter}
              setFilter={setFilter}
              onEdit={(r) => {
                setIsEditing(r.id);
                setShowForm(true);
              }}
              onDelete={handleDeleteRecord}
            />
          </>
        )}

        {currentTab === 'stats' && (
          <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>}>
            <StatsTab records={records} />
          </Suspense>
        )}

        {currentTab === 'settings' && (
          <SettingsPanel
            babyInfo={babyInfo}
            setBabyInfo={setBabyInfo}
            records={records}
            setRecords={setAllRecords}
            isConnected={isConnected}
            isSyncing={isSyncing}
            syncError={syncError}
            onFullSync={() => fullSync(records, setAllRecords)}
            handleExportCSV={handleExportCSVLocal}
            handleImportCSV={handleImportCSVLocal}
            onImageUpload={handleImageUpload}
          />
        )}

        {currentTab === 'vaccine' && babyInfo && (
          <VaccinePage
            records={records}
            babyInfo={babyInfo}
            onAddVaccine={handleAddVaccine}
            onMarkDone={handleMarkVaccineDone}
            onEditVaccine={handleEditVaccine}
          />
        )}

        </div>
        </>}
      </main>

      <nav aria-label="主選單" className="fixed bottom-0 w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-700 px-6 pb-10 pt-4 z-50 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex justify-between items-center relative">
          {/* 左側 2 個 Tabs */}
          {[
            { id: 'home', icon: '📝', label: '日常' },
            { id: 'stats', icon: '📈', label: '統計' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as TabType)}
              className={`flex-1 flex flex-col items-center gap-1 transition-all duration-500 ${
                currentTab === tab.id ? 'text-indigo-600' : 'text-slate-300'
              }`}
            >
              <span className={`text-xl transition-all duration-500 ${currentTab === tab.id ? '' : 'grayscale opacity-40 scale-90'}`}>{tab.icon}</span>
              <span className={`text-[9px] transition-all duration-500 ${currentTab === tab.id ? 'opacity-100' : 'opacity-0'}`}>{tab.label}</span>
            </button>
          ))}

          <div className="flex justify-center -mt-10">
            <button
              aria-label="新增紀錄"
              onClick={() => { setIsEditing(null); setShowForm(true); }}
              className="w-14 h-14 bg-slate-900 dark:bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl shadow-2xl active:scale-90 transition-all border-4 border-white dark:border-slate-800"
            >
              ＋
            </button>
          </div>

          {[
            { id: 'vaccine', icon: '💉', label: '疫苗' },
            { id: 'settings', icon: '⚙️', label: '設定' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as TabType)}
              className={`flex-1 flex flex-col items-center gap-1 transition-all duration-500 ${
                currentTab === tab.id ? 'text-indigo-600' : 'text-slate-300'
              }`}
            >
              <span className={`text-xl transition-all duration-500 ${currentTab === tab.id ? '' : 'grayscale opacity-40 scale-90'}`}>{tab.icon}</span>
              <span className={`text-[9px] transition-all duration-500 ${currentTab === tab.id ? 'opacity-100' : 'opacity-0'}`}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* 全域表單抽屜 */}
      <BottomSheet 
        isOpen={showForm} 
        onClose={() => { setShowForm(false); setIsEditing(null); }}
        title={isEditing ? "修改紀錄" : "新增育兒紀錄"}
      >
        <RecordForm
          isEditing={isEditing}
          records={records}
          onSave={handleSaveRecord}
          onCancel={() => { setShowForm(false); setIsEditing(null); }}
          activeSleep={activeSleep}
          onStartSleep={handleStartSleep}
          onFinishSleep={handleFinishSleep}
        />
      </BottomSheet>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="刪除紀錄"
        message="確定要刪除這筆紀錄嗎？此操作無法復原。"
        confirmLabel="刪除"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default App;
