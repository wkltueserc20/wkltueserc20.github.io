import { useState, useEffect } from 'react';

type RecordType = 'feeding' | 'diaper';

interface Record {
  id: string;
  type: RecordType;
  time: string;
  amount?: number; // for feeding
  status?: string; // for diaper: wet, dirty, both
  note?: string;
}

function App() {
  const [records, setRecords] = useState<Record[]>([]);
  const [filter, setFilter] = useState<'all' | RecordType>('all');
  
  // Form states
  const [type, setType] = useState<RecordType>('feeding');
  const [amount, setAmount] = useState<string>('');
  const [status, setStatus] = useState<string>('wet');
  const [note, setNote] = useState<string>('');

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem('baby-records');
    if (saved) {
      setRecords(JSON.parse(saved));
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('baby-records', JSON.stringify(records));
  }, [records]);

  const addRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: Record = {
      id: crypto.randomUUID(),
      type,
      time: new Date().toLocaleString('zh-TW'),
      amount: type === 'feeding' ? Number(amount) : undefined,
      status: type === 'diaper' ? status : undefined,
      note,
    };
    setRecords([newRecord, ...records]);
    // Reset form
    setAmount('');
    setNote('');
  };

  const deleteRecord = (id: string) => {
    if (window.confirm('確定要刪除這條紀錄嗎？')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const filteredRecords = filter === 'all' 
    ? records 
    : records.filter(r => r.type === filter);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">育兒生活助手</h1>
          <p className="mt-2 text-gray-600">輕鬆紀錄寶寶的成長每一刻</p>
        </header>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={addRecord} className="space-y-4">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setType('feeding')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${type === 'feeding' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
              >
                餵奶紀錄
              </button>
              <button
                type="button"
                onClick={() => setType('diaper')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${type === 'diaper' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
              >
                尿布紀錄
              </button>
            </div>

            {type === 'feeding' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">奶量 (ml)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="輸入毫升數"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="wet">濕 (尿尿)</option>
                  <option value="dirty">髒 (便便)</option>
                  <option value="both">都有</option>
                  <option value="dry">乾爽</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">備註 (選填)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="例如：溢奶、顏色偏綠..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md"
            >
              新增紀錄
            </button>
          </form>
        </div>

        {/* Filter & List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold text-gray-800">歷史紀錄</h2>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-transparent text-sm text-gray-500 font-medium outline-none"
            >
              <option value="all">全部</option>
              <option value="feeding">僅奶量</option>
              <option value="diaper">僅尿布</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredRecords.length === 0 ? (
              <p className="text-center py-10 text-gray-400 italic">尚無紀錄</p>
            ) : (
              filteredRecords.map(record => (
                <div key={record.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${record.type === 'feeding' ? 'bg-blue-400' : 'bg-yellow-400'}`}></span>
                      <span className="font-bold text-gray-700">
                        {record.type === 'feeding' ? `餵奶: ${record.amount}ml` : `尿布: ${
                          record.status === 'wet' ? '尿尿' : 
                          record.status === 'dirty' ? '便便' : 
                          record.status === 'both' ? '都有' : '乾爽'
                        }`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{record.time}</p>
                    {record.note && <p className="text-sm text-gray-500 mt-1 italic">「{record.note}」</p>}
                  </div>
                  <button 
                    onClick={() => deleteRecord(record.id)}
                    className="text-gray-300 hover:text-red-400 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
