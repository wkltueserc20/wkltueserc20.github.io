import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Record, TabType, RecordType } from './types';
import { useBabyInfo } from './hooks/useBabyInfo';
import { useRecords } from './hooks/useRecords';
import { useSync } from './hooks/useSync';
import {
  isSameDay,
  getRecordTargetTs,
  formatTimeWithPeriod,
} from './utils/dateUtils';
import { parseCSVLine } from './utils/csvUtils';
import { SummaryCards } from './components/Stats/SummaryCards';
import { RecordForm } from './components/Records/RecordForm';
import { RecordList } from './components/Records/RecordList';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { SyncStatus } from './components/Layout/SyncStatus';

function App() {
  // --- States & Hooks ---
  const { babyInfo, setBabyInfo } = useBabyInfo();
  const { records, addRecord, updateRecord, setAllRecords } = useRecords();
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | RecordType>('all');
  const [searchDate, setSearchDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const [sleepStartTime, setSleepStartTime] = useState<number | null>(() => {
    const s = localStorage.getItem('baby-sleep-start');
    return s ? Number(s) : null;
  });
  const [now, setNow] = useState<number>(Date.now());
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const {
    accessToken,
    isSyncing,
    syncError,
    sendLineAction,
    callGasApi,
    cancelGasSchedule,
    handleGoogleLogin,
    fullSync,
  } = useSync(babyInfo, showToast);

  // --- Effects ---
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (sleepStartTime) localStorage.setItem('baby-sleep-start', sleepStartTime.toString());
    else localStorage.removeItem('baby-sleep-start');
  }, [sleepStartTime]);

  const initialSyncRef = useRef(false);
  useEffect(() => {
    // 關鍵修正：必須等待 babyInfo 載入完成才能進行 GAS 代理同步
    if (accessToken && babyInfo && !initialSyncRef.current) {
      initialSyncRef.current = true;
      fullSync(records, setAllRecords);
    }
  }, [accessToken, babyInfo, fullSync, setAllRecords, records]);

  const recordsRef = useRef(records);
  useEffect(() => { recordsRef.current = records; }, [records]);

  useEffect(() => {
    if (!accessToken || !babyInfo) return; // 增加 babyInfo 檢查

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
  }, [accessToken, fullSync, setAllRecords]); // Removed records from dependencies

  // --- Derived Data (Stats) ---
  const stats = useMemo(() => {
    const dayRecords = records.filter((r) => !r.isDeleted && isSameDay(getRecordTargetTs(r), searchDate));
    const milkTotal = dayRecords.reduce(
      (acc, curr) => acc + (curr.type === 'feeding' ? curr.amount || 0 : 0),
      0
    );
    const sleepMins = dayRecords.reduce(
      (acc, curr) => acc + (curr.type === 'sleep' ? curr.amount || 0 : 0),
      0
    );
    const latestGrowth = records.find((r) => !r.isDeleted && r.type === 'growth');
    return {
      milkTotal,
      sleepH: Math.floor(sleepMins / 60),
      sleepM: sleepMins % 60,
      latestGrowth,
    };
  }, [records, searchDate]);

  const nextFeed = useMemo(() => {
    const last = records.find((r) => !r.isDeleted && r.type === 'feeding');
    if (!last) return null;
    const hr = new Date(last.timestamp).getHours();
    if (hr === 23 || hr === 0) return { skip: true };
    const target = last.timestamp + 4 * 60 * 60 * 1000;
    const diff = target - now;
    if (diff <= -43200000) return null;
    const abs = Math.abs(diff);
    return {
      str: `${Math.floor(abs / 3600000)}h ${Math.floor((abs % 3600000) / 60000)}m ${Math.floor(
        (abs % 60000) / 1000
      )}s`,
      isOver: diff < 0,
      targetStr: formatTimeWithPeriod(target),
      id: last.id,
    };
  }, [records, now]);

  const milkChartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const dayTotal = records
        .filter((r) => !r.isDeleted && isSameDay(r.timestamp, dateStr) && r.type === 'feeding')
        .reduce((s, r) => s + (r.amount || 0), 0);
      data.push({
        name: d.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }),
        amount: dayTotal,
      });
    }
    return data;
  }, [records]);

  const sleepChartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const mins = records
        .filter((r) => !r.isDeleted && r.type === 'sleep' && isSameDay(getRecordTargetTs(r), dateStr))
        .reduce((s, r) => s + (r.amount || 0), 0);
      data.push({
        name: d.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }),
        hours: parseFloat((mins / 60).toFixed(1)),
      });
    }
    return data;
  }, [records]);

  const growthChartData = useMemo(
    () =>
      records
        .filter((r) => !r.isDeleted && r.type === 'growth')
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((r) => ({
          date: new Date(r.timestamp).toLocaleDateString('zh-TW', {
            month: 'numeric',
            day: 'numeric',
          }),
          weight: r.weight,
          height: r.height,
        })),
    [records]
  );

  // --- Actions ---
  const handleStartSleep = (time: string) => {
    const st = new Date(time).getTime();
    if (isNaN(st)) return;
    setSleepStartTime(st);
    setNow(Date.now());
    showToast('開始紀錄睡眠 😴');
  };

  const handleWakeUp = () => {
    if (!sleepStartTime) return;
    const et = Date.now();
    const diff = Math.round((et - sleepStartTime) / 60000);
    const newRec: Record = {
      id: crypto.randomUUID(),
      type: 'sleep',
      time: new Date(et).toLocaleString('zh-TW'),
      timestamp: sleepStartTime,
      endTimestamp: et,
      amount: diff,
      note: `睡覺: ${new Date(sleepStartTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })} ~ ${new Date(et).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      updatedAt: Date.now(),
    };
    const newRecords = [newRec, ...records].sort((a, b) => b.timestamp - a.timestamp);
    addRecord(newRec);
    setSleepStartTime(null);
    showToast('紀錄成功 ✨');
    fullSync(newRecords, setAllRecords);
  };

  const handleSaveRecord = (recordData: any) => {
    const ts = new Date(recordData.recordTime).getTime();
    let fAm = recordData.amount;
    let fEnd = recordData.recordEndTime ? new Date(recordData.recordEndTime).getTime() : undefined;
    let fNt = recordData.note;
    let fTime = new Date(ts).toLocaleString('zh-TW');

    if (recordData.type === 'sleep' && fEnd) {
      fAm = Math.max(0, Math.round((fEnd - ts) / 60000));
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
      updatedAt: Date.now(),
    };

    if (recordData.type === 'feeding') {
      const hr = new Date(ts).getHours();
      if (hr !== 23 && hr !== 0) {
        if (babyInfo?.lineEnabled) {
          callGasApi(ts + 4 * 60 * 60 * 1000);
          showToast('☁️ 正在同步雲端提醒...');
        }
      } else {
        cancelGasSchedule();
        showToast('🌙 深夜長睡眠，已取消雲端提醒');
      }
    }

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
    fullSync(updatedRecords, setAllRecords);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('確定要刪除這筆紀錄嗎？')) {
      const target = records.find((r) => r.id === id);
      if (!target) return;
      const updatedRec = { ...target, isDeleted: true, updatedAt: Date.now() };
      updateRecord(updatedRec);
      
      const newRecs = records.map(r => r.id === id ? updatedRec : r);
      showToast('已刪除 🗑️');
      fullSync(newRecs, setAllRecords);
      if (target?.type === 'feeding') cancelGasSchedule();
    }
  };

  const handleExportCSVLocal = () => {
    const now = new Date();
    const dateStr = now
      .toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
      .replace(/\//g, '');
    const timeStr = now
      .toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' })
      .replace(/:/g, '');
    const fileName = `baby_records_${dateStr}_${timeStr}.csv`;

    let csv = '\uFEFFID,時間,類別,奶種,數值,狀態,體重,身高,開始時間戳,結束時間戳,備註\n';
    records.forEach((r) => {
      csv += `"${r.id}","${r.time}","${r.type}","${r.milkType || ''}","${r.amount || ''}","","${
        r.weight || ''
      }","${r.height || ''}","${r.timestamp}","${r.endTimestamp || ''}","${r.note || ''}"\n`;
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
      const text = ev.target?.result as string;
      const lines = text
        .split('\n')
        .filter((l) => l.trim() !== '')
        .slice(1);
      let count = 0;
      const newRecs = [...records];
      lines.forEach((l) => {
        const c = parseCSVLine(l.trim());
        if (c.length < 11) return;
        const ts = Number(c[8]);
        const recordType = c[2] as RecordType;
        if (recordType !== ('diaper' as any) && !isNaN(ts) && !newRecs.some((rr) => rr.timestamp === ts)) {
          newRecs.push({
            id: c[0] || crypto.randomUUID(),
            time: c[1],
            timestamp: ts,
            type: recordType,
            milkType: c[3] as any,
            amount: c[4] ? Number(c[4]) : undefined,
            weight: c[6] ? Number(c[6]) : undefined,
            height: c[7] ? Number(c[7]) : undefined,
            endTimestamp: c[9] ? Number(c[9]) : undefined,
            note: c[10],
          });
          count++;
        }
      });
      if (count > 0) {
        setAllRecords(newRecs);
        showToast(`成功匯入 ${count} 筆資料 📥`);
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

  if (!babyInfo) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6 text-center font-black text-slate-800">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 space-y-8 border-b-8 border-indigo-100">
          <h2 className="text-4xl text-indigo-600 font-black">育兒助手</h2>
          <div className="space-y-5 text-left font-black">
            <input
              type="text"
              id="tempName"
              className="w-full p-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold"
              placeholder="請輸入名字"
            />
            <input
              type="date"
              id="tempBirthday"
              className="w-full p-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold"
            />
          </div>
          <button
            onClick={() => {
              const name = (document.getElementById('tempName') as HTMLInputElement).value;
              const birthday = (document.getElementById('tempBirthday') as HTMLInputElement).value;
              if (name && birthday) setBabyInfo({ name, birthday, lineEnabled: false });
            }}
            className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black shadow-xl active:scale-95 transition-all text-xl"
          >
            開始使用
          </button>
        </div>
      </div>
    );
  }

  const babyAge = (() => {
    const birth = new Date(babyInfo.birthday);
    const totalDays = Math.floor((Date.now() - birth.getTime()) / 86400000);
    const years = Math.floor(totalDays / 365);
    const weeks = Math.floor((totalDays % 365) / 7);
    const days = (totalDays % 365) % 7;
    return {
      text: `${years > 0 ? years + '歲 ' : ''}${weeks > 0 ? weeks + '週 ' : ''}${days}天`,
      days: totalDays,
    };
  })();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 font-black text-slate-800">
      {toast && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 font-black">
          <div className="bg-slate-900/95 backdrop-blur-md text-white px-8 py-3.5 rounded-full shadow-2xl text-[11px] border border-white/10 uppercase font-black">
            {toast}
          </div>
        </div>
      )}
      <header className="bg-white/90 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-100 shadow-sm font-black">
        <div className="max-w-md mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-5 text-left font-black">
            <div className="w-20 h-20 rounded-[1.75rem] bg-indigo-50 border-4 border-white shadow-xl overflow-hidden flex-shrink-0 flex items-center justify-center relative active:scale-95 transition-transform">
              {babyInfo.avatar ? (
                <img src={babyInfo.avatar} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black">👶</span>
              )}
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2.5">
                {babyInfo.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 font-black">
                <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-[11px] shadow-md font-black">
                  {babyAge.text}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                  第 {babyAge.days} 天
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 font-black">
            <div className="bg-slate-900 text-white w-9 h-9 rounded-2xl flex items-center justify-center text-[11px] uppercase shadow-xl font-black">
              {currentTab.charAt(0)}
            </div>
            <SyncStatus isSyncing={isSyncing} syncError={syncError} />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-8 space-y-7 font-black">
        {currentTab === 'home' && (
          <>
            {nextFeed && (
              <div
                className={`p-6 rounded-[2.5rem] shadow-xl border-2 flex justify-between items-center transition-all font-black ${
                  nextFeed.skip
                    ? 'bg-slate-50 border-slate-200 text-slate-400'
                    : nextFeed.isOver
                    ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                    : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                }`}
              >
                <div className="text-left font-black">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] uppercase opacity-60 font-black">
                      {nextFeed.skip ? '長睡眠時段' : `下餐預計時刻 (${nextFeed.targetStr})`}
                    </p>
                    {!nextFeed.skip && babyInfo.gasUrl && (
                      <span className="text-[9px] bg-white/50 px-1.5 py-0.5 rounded-md font-black">
                        ☁️ 雲端已掛載
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-black tracking-tighter">
                    {nextFeed.skip ? '🌙 靜音中' : nextFeed.str}
                    <span
                      className={`ml-1 ${
                        Math.floor(now / 1000) % 2 === 0 ? 'opacity-0' : 'opacity-100'
                      }`}
                    >
                      .
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl">{nextFeed.skip ? '😴' : nextFeed.isOver ? '⚠️' : '🍼'}</div>
                  {!nextFeed.skip && nextFeed.isOver && (
                    <button
                      onClick={() => sendLineAction(`🍼 ${nextFeed.targetStr} 喝奶時間到了喔！`)}
                      className="bg-white/40 p-2 rounded-full active:scale-90 shadow-sm font-black"
                    >
                      🔔
                    </button>
                  )}
                </div>
              </div>
            )}

            <SummaryCards
              searchDate={searchDate}
              setSearchDate={setSearchDate}
              isTodaySearch={isTodaySearch}
              stats={stats}
            />

            {(isTodaySearch || isEditing) && (
              <RecordForm
                isEditing={isEditing}
                records={records}
                onSave={handleSaveRecord}
                onCancel={() => setIsEditing(null)}
                sleepStartTime={sleepStartTime}
                onStartSleep={handleStartSleep}
                onWakeUp={handleWakeUp}
                now={now}
              />
            )}

            <RecordList
              records={records}
              searchDate={searchDate}
              filter={filter}
              setFilter={setFilter}
              onEdit={(r) => {
                setIsEditing(r.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDelete={handleDeleteRecord}
            />
          </>
        )}

        {currentTab === 'stats' && (
          <div className="space-y-7 pb-16 font-black animate-in fade-in duration-700 font-black text-slate-800">
            <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 font-black font-black">
              <h2 className="text-[11px] text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-2 text-left font-black">
                <div className="w-2 h-5 bg-indigo-500 rounded-full" /> 每日奶量 (ml)
              </h2>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={milkChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }}
                    />
                    <Tooltip cursor={{ fill: '#F8FAFC', radius: 12 }} />
                    <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 8, 8]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 font-black">
              <h2 className="text-[11px] text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-2 text-left font-black">
                <div className="w-2 h-5 bg-purple-500 rounded-full" /> 每日睡眠 (hrs)
              </h2>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sleepChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }}
                    />
                    <Tooltip cursor={{ fill: '#F8FAFC', radius: 12 }} />
                    <Bar dataKey="hours" fill="#a855f7" radius={[8, 8, 8, 8]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 text-left font-black">
              <h2 className="text-[11px] text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-2 font-black">
                <div className="w-2 h-5 bg-emerald-500 rounded-full font-black" /> 成長曲線紀錄
              </h2>
              {growthChartData.length > 0 ? (
                <div className="h-60 font-black">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#10b981"
                        tick={{ fontSize: 10, fontWeight: 900 }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#3b82f6"
                        tick={{ fontSize: 10, fontWeight: 900 }}
                      />
                      <Tooltip />
                      <Legend
                        wrapperStyle={{ fontSize: '10px', fontWeight: 900, paddingTop: '25px' }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="weight"
                        stroke="#10b981"
                        strokeWidth={5}
                        dot={{ r: 5, fill: '#fff', strokeWidth: 4 }}
                        name="體重(kg)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="height"
                        stroke="#3b82f6"
                        strokeWidth={5}
                        dot={{ r: 5, fill: '#fff', strokeWidth: 4 }}
                        name="身高(cm)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-xs text-slate-300 py-12 uppercase font-black">
                  目前尚無數據
                </p>
              )}
            </div>
          </div>
        )}

        {currentTab === 'settings' && (
          <SettingsPanel
            babyInfo={babyInfo}
            setBabyInfo={setBabyInfo}
            records={records}
            setRecords={setAllRecords}
            accessToken={accessToken}
            isSyncing={isSyncing}
            onFullSync={() => fullSync(records, setAllRecords)}
            handleGoogleLogin={handleGoogleLogin}
            handleExportCSV={handleExportCSVLocal}
            handleImportCSV={handleImportCSVLocal}
            onImageUpload={handleImageUpload}
            onSendLineTest={() => sendLineAction('🔔 LINE 測試成功！')}
            onCallGasTest={() => callGasApi(Date.now(), true)}
          />
        )}

        {currentTab === 'manual' && (
          <div className="space-y-7 pb-16 animate-in fade-in duration-500 font-black text-left">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
              <h2 className="text-2xl font-black text-indigo-600 flex items-center gap-2">
                <span className="text-3xl">📖</span> 操作手冊
              </h2>

              <section className="space-y-3">
                <h3 className="text-sm font-black bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl inline-block">
                  🍼 餵奶與 Line 通知
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  新增餵奶紀錄後，系統會自動在 <b>4 小時後</b> 發送 Line 通知。
                  <br />• <b>智慧覆蓋：</b> 僅最新的紀錄會觸發通知。
                  <br />• <b>深夜靜音：</b> 23:00~01:00 紀錄不通知，並取消上一筆排程。
                  <br />• <b>刪除即取消：</b> 刪除最近一筆餵奶，雲端通知會同步撤銷。
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-black bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl inline-block">
                  ☁️ 雙向同步與多人協作 (v9.1)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  系統透過您的專屬 GAS 實現<b>多設備永久聯動</b>。
                  <br />• <b>長效授權：</b> 僅需在設定中執行一次「永久授權」，之後再也不會彈出 Google 登入視窗。
                  <br />• <b>全自動同步：</b> 當您回到 App 或網路恢復時，系統會自動透過 GAS 代理執行靜默同步。
                  <br />• <b>安全代理：</b> 所有資料交換皆由您的私有 GAS 處理，徹底解決瀏覽器第三方 Cookie 限制問題。
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-black bg-purple-50 text-purple-600 px-4 py-2 rounded-xl inline-block">
                  📶 離線支援 (PWA)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  本應用支援<b>完全斷網紀錄</b>。
                  <br />• <b>秒開體驗：</b> 加入主畫面後，即便在飛航模式也能秒開 App。
                  <br />• <b>離線紀錄：</b> 斷網時的紀錄會暫存在手機，連線後自動併入雲端。
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-black bg-amber-50 text-amber-600 px-4 py-2 rounded-xl inline-block">
                  ⚙️ 故障排除
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  若資料未同步或提醒失敗，請嘗試：
                  <br />
                  1. 點擊設定頁的 <b>「立即雙向同步」</b> 按鈕。
                  <br />
                  2. 確保 Google 雲端授權未過期（頭像下方顯示已連結）。
                  <br />
                  3. 檢查設定中的 <b>GAS URL</b> 與 <b>Line Token</b> 是否正確配置。
                </p>
              </section>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-100 px-8 pb-10 pt-4 z-50 shadow-lg font-black text-slate-800">
        <div className="max-w-md mx-auto flex justify-around items-center font-black">
          {[
            { id: 'home', icon: '📝', label: '日常' },
            { id: 'stats', icon: '📈', label: '統計' },
            { id: 'manual', icon: '📖', label: '手冊' },
            { id: 'settings', icon: '⚙️', label: '設定' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as TabType)}
              className={`flex flex-col items-center gap-2 transition-all duration-500 font-black ${
                currentTab === tab.id ? 'text-indigo-600' : 'text-slate-300'
              }`}
            >
              <div
                className={`w-16 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 font-black ${
                  currentTab === tab.id ? 'bg-indigo-50 shadow-inner scale-110' : ''
                }`}
              >
                <span
                  className={`text-2xl font-black ${
                    currentTab === tab.id ? '' : 'grayscale opacity-40 scale-90'
                  }`}
                >
                  {tab.icon}
                </span>
              </div>
              <span
                className={`text-[11px] transition-all duration-500 font-black ${
                  currentTab === tab.id ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default App;
