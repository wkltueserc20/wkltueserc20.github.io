import { useState, useEffect, useMemo, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type RecordType = 'feeding' | 'sleep' | 'growth';
type MilkType = 'formula' | 'breast';
type TabType = 'home' | 'stats' | 'settings' | 'manual';

interface Record {
  id: string; type: RecordType; milkType?: MilkType;
  time: string; timestamp: number; endTimestamp?: number;
  amount?: number; status?: string; weight?: number; height?: number; note?: string;
}

interface BabyInfo {
  name: string; birthday: string; avatar?: string;
  lineToken?: string; lineUserId?: string; lineEnabled?: boolean;
  gasUrl?: string; googleClientId?: string; googleFolderId?: string;
}

function App() {
  const [babyInfo, setBabyInfo] = useState<BabyInfo | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [filter, setFilter] = useState<'all' | RecordType>('all');
  const [searchDate, setSearchDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [sleepStartTime, setSleepStartTime] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [lastNotifiedId, setLastNotifiedId] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenExpire, setTokenExpire] = useState<number>(0);

  const recordsRef = useRef<Record[]>([]);
  const infoRef = useRef<BabyInfo | null>(null);
  const notifiedRef = useRef<string>('');

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [type, setType] = useState<RecordType>('feeding');
  const [milkType, setMilkType] = useState<MilkType>('breast');
  const [amount, setAmount] = useState<number>(180);
  const [status, setStatus] = useState<string>('wet');
  const [weight, setWeight] = useState<number>(3.50);
  const [height, setHeight] = useState<number>(50);
  const [note, setNote] = useState<string>('');
  const [recordTime, setRecordTime] = useState<string>('');
  const [recordEndTime, setRecordEndTime] = useState<string>('');
  const [tempName, setTempName] = useState('');
  const [tempBirthday, setTempBirthday] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const formatLocalValue = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  // Auto-fill time logic
  useEffect(() => {
    if (!isEditing && currentTab === 'home') {
      setRecordTime(formatLocalValue(new Date()));
    }
  }, [type, isEditing, currentTab]);

  const isSameDay = (ts: number, target: string) => {
    const d = new Date(ts); const [y, m, day] = target.split('-').map(Number);
    return d.getFullYear() === y && (d.getMonth() + 1) === m && d.getDate() === day;
  };
  const getRecordTargetTs = (r: Record) => (r.type === 'sleep' && r.endTimestamp) ? r.endTimestamp : r.timestamp;

  const formatTimeWithPeriod = (ts: number) => {
    const d = new Date(ts); const h = d.getHours(); const m = d.getMinutes();
    let period = "";
    if (h < 5) period = "凌晨"; else if (h < 11) period = "早上"; else if (h < 13) period = "中午"; else if (h < 18) period = "下午"; else period = "晚上";
    const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    return `${period}${displayH}:${m < 10 ? '0' + m : m}`;
  };

  const sendLineAction = async (message: string, isAuto = false) => {
    const data = isAuto ? infoRef.current : babyInfo;
    if (!data?.lineToken || !data?.lineUserId || !data?.lineEnabled) return;
    try {
      const apiUrl = 'https://api.line.me/v2/bot/message/push';
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data.lineToken}` },
        body: JSON.stringify({ to: data.lineUserId, messages: [{ type: 'text', text: message }] })
      });
      if (response.ok && !isAuto) showToast("測試 LINE 成功 ✅");
    } catch (err) { console.error(err); }
  };

  const callGasApi = async (targetTs: number, isTest = false) => {
    const data = isTest ? babyInfo : infoRef.current;
    if (!data?.gasUrl || !data?.lineToken || !data?.lineUserId) return;
    try {
      await fetch(data.gasUrl, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isTest ? "test" : "schedule", token: data.lineToken, userId: data.lineUserId, targetTime: targetTs, babyName: data.name })
      });
      if (isTest) showToast("GAS 指令已送出，請查收 LINE 🚀");
    } catch (err) { console.error(err); }
  };

  const cancelGasSchedule = async () => {
    const data = infoRef.current;
    if (!data?.gasUrl || !data?.lineUserId) return;
    try {
      await fetch(data.gasUrl, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "cancel", userId: data.lineUserId })
      });
      console.log("☁️ 雲端排程已要求取消");
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { recordsRef.current = records; }, [records]);
  useEffect(() => { infoRef.current = babyInfo; }, [babyInfo]);

  useEffect(() => {
    const savedInfo = localStorage.getItem('baby-info');
    const savedRecords = localStorage.getItem('baby-records');
    const savedSleepStart = localStorage.getItem('baby-sleep-start');
    const savedNotified = localStorage.getItem('baby-last-notified');
    const savedToken = localStorage.getItem('google-access-token');
    const savedTokenExpire = localStorage.getItem('google-token-expire');
    if (savedInfo) { const p = JSON.parse(savedInfo); setBabyInfo(p); infoRef.current = p; }
    if (savedSleepStart) setSleepStartTime(Number(savedSleepStart));
    if (savedNotified) { setLastNotifiedId(savedNotified); notifiedRef.current = savedNotified; }
    if (savedRecords) { const p = JSON.parse(savedRecords).filter((r: any) => r.type !== 'diaper').sort((a: Record, b: Record) => b.timestamp - a.timestamp); setRecords(p); recordsRef.current = p; }
    if (savedToken) setAccessToken(savedToken);
    if (savedTokenExpire) setTokenExpire(Number(savedTokenExpire));
  }, []);

  useEffect(() => {
    if (babyInfo) localStorage.setItem('baby-info', JSON.stringify(babyInfo));
    localStorage.setItem('baby-records', JSON.stringify(records));
    localStorage.setItem('baby-last-notified', lastNotifiedId);
    if (accessToken) localStorage.setItem('google-access-token', accessToken);
    else localStorage.removeItem('google-access-token');
    if (tokenExpire) localStorage.setItem('google-token-expire', tokenExpire.toString());
    else localStorage.removeItem('google-token-expire');
    if (sleepStartTime) localStorage.setItem('baby-sleep-start', sleepStartTime.toString());
    else localStorage.removeItem('baby-sleep-start');
  }, [babyInfo, records, sleepStartTime, lastNotifiedId, accessToken, tokenExpire]);

  const stats = useMemo(() => {
    const dayRecords = records.filter(r => isSameDay(getRecordTargetTs(r), searchDate));
    const milkTotal = dayRecords.reduce((acc, curr) => acc + (curr.type === 'feeding' ? (curr.amount || 0) : 0), 0);
    const sleepMins = dayRecords.reduce((acc, curr) => acc + (curr.type === 'sleep' ? (curr.amount || 0) : 0), 0);
    const latestGrowth = records.find(r => r.type === 'growth');
    return { milkTotal, sleepH: Math.floor(sleepMins / 60), sleepM: sleepMins % 60, latestGrowth };
  }, [records, searchDate]);

  const nextFeed = useMemo(() => {
    const last = records.find(r => r.type === 'feeding');
    if (!last) return null;
    const hr = new Date(last.timestamp).getHours();
    if (hr === 23 || hr === 0) return { skip: true };
    const target = last.timestamp + (4 * 60 * 60 * 1000);
    const diff = target - now;
    if (diff <= -43200000) return null;
    const abs = Math.abs(diff);
    return { str: `${Math.floor(abs/3600000)}h ${Math.floor((abs%3600000)/60000)}m ${Math.floor((abs%60000)/1000)}s`, isOver: diff < 0, targetStr: formatTimeWithPeriod(target), id: last.id };
  }, [records, now]);

  const milkChartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dayTotal = records.filter(r => isSameDay(r.timestamp, d.toLocaleDateString('en-CA')) && r.type === 'feeding').reduce((s, r) => s + (r.amount || 0), 0);
      data.push({ name: d.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }), amount: dayTotal });
    }
    return data;
  }, [records]);

  const sleepChartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const mins = records.filter(r => r.type === 'sleep' && isSameDay(getRecordTargetTs(r), d.toLocaleDateString('en-CA'))).reduce((s, r) => s + (r.amount || 0), 0);
      data.push({ name: d.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }), hours: parseFloat((mins / 60).toFixed(1)) });
    }
    return data;
  }, [records]);

  const growthChartData = useMemo(() => records.filter(r => r.type === 'growth').sort((a, b) => a.timestamp - b.timestamp).map(r => ({ date: new Date(r.timestamp).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }), weight: r.weight, height: r.height })), [records]);

  const handleStartSleep = () => { 
    const st = new Date(recordTime).getTime(); if (isNaN(st)) return;
    setSleepStartTime(st); setNow(Date.now()); showToast("開始紀錄睡眠 😴"); 
  };

  const handleWakeUp = () => {
    if (!sleepStartTime) return;
    const et = Date.now();
    const diff = Math.round((et - sleepStartTime) / 60000);
    const newRec: Record = {
      id: crypto.randomUUID(), type: 'sleep',
      time: new Date(et).toLocaleString('zh-TW'),
      timestamp: sleepStartTime, endTimestamp: et, amount: diff,
      note: `睡覺: ${new Date(sleepStartTime).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})} ~ ${new Date(et).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}`
    };
    const newRecs = [newRec, ...records].sort((a, b) => b.timestamp - a.timestamp);
    setRecords(newRecs);
    setSleepStartTime(null);
    showToast("紀錄成功 ✨");
    syncToDriveDirect(newRecs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
    const ts = new Date(recordTime).getTime();
    let fAm = amount; let fEnd = undefined; let fNt = note; let fTime = new Date(ts).toLocaleString('zh-TW');
    
    if (type === 'sleep' && recordEndTime) {
      const ets = new Date(recordEndTime).getTime(); 
      fEnd = ets; 
      fAm = Math.max(0, Math.round((ets - ts) / 60000)); 
      fTime = new Date(ets).toLocaleString('zh-TW');
      
      // 智慧備份處理 (v8.8)：剝離舊的自動生成前綴，保留用戶手寫備註
      const pureNote = note.replace(/^睡覺: \d{2}:\d{2} ~ \d{2}:\d{2}( - )?/, '');
      const timeRange = `${new Date(ts).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})} ~ ${new Date(ets).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}`;
      fNt = `睡覺: ${timeRange}${pureNote ? ' - ' + pureNote : ''}`;
    }
    const base = { type, note: fNt, time: fTime, timestamp: ts, endTimestamp: fEnd, milkType: type === 'feeding' ? milkType : undefined, amount: (type === 'feeding' || type === 'sleep') ? fAm : undefined, weight: type === 'growth' ? parseFloat(weight.toFixed(2)) : undefined, height: type === 'growth' ? Math.round(height) : undefined };
    
    if (type === 'feeding') { 
      const hr = new Date(ts).getHours();
      if (hr !== 23 && hr !== 0) {
        callGasApi(ts + (4 * 60 * 60 * 1000)); 
        showToast("☁️ 正在同步雲端提醒...");
      } else {
        cancelGasSchedule();
        showToast("🌙 深夜長睡眠，已取消雲端提醒");
      }
    }

    if (isEditing) { 
      const editedRecs = records.map(r => r.id === isEditing ? { ...r, ...base } : r).sort((a, b) => b.timestamp - a.timestamp);
      setRecords(editedRecs); 
      setIsEditing(null); showToast("修改成功 ✅"); 
      syncToDriveDirect(editedRecs);
    } 
    else { 
      const newId = crypto.randomUUID(); const newRecs = [{ id: newId, ...base } as Record, ...records].sort((a, b) => b.timestamp - a.timestamp);
      setRecords(newRecs); showToast("新增成功 ✨"); 
      syncToDriveDirect(newRecs);
    }
    resetForm();
  };

  const handleGoogleLogin = (callbackOrEvent?: any) => {
    const callback = typeof callbackOrEvent === 'function' ? callbackOrEvent : undefined;
    if (!babyInfo?.googleClientId) { showToast("請先在設定中輸入 Google Client ID ⚙️"); return; }
    const client = (window as any).google?.accounts.oauth2.initTokenClient({
      client_id: babyInfo.googleClientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (response: any) => {
        if (response.access_token) {
          setAccessToken(response.access_token);
          setTokenExpire(Date.now() + response.expires_in * 1000);
          showToast("Google 雲端連結已續約 ☁️");
          if (callback) callback(response.access_token);
          else syncToDriveDirect(records, response.access_token);
        }
      },
    });
    client.requestAccessToken({ prompt: '' });
  };

  const syncToDriveDirect = async (data: Record[], overrideToken?: string) => {
    const token = overrideToken || accessToken;
    
    // 如果沒有 Token 或已過期，自動發起續約
    if (!token || Date.now() > tokenExpire) {
      if (overrideToken) return; // 避免無窮迴圈
      console.log("☁️ 授權過期，嘗試自動續約...");
      handleGoogleLogin((newToken: string) => syncToDriveDirect(data, newToken));
      return;
    }

    // 產生每日一檔的檔名 (v8.9)
    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const fileName = `baby_records_${dateStr}.csv`;

    let csv = "\uFEFFID,時間,類別,奶種,數值,狀態,體重,身高,開始時間戳,結束時間戳,備註\n";
    data.forEach(r => { csv += `"${r.id}","${r.time}","${r.type}","${r.milkType||''}","${r.amount||''}","${r.status||''}","${r.weight||''}","${r.height||''}","${r.timestamp}","${r.endTimestamp||''}","${r.note||''}"\n`; });

    try {
      // 1. Search for existing file within the specified folder for TODAY
      const folderQuery = babyInfo?.googleFolderId ? ` and '${babyInfo.googleFolderId}' in parents` : '';
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false${folderQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const searchData = await searchRes.json();
      const existingFile = searchData.files?.[0];

      // 2. Prepare metadata and form data
      const metadata: any = { name: fileName, mimeType: 'text/csv' };
      if (babyInfo?.googleFolderId && !existingFile) {
        metadata.parents = [babyInfo.googleFolderId];
      }

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([csv], { type: 'text/csv' }));

      if (existingFile) {
        // 3. Update existing file
        await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`, {
          method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: form
        });
      } else {
        // 4. Create new file
        await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form
        });
      }
      console.log("☁️ Google Drive 同步完成");
    } catch (err) { console.error("Drive Sync Error:", err); }
  };

  const resetForm = () => { setAmount(180); setNote(''); setIsEditing(null); setRecordTime(formatLocalValue(new Date())); setWeight(3.50); setHeight(50); setMilkType('breast'); setType('feeding'); };
  const startEdit = (r: Record) => {
    setIsEditing(r.id); setType(r.type); if (r.milkType) setMilkType(r.milkType); if (r.amount) setAmount(r.amount); if (r.weight) setWeight(r.weight); if (r.height) setHeight(r.height); if (r.note) setNote(r.note);
    setRecordTime(formatLocalValue(new Date(r.timestamp))); if (r.type === 'sleep' && r.endTimestamp) setRecordEndTime(formatLocalValue(new Date(r.endTimestamp))); else setRecordEndTime('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const deleteRec = (id: string) => { 
    if (window.confirm('確定要刪除這筆紀錄嗎？')) { 
      const target = records.find(r => r.id === id);
      const newRecs = records.filter(r => r.id !== id);
      setRecords(newRecs); 
      showToast("已刪除 🗑️"); 
      syncToDriveDirect(newRecs);
      if (target?.type === 'feeding') cancelGasSchedule();
    } 
  };

  const handleExportCSV = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '');
    const timeStr = now.toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(/:/g, '');
    const fileName = `baby_records_${dateStr}_${timeStr}.csv`;
    
    let csv = "\uFEFFID,時間,類別,奶種,數值,狀態,體重,身高,開始時間戳,結束時間戳,備註\n";
    records.forEach(r => { csv += `"${r.id}","${r.time}","${r.type}","${r.milkType||''}","${r.amount||''}","${r.status||''}","${r.weight||''}","${r.height||''}","${r.timestamp}","${r.endTimestamp||''}","${r.note||''}"\n`; });
    
    const link = document.createElement("a"); 
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;' })); 
    link.download = fileName; 
    link.click();
    showToast(`已匯出 ${fileName} 📥`);
  };

  const parseCSVLine = (t: string) => {
    const res = []; let c = ''; let q = false;
    for (let i = 0; i < t.length; i++) { if (t[i] === '"') q = !q; else if (t[i] === ',' && !q) { res.push(c); c = ''; } else c += t[i]; }
    res.push(c); return res;
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = (ev) => {
      const text = ev.target?.result as string; const lines = text.split('\n').filter(l => l.trim() !== '').slice(1);
      let count = 0; const newRecs = [...records];
      lines.forEach(l => {
        const c = parseCSVLine(l.trim()); if (c.length < 11) return; const ts = Number(c[8]);
        const recordType = c[2] as RecordType;
        if (recordType !== 'diaper' as any && !isNaN(ts) && !newRecs.some(rr => rr.timestamp === ts)) {
          newRecs.push({ id: c[0] || crypto.randomUUID(), time: c[1], timestamp: ts, type: recordType, milkType: c[3] as MilkType, amount: c[4]?Number(c[4]):undefined, status: c[5], weight: c[6]?Number(c[6]):undefined, height: c[7]?Number(c[7]):undefined, endTimestamp: c[9]?Number(c[9]):undefined, note: c[10] });
          count++;
        }
      });
      if (count > 0) { setRecords(newRecs.sort((a, b) => b.timestamp - a.timestamp)); showToast(`成功匯入 ${count} 筆資料 📥`); }
    };
    rd.readAsText(f); e.target.value = '';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas'); const MAX = 300; let w = img.width; let h = img.height;
        if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } } else { if (h > MAX) { w *= MAX / h; h = MAX; } }
        canvas.width = w; canvas.height = h; const ctx = canvas.getContext('2d'); ctx?.drawImage(img, 0, 0, w, h);
        if (babyInfo) setBabyInfo({ ...babyInfo, avatar: canvas.toDataURL('image/jpeg', 0.7) });
        showToast("頭像更換成功 📸");
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
            <div><label className="text-[11px] text-slate-400 ml-3 uppercase font-black">寶寶名字</label><input type="text" value={tempName} onChange={e => setTempName(e.target.value)} className="w-full p-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" placeholder="請輸入名字" /></div>
            <div><label className="text-[11px] text-slate-400 ml-3 uppercase font-black">出生日期</label><input type="date" value={tempBirthday} onChange={e => setTempBirthday(e.target.value)} className="w-full p-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" /></div>
          </div>
          <button onClick={() => { if(tempName&&tempBirthday) setBabyInfo({name:tempName, birthday:tempBirthday, lineEnabled: false}) }} className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black shadow-xl active:scale-95 transition-all text-xl">開始使用</button>
        </div>
      </div>
    );
  }

  const babyAge = (() => {
    const birth = new Date(babyInfo.birthday); const totalDays = Math.floor((Date.now() - birth.getTime()) / 86400000);
    const years = Math.floor(totalDays / 365); const weeks = Math.floor((totalDays % 365) / 7); const days = (totalDays % 365) % 7;
    return { text: `${years > 0 ? years + '歲 ' : ''}${weeks > 0 ? weeks + '週 ' : ''}${days}天`, days: totalDays };
  })();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 font-black text-slate-800">
      {toast && <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 font-black"><div className="bg-slate-900/95 backdrop-blur-md text-white px-8 py-3.5 rounded-full shadow-2xl text-[11px] border border-white/10 uppercase font-black">{toast}</div></div>}
      <header className="bg-white/90 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-100 shadow-sm font-black">
        <div className="max-w-md mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-5 text-left font-black">
            <div className="w-20 h-20 rounded-[1.75rem] bg-indigo-50 border-4 border-white shadow-xl overflow-hidden flex-shrink-0 flex items-center justify-center relative active:scale-95 transition-transform" onClick={() => fileInputRef.current?.click()}>
              {babyInfo.avatar ? <img src={babyInfo.avatar} className="w-full h-full object-cover" /> : <span className="text-4xl font-black">👶</span>}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2.5 font-black">{babyInfo.name}</h1>
              <div className="flex flex-wrap items-center gap-2 font-black">
                <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-[11px] shadow-md font-black">{babyAge.text}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">第 {babyAge.days} 天</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 text-white w-9 h-9 rounded-2xl flex items-center justify-center text-[11px] uppercase shadow-xl font-black">{currentTab.charAt(0)}</div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-8 space-y-7 font-black">
        {currentTab === 'home' && (
          <>
            {nextFeed && (
              <div className={`p-6 rounded-[2.5rem] shadow-xl border-2 flex justify-between items-center transition-all font-black ${nextFeed.skip ? 'bg-slate-50 border-slate-200 text-slate-400' : (nextFeed.isOver ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-indigo-50 border-indigo-100 text-indigo-600')}`}>
                <div className="text-left font-black">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] uppercase opacity-60 font-black font-black">{nextFeed.skip ? '長睡眠時段' : `下餐預計時刻 (${nextFeed.targetStr})`}</p>
                    {!nextFeed.skip && babyInfo.gasUrl && <span className="text-[9px] bg-white/50 px-1.5 py-0.5 rounded-md font-black">☁️ 雲端已掛載</span>}
                  </div>
                  <p className="text-3xl font-black tracking-tighter">{nextFeed.skip ? '🌙 靜音中' : nextFeed.str}<span className={`ml-1 ${Math.floor(now/1000) % 2 === 0 ? 'opacity-0' : 'opacity-100'}`}>.</span></p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl">{nextFeed.skip ? '😴' : (nextFeed.isOver ? '⚠️' : '🍼')}</div>
                  {!nextFeed.skip && nextFeed.isOver && <button onClick={() => sendLineAction(`🍼 ${nextFeed.targetStr} 喝奶時間到了喔！`)} className="bg-white/40 p-2 rounded-full active:scale-90 shadow-sm font-black">🔔</button>}
                </div>
              </div>
            )}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex items-center justify-between font-black">
              <div className="flex flex-col text-left"><span className="text-[9px] text-slate-400 uppercase tracking-widest mb-1 ml-1 font-black">選擇日期</span><input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} className="text-indigo-600 bg-transparent outline-none text-base" /></div>
              {!isTodaySearch && <button onClick={() => setSearchDate(new Date().toLocaleDateString('en-CA'))} className="px-5 py-2.5 bg-indigo-600 text-white rounded-[1.25rem] text-[10px] shadow-lg active:scale-95 transition-all font-black">回今天</button>}
            </div>
            <div className="grid grid-cols-2 gap-4 font-black">
              <div className="col-span-2 bg-white p-7 rounded-[2.5rem] shadow-sm border-b-4 border-indigo-500/30 text-center flex justify-between items-center px-10">
                <p className="text-[12px] text-slate-400 uppercase tracking-widest">今日總奶量</p>
                <p className="text-4xl text-indigo-600 tracking-tighter font-black">{stats.milkTotal}<span className="text-sm ml-1 opacity-40">ml</span></p>
              </div>
              <div className="bg-white p-6 rounded-[2.25rem] shadow-sm border-b-4 border-purple-500/30 text-center">
                <p className="text-[10px] text-slate-400 uppercase mb-1">睡眠時數</p>
                <p className="text-2xl text-purple-600 tracking-tighter font-black">{stats.sleepH}h{stats.sleepM}m</p>
              </div>
              <div className="bg-white p-6 rounded-[2.25rem] shadow-sm border-b-4 border-emerald-500/30 text-center">
                <p className="text-[10px] text-slate-400 uppercase mb-1">最新成長</p>
                <p className="text-[15px] text-emerald-600 tracking-tighter font-black">
                  {stats.latestGrowth ? `${stats.latestGrowth.weight}kg / ${stats.latestGrowth.height}cm` : '尚無數據'}
                </p>
              </div>
            </div>
            {isTodaySearch && sleepStartTime && (
              <div className="bg-indigo-600 text-white p-7 rounded-[2.5rem] shadow-2xl animate-pulse flex justify-between items-center border-2 border-indigo-400/30 font-black">
                <div className="space-y-1.5 text-left"><p className="text-[11px] opacity-60 uppercase font-black font-black font-black">正在錄睡眠中 💤</p><p className="text-4xl font-black font-black">{Math.max(0, Math.floor((now - sleepStartTime)/60000))}<span className="text-sm ml-1.5 opacity-50 font-black">分</span></p></div>
                <button onClick={handleWakeUp} className="bg-white text-indigo-600 px-9 py-5 rounded-[1.75rem] font-black text-sm uppercase active:scale-95 transition-all shadow-xl font-black">起來了 ☀️</button>
              </div>
            )}
            {(isTodaySearch || isEditing) && (
              <div className="bg-white rounded-[3rem] shadow-2xl p-7 border border-slate-100 space-y-7 animate-in slide-in-from-bottom-6 duration-500 font-black">
                <div className="flex bg-slate-50 p-2 rounded-[1.5rem] font-black">
                  {(['feeding', 'sleep', 'growth'] as RecordType[]).map(t => (
                    <button key={t} type="button" onClick={() => setType(t)} className={`flex-1 py-4 rounded-[1.25rem] text-[11px] transition-all font-black font-black font-black ${type === t ? 'bg-white shadow-md text-indigo-600 font-black' : 'text-slate-400'}`}>{t === 'feeding' ? '餵奶🍼' : t === 'sleep' ? '睡眠💤' : '成長🌱'}</button>
                  ))}
                </div>
                <div className="space-y-5 font-black">
                  <div className="flex justify-between items-center px-1 font-black font-black"><label className="text-[10px] text-slate-400 uppercase tracking-widest font-black font-black font-black">紀錄時間</label><button onClick={() => setRecordTime(formatLocalValue(new Date()))} className="text-[9px] text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl active:scale-90 font-black">填入現在</button></div>
                  <input type="datetime-local" value={recordTime} onChange={e => setRecordTime(e.target.value)} className="w-full p-5 bg-slate-50 rounded-[1.5rem] outline-none text-sm font-black border border-slate-100 font-black" />
                  {type === 'sleep' && isEditing && (
                    <div className="space-y-1.5 animate-in fade-in font-black text-left font-black"><label className="text-[10px] text-slate-400 uppercase tracking-widest px-1 font-black font-black">起床時刻</label><input type="datetime-local" value={recordEndTime} onChange={e => setRecordEndTime(e.target.value)} className="w-full p-5 bg-slate-50 rounded-[1.5rem] outline-none text-sm font-black border border-slate-100" /></div>
                  )}
                  {type === 'feeding' && (
                    <div className="space-y-5 animate-in fade-in font-black font-black">
                      <div className="flex gap-3 font-black">{(['formula', 'breast'] as MilkType[]).map(m => (<button key={m} type="button" onClick={() => setMilkType(m)} className={`flex-1 py-4 rounded-[1.25rem] text-[11px] border-2 transition-all font-black font-black font-black ${milkType === m ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-50 text-slate-400'}`}>{m === 'formula' ? '配方奶' : '母奶'}</button>))}</div>
                      <div className="flex items-center justify-between bg-slate-50 p-5 rounded-[2rem] border border-slate-100 font-black font-black font-black font-black font-black font-black"><button onClick={() => setAmount(Math.max(0, amount-5))} className="w-14 h-14 bg-white rounded-[1.25rem] shadow-lg text-2xl text-indigo-600 active:scale-90">-</button><div className="text-center font-black font-black font-black font-black font-black"><span className="text-5xl text-slate-900 tracking-tighter">{amount}</span><span className="text-xs ml-2 text-slate-400 uppercase font-black font-black font-black">ML</span></div><button onClick={() => setAmount(amount+5)} className="w-14 h-14 bg-white rounded-[1.25rem] shadow-lg text-2xl text-indigo-600 active:scale-90">+</button></div>
                    </div>
                  )}

                  {type === 'sleep' && !isEditing && (<div className="text-center py-3 animate-in fade-in font-black font-black font-black font-black font-black">{!sleepStartTime ? <button onClick={handleStartSleep} className="w-full bg-slate-900 text-white py-7 rounded-[2.5rem] font-black text-xl shadow-2xl active:scale-95 transition-all font-black font-black">開始睡覺 😴</button> : <div className="p-5 bg-slate-50 rounded-[1.5rem] text-[11px] text-slate-400 uppercase font-black font-black font-black font-black">正在紀錄睡眠中...</div>}</div>)}
                  {type === 'growth' && (<div className="grid grid-cols-2 gap-4 animate-in fade-in text-left font-black font-black font-black"><div className="relative font-black font-black font-black font-black font-black"><input type="number" step="0.01" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full p-5 pr-14 bg-slate-50 rounded-[1.5rem] outline-none font-black font-black" /><span className="absolute right-5 top-5 text-[10px] text-slate-300 uppercase">KG</span></div><div className="relative font-black font-black font-black font-black font-black font-black"><input type="number" step="1" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full p-5 pr-14 bg-slate-50 rounded-[1.5rem] outline-none font-black" /><span className="absolute right-5 top-5 text-[10px] text-slate-300 uppercase font-black font-black">CM</span></div></div>)}
                  <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="備註內容..." className="w-full p-5 bg-slate-50 rounded-[1.5rem] outline-none text-sm font-black border border-transparent" />
                </div>
                {(type !== 'sleep' || isEditing) && (<div className="flex gap-4 pt-3 font-black"><button onClick={handleSubmit} className="flex-[2] bg-indigo-600 text-white py-6 rounded-[2rem] font-black shadow-2xl active:scale-95 transition-transform text-base uppercase font-black font-black font-black font-black">{isEditing ? '儲存修改' : '新增紀錄'}</button>{isEditing && <button onClick={resetForm} className="flex-1 bg-slate-100 text-slate-500 py-6 rounded-[2rem] font-black text-[11px]">取消</button>}</div>)}
              </div>
            )}
            <div className="space-y-5 font-black">
              <div className="flex justify-between items-center px-3 font-black text-left font-black font-black font-black font-black"><h3 className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black">紀錄清單</h3><select value={filter} onChange={e => setFilter(e.target.value as any)} className="bg-transparent text-[11px] text-indigo-600 outline-none border-b-2 border-indigo-500/20 pb-1 font-black font-black font-black font-black font-black"><option value="all">全部紀錄</option><option value="feeding">餵奶</option><option value="sleep">睡眠</option><option value="growth">成長</option></select></div>
              <div className="space-y-4 font-black text-left text-slate-800">
                {records.filter(r => isSameDay(getRecordTargetTs(r), searchDate) && (filter === 'all' || r.type === filter)).map(record => (
                  <div key={record.id} className="bg-white p-6 rounded-[2.25rem] shadow-sm flex justify-between items-center border border-slate-50 active:scale-[0.98] transition-all font-black font-black font-black font-black font-black font-black font-black">
                    <div className="flex gap-5 items-center font-black">
                      <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-2xl font-black font-black font-black ${record.type === 'feeding' ? 'bg-indigo-50 text-indigo-500' : record.type === 'sleep' ? 'bg-purple-50 text-purple-500' : 'bg-emerald-50 text-emerald-600'}`}>{record.type === 'feeding' ? (record.milkType === 'formula' ? '🍼' : '🤱') : record.type === 'sleep' ? '💤' : '🌱'}</div>
                      <div className="font-black">
                        <div className="text-[15px] text-slate-900 leading-tight mb-1 font-black font-black font-black font-black font-black font-black font-black">{record.type === 'feeding' ? `${record.amount}ml ${record.milkType==='formula'?'配方':'母奶'}` : record.type === 'sleep' ? `${Math.floor((record.amount||0)/60)}時 ${(record.amount||0)%60}分` : `${record.weight}kg / ${record.height}cm`}</div>
                        <div className="text-[11px] text-slate-400 font-black uppercase font-black font-black font-black font-black font-black font-black font-black font-black">{record.time.split(' ')[1]}</div>
                        {record.note && <div className="text-[11px] text-slate-400 mt-2 italic border-l-4 border-slate-50 pl-3 font-normal leading-relaxed font-black font-black font-black font-black font-black">{record.note}</div>}
                      </div>
                    </div>
                    <div className="flex gap-1.5 font-black font-black"><button onClick={() => startEdit(record)} className="p-3 text-indigo-200 hover:text-indigo-600 transition-colors font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black"><svg className="w-5 h-5 font-black font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button><button onClick={() => deleteRec(record.id)} className="p-3 text-rose-100 hover:text-rose-500 transition-colors font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black"><svg className="w-5 h-5 font-black font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button></div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {currentTab === 'stats' && (
          <div className="space-y-7 pb-16 font-black animate-in fade-in duration-700 font-black text-slate-800">
            <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 font-black font-black"><h2 className="text-[11px] text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-2 text-left font-black font-black font-black font-black font-black font-black font-black"><div className="w-2 h-5 bg-indigo-500 rounded-full" /> 每日奶量 (ml)</h2><div className="h-60"><ResponsiveContainer width="100%" height="100%"><BarChart data={milkChartData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:10, fill:'#94a3b8', fontWeight:900}} /><YAxis axisLine={false} tickLine={false} tick={{fontSize:10, fill:'#94a3b8', fontWeight:900}} /><Tooltip cursor={{fill:'#F8FAFC', radius:12}} /><Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 8, 8]} barSize={28} /></BarChart></ResponsiveContainer></div></div>
            <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 font-black font-black font-black font-black"><h2 className="text-[11px] text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-2 text-left font-black font-black font-black font-black font-black font-black font-black font-black"><div className="w-2 h-5 bg-purple-500 rounded-full" /> 每日睡眠 (hrs)</h2><div className="h-60 font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black"><ResponsiveContainer width="100%" height="100%"><BarChart data={sleepChartData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:10, fill:'#94a3b8', fontWeight:900}} /><YAxis axisLine={false} tickLine={false} tick={{fontSize:10, fill:'#94a3b8', fontWeight:900}} /><Tooltip cursor={{fill:'#F8FAFC', radius:12}} /><Bar dataKey="hours" fill="#a855f7" radius={[8, 8, 8, 8]} barSize={28} /></BarChart></ResponsiveContainer></div></div>
            <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 text-left font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black"><h2 className="text-[11px] text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-2 font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black"><div className="w-2 h-5 bg-emerald-500 rounded-full font-black" /> 成長曲線紀錄</h2>{growthChartData.length > 0 ? (<div className="h-60 font-black font-black font-black font-black font-black font-black font-black font-black"><ResponsiveContainer width="100%" height="100%"><LineChart data={growthChartData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize:10, fill:'#94a3b8', fontWeight:900}} /><YAxis yAxisId="left" stroke="#10b981" tick={{fontSize:10, fontWeight:900}} /><YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{fontSize:10, fontWeight:900}} /><Tooltip /><Legend wrapperStyle={{fontSize:'10px', fontWeight:900, paddingTop:'25px'}} /><Line yAxisId="left" type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={5} dot={{r:5, fill:'#fff', strokeWidth:4}} name="體重(kg)" /><Line yAxisId="right" type="monotone" dataKey="height" stroke="#3b82f6" strokeWidth={5} dot={{r:5, fill:'#fff', strokeWidth:4}} name="身高(cm)" /></LineChart></ResponsiveContainer></div>) : <p className="text-center text-xs text-slate-300 py-12 uppercase font-black font-black font-black font-black font-black">目前尚無數據</p>}</div>
          </div>
        )}
        {currentTab === 'settings' && (
          <div className="space-y-7 animate-in fade-in duration-500 font-black">
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 text-center font-black">
              <div className="relative inline-block mb-6 font-black font-black font-black font-black font-black font-black font-black font-black font-black">
                <div className="w-28 h-28 rounded-[2.25rem] bg-indigo-50 border-4 border-white shadow-2xl overflow-hidden mx-auto transition-transform active:scale-95 font-black">
                   {babyInfo.avatar ? <img src={babyInfo.avatar} className="w-full h-full object-cover font-black" /> : <div className="text-5xl mt-6 font-black font-black font-black">👶</div>}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-3 -right-3 bg-indigo-600 text-white p-3 rounded-2xl shadow-2xl border-4 border-white active:scale-90 transition-all font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black"><svg className="w-5 h-5 font-black font-black" fill="currentColor" viewBox="0 0 20 20"><path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" /></svg></button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden font-black" />
              </div>
              <h2 className="text-3xl text-slate-900 tracking-tighter mb-1 font-black font-black font-black font-black font-black font-black font-black font-black">{babyInfo.name}</h2>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black">寶寶個人設定</p>
            </div>
            <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100 space-y-4 font-black">
              <h3 className="text-[10px] text-slate-400 uppercase tracking-widest px-1 font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black">LINE 雲端排程設定 (GAS)</h3>
              <div className="flex items-center justify-between p-2 font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black">
                <span className="text-sm font-black font-black font-black font-black font-black font-black font-black font-black font-black">啟用自動通知功能</span>
                <button onClick={() => setBabyInfo({...babyInfo, lineEnabled: !babyInfo.lineEnabled})} className={`w-12 h-6 rounded-full transition-colors relative font-black ${babyInfo.lineEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all font-black ${babyInfo.lineEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <input type="password" value={babyInfo.lineToken || ''} onChange={e => setBabyInfo({...babyInfo, lineToken: e.target.value})} placeholder="LINE Token" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-xs border border-slate-100 font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black" />
              <input type="text" value={babyInfo.lineUserId || ''} onChange={e => setBabyInfo({...babyInfo, lineUserId: e.target.value})} placeholder="LINE User ID" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-xs border border-slate-100 font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black" />
              <input type="text" value={babyInfo.gasUrl || ''} onChange={e => setBabyInfo({...babyInfo, gasUrl: e.target.value})} placeholder="GAS URL" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-xs border border-slate-100 font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black" />
              <div className="grid grid-cols-2 gap-3 font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black">
                <button onClick={() => sendLineAction("🔔 LINE 測試成功！")} className="py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase active:scale-95 transition-all font-black font-black font-black font-black font-black font-black">測試 LINE</button>
                <button onClick={() => callGasApi(Date.now(), true)} className="py-3 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase active:scale-95 transition-all font-black font-black font-black font-black font-black font-black">測試 GAS</button>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100 space-y-4 font-black">
              <h3 className="text-[10px] text-slate-400 uppercase tracking-widest px-1 font-black">Google Drive 自動備份設定</h3>
              <input type="text" value={babyInfo.googleClientId || ''} onChange={e => setBabyInfo({...babyInfo, googleClientId: e.target.value})} placeholder="Google OAuth Client ID" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-xs border border-slate-100 font-black" />
              <input type="text" value={babyInfo.googleFolderId || ''} onChange={e => setBabyInfo({...babyInfo, googleFolderId: e.target.value})} placeholder="Google Drive 資料夾 ID (選填)" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-xs border border-slate-100 font-black" />
              <button onClick={handleGoogleLogin} className={`w-full py-4 rounded-2xl font-black text-xs uppercase transition-all ${accessToken ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-600 text-white shadow-lg active:scale-95'}`}>
                {accessToken ? '✅ 已連結 Google 雲端' : '🔗 連結 Google 雲端帳戶'}
              </button>
              {accessToken && (
                <div className="text-[9px] text-slate-400 text-center uppercase tracking-widest animate-pulse">
                  自動同步已啟動，每次儲存將自動更新雲端 CSV
                </div>
              )}
            </div>

            <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100 space-y-4 font-black">
              <button onClick={handleExportCSV} className="w-full flex items-center justify-between p-6 bg-slate-50 rounded-[1.75rem] border border-slate-100 active:scale-[0.98] transition-all font-black">
                <span>📥 匯出資料 (CSV)</span>
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm text-xs text-indigo-600 font-black">{records.length}</div>
              </button>
              <button onClick={() => csvInputRef.current?.click()} className="w-full p-6 bg-slate-50 rounded-[1.75rem] border border-slate-100 font-black text-[11px] active:scale-[0.98] font-black uppercase tracking-wider text-left transition-all font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black">📤 匯入歷史資料</button>
              <input type="file" ref={csvInputRef} onChange={handleImportCSV} accept=".csv" className="hidden font-black font-black font-black font-black" />
              <button onClick={() => { if(confirm('⚠️ 警告：確定要清空所有紀錄嗎？')) setRecords([]); }} className="w-full p-6 bg-rose-50 rounded-[1.75rem] border border-rose-100 text-rose-600 active:scale-[0.98] font-black uppercase text-left transition-all font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black">🗑️ 清除所有數據</button>
            </div>
            <div className="text-center font-black">
              <button onClick={() => { if(confirm('確定要重設寶寶資訊嗎？')) { localStorage.clear(); location.reload(); } }} className="w-full p-6 bg-slate-200 text-slate-500 rounded-[1.75rem] font-black text-[11px] uppercase active:scale-95 transition-all font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black">重新設定寶寶</button>
              <p className="mt-6 text-[9px] text-slate-300 tracking-[0.3em] font-black uppercase font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black">v8.9 (20260302)</p>
            </div>
          </div>
        )}
        {currentTab === 'manual' && (
          <div className="space-y-7 pb-16 animate-in fade-in duration-500 font-black text-left">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
              <h2 className="text-2xl font-black text-indigo-600 flex items-center gap-2"><span className="text-3xl">📖</span> 操作手冊</h2>
              
              <section className="space-y-3">
                <h3 className="text-sm font-black bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl inline-block">🍼 餵奶與 Line 通知</h3>
                <p className="text-xs text-slate-600 leading-relaxed">新增餵奶紀錄後，系統會自動在 <b>4 小時後</b> 發送 Line 通知。
                <br/>• <b>智慧覆蓋：</b> 僅最新的紀錄會觸發通知。
                <br/>• <b>深夜靜音：</b> 23:00~01:00 紀錄不通知，並取消上一筆排程。
                <br/>• <b>刪除即取消：</b> 刪除最近一筆餵奶，雲端通知會同步撤銷。</p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-black bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl inline-block">☁️ Google Drive 自動備份</h3>
                <p className="text-xs text-slate-600 leading-relaxed">每次<b>新增、修改或刪除</b>任何紀錄，系統都會自動同步至您的 Google 雲端硬碟。
                <br/>• <b>無感續約：</b> 授權過期時，儲存後點選帳戶頭像即可快速續約。
                <br/>• <b>定向儲存：</b> 可在設定中指定資料夾 ID，保持檔案整齊。</p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-black bg-purple-50 text-purple-600 px-4 py-2 rounded-xl inline-block">💤 睡眠紀錄技巧</h3>
                <p className="text-xs text-slate-600 leading-relaxed">點擊「開始睡覺」啟動計時，醒來時點擊「起來了 ☀️」即可自動完成紀錄。系統會以<b>起床時刻</b>來歸屬該筆紀錄的日期。</p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-black bg-amber-50 text-amber-600 px-4 py-2 rounded-xl inline-block">⚙️ 故障排除</h3>
                <p className="text-xs text-slate-600 leading-relaxed">若倒數計時不動或同步失敗，請嘗試：
                <br/>1. 重新整理網頁 (Ctrl+F5)。
                <br/>2. 檢查設定頁的 <b>GAS URL</b> 或 <b>Google Client ID</b> 是否正確。
                <br/>3. 確認 Google 雲端授權是否已「✅ 已連結」。</p>
              </section>
            </div>
          </div>
        )}
      </main>
      <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-100 px-8 pb-10 pt-4 z-50 shadow-lg font-black text-slate-800 font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black font-black">
        <div className="max-w-md mx-auto flex justify-around items-center font-black font-black font-black">
          {[ { id:'home', icon:'📝', label:'日常' }, { id:'stats', icon:'📈', label:'統計' }, { id:'manual', icon:'📖', label:'手冊' }, { id:'settings', icon:'⚙️', label:'設定' } ].map(tab => (
            <button key={tab.id} onClick={() => setCurrentTab(tab.id as TabType)} className={`flex flex-col items-center gap-2 transition-all duration-500 font-black ${currentTab === tab.id ? 'text-indigo-600' : 'text-slate-300'}`}>
              <div className={`w-16 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 font-black ${currentTab === tab.id ? 'bg-indigo-50 shadow-inner scale-110 font-black' : ''}`}>
                <span className={`text-2xl font-black ${currentTab === tab.id ? '' : 'grayscale opacity-40 scale-90'}`}>{tab.icon}</span>
              </div>
              <span className={`text-[11px] transition-all duration-500 font-black ${currentTab === tab.id ? 'opacity-100' : 'opacity-0'}`}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default App;
