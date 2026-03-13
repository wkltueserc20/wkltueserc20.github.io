/**
 * 👶 育兒助手 GAS 核心 v9.0
 * 整合功能：
 * 1. Google Drive 同步代理 (解決 PWA 跳窗問題)
 * 2. LINE 餵奶通知排程 (保留 v8.6 原有邏輯)
 * 3. 智慧授權換票 (長效 Refresh Token)
 */

// --- 配置區 (請在「指令碼屬性」中設定) ---
// GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SYNC_SECRET, GOOGLE_FOLDER_ID

function doGet(e) {
  return ContentService.createTextOutput("👶 Baby Tracker GAS Backend is running! (v9.0)")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  var contents = {};
  try {
    contents = JSON.parse(e.postData.contents);
  } catch (err) {
    // 相容舊版參數格式
    var keys = Object.keys(e.parameter);
    if (keys.length > 0) {
      try { contents = JSON.parse(keys[0]); } catch (err) { contents = e.parameter; }
    }
  }

  var action = contents.action;
  var userId = contents.userId;
  var props = PropertiesService.getScriptProperties();

  // 安全檢查 (如果是同步相關動作，檢查 SYNC_SECRET)
  var SYNC_SECRET = props.getProperty('SYNC_SECRET');
  if (['auth', 'push', 'pull'].indexOf(action) !== -1) {
    if (contents.syncSecret !== SYNC_SECRET) {
      return createResponse({ error: 'Unauthorized' });
    }
  }

  try {
    switch (action) {
      // --- 同步與授權功能 (New) ---
      case 'auth':
        return handleOAuthExchange(contents.code);
      case 'push':
        return handlePush(contents.fileName, contents.csv);
      case 'pull':
        return handlePull(contents.fileName);

      // --- LINE 通知功能 (v8.6 原有邏輯) ---
      case 'cancel':
        if (!userId) return createResponse({ error: 'Missing UserID' });
        var raw = props.getProperty(userId);
        if (raw) {
          var data = JSON.parse(raw);
          data.notified = true;
          props.setProperty(userId, JSON.stringify(data));
        }
        return createResponse({ status: 'success', message: 'Cancel Success' });

      case 'schedule':
      case 'test':
        var scheduleData = {
          token: contents.token,
          userId: contents.userId,
          targetTime: contents.targetTime,
          babyName: contents.babyName || "寶寶",
          notified: false
        };
        props.setProperty(contents.userId, JSON.stringify(scheduleData));
        return createResponse({ status: 'success', message: 'Schedule Success' });

      default:
        return createResponse({ error: 'Unknown action: ' + action });
    }
  } catch (err) {
    console.error("執行失敗: " + err.toString());
    return createResponse({ error: err.toString() });
  }
}

/**
 * 每分鐘自動執行的通知檢查 (保留給觸發器使用)
 */
function checkAndNotify() {
  var props = PropertiesService.getScriptProperties();
  var allKeys = props.getKeys();
  var now = new Date().getTime();

  // 排除掉系統保留屬性
  var systemKeys = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'SYNC_SECRET', 'REFRESH_TOKEN'];

  allKeys.forEach(function(key) {
    if (systemKeys.indexOf(key) !== -1) return;
    try {
      var raw = props.getProperty(key);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data.targetTime) return; // 確保是排程資料

      if (now >= data.targetTime && !data.notified) {
        var date = new Date(data.targetTime);
        var hours = date.getHours();
        var mins = date.getMinutes();
        var period = (hours < 5) ? "凌晨" : (hours < 11) ? "早上" : (hours < 13) ? "中午" : (hours < 18) ? "下午" : "晚上";
        var displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
        var timeStr = period + " " + displayHours + ":" + (mins < 10 ? "0" + mins : mins);

        sendLinePush(data.token, "🍼 " + timeStr + " " + data.babyName + " 喝奶時間到了喔！");
        data.notified = true;
        props.setProperty(key, JSON.stringify(data));
      }
    } catch(e) {}
  });
}

// --- OAuth & Drive 代理底層 ---

/**
 * 自動尋找或建立存放資料夾
 */
function getTargetFolderId(token) {
  var folderName = "育兒助手備份";
  var query = "name='" + folderName + "' and mimeType='application/vnd.google-apps.folder' and trashed=false";
  var res = UrlFetchApp.fetch("https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent(query), { 
    headers: { Authorization: "Bearer " + token } 
  });
  var files = JSON.parse(res.getContentText()).files;
  
  if (files.length > 0) {
    return files[0].id;
  }
  
  // 建立新資料夾
  var createRes = UrlFetchApp.fetch("https://www.googleapis.com/drive/v3/files", {
    method: "post",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    payload: JSON.stringify({ name: folderName, mimeType: "application/vnd.google-apps.folder" })
  });
  return JSON.parse(createRes.getContentText()).id;
}

function handleOAuthExchange(code) {
  var props = PropertiesService.getScriptProperties();
  var payload = {
    code: code,
    client_id: props.getProperty('GOOGLE_CLIENT_ID'),
    client_secret: props.getProperty('GOOGLE_CLIENT_SECRET'),
    redirect_uri: 'postmessage',
    grant_type: 'authorization_code'
  };
  var res = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', { method: 'post', payload: payload, muteHttpExceptions: true });
  var data = JSON.parse(res.getContentText());
  if (data.refresh_token) {
    props.setProperty('REFRESH_TOKEN', data.refresh_token);
    return createResponse({ status: 'success' });
  }
  return createResponse({ error: 'Auth failed', details: data });
}

function getAccessToken() {
  var props = PropertiesService.getScriptProperties();
  var refreshToken = props.getProperty('REFRESH_TOKEN');
  if (!refreshToken) throw new Error('Need re-auth');
  var payload = {
    refresh_token: refreshToken,
    client_id: props.getProperty('GOOGLE_CLIENT_ID'),
    client_secret: props.getProperty('GOOGLE_CLIENT_SECRET'),
    grant_type: 'refresh_token'
  };
  var res = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', { method: 'post', payload: payload });
  return JSON.parse(res.getContentText()).access_token;
}

function handlePush(fileName, csvContent) {
  var token = getAccessToken();
  var folderId = getTargetFolderId(token);
  var query = "name='" + fileName + "' and trashed=false and '" + folderId + "' in parents";
  var search = UrlFetchApp.fetch("https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent(query), { headers: { Authorization: "Bearer " + token } });
  var files = JSON.parse(search.getContentText()).files;
  var metadata = { name: fileName, mimeType: 'text/csv' };
  if (files.length === 0) metadata.parents = [folderId];

  var boundary = "-------babytracker";
  var body = "\r\n--" + boundary + "\r\nContent-Type: application/json\r\n\r\n" + JSON.stringify(metadata) + 
              "\r\n--" + boundary + "\r\nContent-Type: text/csv\r\n\r\n" + csvContent + "\r\n--" + boundary + "--";
  var url = files.length > 0 ? "https://www.googleapis.com/upload/drive/v3/files/" + files[0].id + "?uploadType=multipart" : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
  UrlFetchApp.fetch(url, { method: files.length > 0 ? "patch" : "post", headers: { Authorization: "Bearer " + token, "Content-Type": 'multipart/related; boundary="' + boundary + '"' }, payload: body });
  return createResponse({ status: 'success' });
}

function handlePull(fileName) {
  var token = getAccessToken();
  var folderId = getTargetFolderId(token);
  var query = "name='" + fileName + "' and trashed=false and '" + folderId + "' in parents";
  var search = UrlFetchApp.fetch("https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent(query), { headers: { Authorization: "Bearer " + token } });
  var files = JSON.parse(search.getContentText()).files;
  if (files.length > 0) {
    var res = UrlFetchApp.fetch("https://www.googleapis.com/drive/v3/files/" + files[0].id + "?alt=media", { headers: { Authorization: "Bearer " + token } });
    return createResponse({ status: 'success', csv: res.getContentText() });
  }
  return createResponse({ status: 'not_found' });
}

function sendLinePush(token, message) {
  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/broadcast", {
    "method": "post",
    "headers": { "Content-Type": "application/json", "Authorization": "Bearer " + token },
    "payload": JSON.stringify({ "messages": [{ "type": "text", "text": message }] })
  });
}

function createResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
