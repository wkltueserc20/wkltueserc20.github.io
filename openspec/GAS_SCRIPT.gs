/**
 * 👶 育兒助手 GAS 核心 v9.8
 * 整合功能：
 * 1. Google Drive 同步代理 (解決 PWA 跳窗問題)
 * 2. LINE 餵奶通知排程 (保留 v8.6 原有邏輯)
 * 3. 智慧授權換票 (長效 Refresh Token)
 * 4. 智慧同步協定 (smartSync: 單一請求 + fetchAll 並行)
 */

// --- 配置區 (請在「指令碼屬性」中設定) ---
// GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SYNC_SECRET, GOOGLE_FOLDER_ID

function doGet(e) {
  return ContentService.createTextOutput("👶 Baby Tracker GAS Backend is running! (v9.8)")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  var contents = {};
  try {
    contents = JSON.parse(e.postData.contents);
  } catch (err) {
    var keys = Object.keys(e.parameter);
    if (keys.length > 0) {
      try { contents = JSON.parse(keys[0]); } catch (err) { contents = e.parameter; }
    }
  }

  var action = contents.action;
  var userId = contents.userId;
  var props = PropertiesService.getScriptProperties();

  // 安全檢查
  var SYNC_SECRET = props.getProperty('SYNC_SECRET');
  if (['auth', 'push', 'pull', 'listRecent', 'batchSync', 'smartSync'].indexOf(action) !== -1) {
    if (contents.syncSecret !== SYNC_SECRET) {
      return createResponse({ error: 'Unauthorized' });
    }
  }

  try {
    switch (action) {
      case 'auth':
        return handleOAuthExchange(contents.code);
      case 'push':
        return handlePush(contents.fileName, contents.csv);
      case 'pull':
        return handlePull(contents.fileName);
      case 'listRecent':
        return handleListRecent();
      case 'batchSync':
        return handleBatchSync(contents.pull || [], contents.push || []);
      case 'smartSync':
        return handleSmartSync(contents.fingerprints || {}, contents.push || []);

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
 * 智慧同步 v9.8：單一請求完成 list + pull + push，共享 token/folderId，fetchAll 並行化
 * @param {Object} fingerprints - Client 端的 fileName → md5 快取
 * @param {Array<{name: string, csv: string}>} pushReqs - 要推送的 CSV 資料
 */
function handleSmartSync(fingerprints, pushReqs) {
  var token = getAccessToken();
  var folderId = getTargetFolderId(token);
  var authHeader = { Authorization: "Bearer " + token };
  var results = {};

  // 1. List recent files (同 handleListRecent 邏輯)
  var listQuery = "'" + folderId + "' in parents and mimeType='text/csv' and trashed=false";
  var listUrl = "https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent(listQuery) + "&orderBy=modifiedTime desc&pageSize=5&fields=files(name)";
  var listRes = UrlFetchApp.fetch(listUrl, { headers: authHeader });
  var recentFiles = JSON.parse(listRes.getContentText()).files.map(function(f) { return f.name; });

  // 2. Pull: 並行查詢所有檔案的 metadata
  if (recentFiles.length > 0) {
    var metaRequests = recentFiles.map(function(fileName) {
      var query = "name='" + fileName + "' and trashed=false and '" + folderId + "' in parents";
      return {
        url: "https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent(query) + "&fields=files(id,name,md5Checksum)",
        headers: authHeader,
        muteHttpExceptions: true
      };
    });
    var metaResponses = UrlFetchApp.fetchAll(metaRequests);

    // 解析 metadata，找出需要下載的檔案
    var filesToDownload = [];
    for (var i = 0; i < recentFiles.length; i++) {
      var fileName = recentFiles[i];
      try {
        if (metaResponses[i].getResponseCode() !== 200) {
          results[fileName] = { status: 'error', message: 'metadata fetch failed' };
          continue;
        }
        var files = JSON.parse(metaResponses[i].getContentText()).files;
        if (files.length === 0) {
          results[fileName] = { status: 'not_found' };
        } else if (files[0].md5Checksum === (fingerprints[fileName] || "")) {
          results[fileName] = { status: 'unchanged', md5: files[0].md5Checksum };
        } else {
          filesToDownload.push({ fileName: fileName, fileId: files[0].id, md5: files[0].md5Checksum });
        }
      } catch (e) {
        results[fileName] = { status: 'error', message: e.toString() };
      }
    }

    // 並行下載有變更的檔案
    if (filesToDownload.length > 0) {
      var dlRequests = filesToDownload.map(function(f) {
        return {
          url: "https://www.googleapis.com/drive/v3/files/" + f.fileId + "?alt=media",
          headers: authHeader,
          muteHttpExceptions: true
        };
      });
      var dlResponses = UrlFetchApp.fetchAll(dlRequests);

      for (var j = 0; j < filesToDownload.length; j++) {
        var dl = filesToDownload[j];
        try {
          if (dlResponses[j].getResponseCode() === 200) {
            results[dl.fileName] = { status: 'updated', md5: dl.md5, csv: dlResponses[j].getContentText() };
          } else {
            results[dl.fileName] = { status: 'error', message: 'download failed: ' + dlResponses[j].getResponseCode() };
          }
        } catch (e) {
          results[dl.fileName] = { status: 'error', message: e.toString() };
        }
      }
    }
  }

  // 3. Push: 並行搜尋既有檔案
  if (pushReqs.length > 0) {
    var searchRequests = pushReqs.map(function(req) {
      var query = "name='" + req.name + "' and trashed=false and '" + folderId + "' in parents";
      return {
        url: "https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent(query),
        headers: authHeader,
        muteHttpExceptions: true
      };
    });
    var searchResponses = UrlFetchApp.fetchAll(searchRequests);

    // 並行上傳所有檔案
    var uploadRequests = [];
    var uploadNames = [];
    var boundary = "-------babytracker";
    for (var k = 0; k < pushReqs.length; k++) {
      try {
        var existingFiles = (searchResponses[k].getResponseCode() === 200)
          ? JSON.parse(searchResponses[k].getContentText()).files
          : [];
        var metadata = { name: pushReqs[k].name, mimeType: 'text/csv' };
        var isUpdate = existingFiles.length > 0;
        if (!isUpdate) metadata.parents = [folderId];

        var body = "\r\n--" + boundary + "\r\nContent-Type: application/json\r\n\r\n" + JSON.stringify(metadata) +
                   "\r\n--" + boundary + "\r\nContent-Type: text/csv\r\n\r\n" + pushReqs[k].csv + "\r\n--" + boundary + "--";
        var uploadUrl = isUpdate
          ? "https://www.googleapis.com/upload/drive/v3/files/" + existingFiles[0].id + "?uploadType=multipart"
          : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

        uploadRequests.push({
          url: uploadUrl,
          method: isUpdate ? "patch" : "post",
          headers: { Authorization: "Bearer " + token, "Content-Type": 'multipart/related; boundary="' + boundary + '"' },
          payload: body,
          muteHttpExceptions: true
        });
        uploadNames.push(pushReqs[k].name);
      } catch (e) {
        console.error("Push prepare error for " + pushReqs[k].name + ": " + e.toString());
      }
    }

    if (uploadRequests.length > 0) {
      var uploadResponses = UrlFetchApp.fetchAll(uploadRequests);
      for (var m = 0; m < uploadResponses.length; m++) {
        if (uploadResponses[m].getResponseCode() >= 400) {
          console.error("Push failed for " + uploadNames[m] + ": " + uploadResponses[m].getResponseCode());
        }
      }
    }
  }

  return createResponse({ status: 'success', files: recentFiles, results: results });
}

/**
 * 批量同步處理 (舊版，保留向後相容)
 * @param {Array<{name: string, md5: string}>} pullReqs
 * @param {Array<{name: string, csv: string}>} pushReqs
 */
function handleBatchSync(pullReqs, pushReqs) {
  var token = getAccessToken();
  var folderId = getTargetFolderId(token);
  var results = {};

  // 1. 處理 Pull (帶指紋比對)
  pullReqs.forEach(function(req) {
    var fileName = req.name;
    var clientMd5 = req.md5;
    var fileMeta = getFileMetadata(token, folderId, fileName);
    
    if (!fileMeta) {
      results[fileName] = { status: 'not_found' };
    } else if (fileMeta.md5Checksum === clientMd5) {
      results[fileName] = { status: 'unchanged', md5: fileMeta.md5Checksum };
    } else {
      // MD5 不符，抓取內容
      var content = fetchFileContent(token, fileMeta.id);
      results[fileName] = { status: 'updated', md5: fileMeta.md5Checksum, csv: content };
    }
  });

  // 2. 處理 Push
  pushReqs.forEach(function(req) {
    handlePush(req.name, req.csv); // 復用現有的 handlePush
  });

  return createResponse({ status: 'success', results: results });
}

function getFileMetadata(token, folderId, fileName) {
  var query = "name='" + fileName + "' and trashed=false and '" + folderId + "' in parents";
  var url = "https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent(query) + "&fields=files(id,name,md5Checksum)";
  var res = UrlFetchApp.fetch(url, { headers: { Authorization: "Bearer " + token } });
  var files = JSON.parse(res.getContentText()).files;
  return files.length > 0 ? files[0] : null;
}

function fetchFileContent(token, fileId) {
  var url = "https://www.googleapis.com/drive/v3/files/" + fileId + "?alt=media";
  var res = UrlFetchApp.fetch(url, { headers: { Authorization: "Bearer " + token } });
  return res.getContentText();
}

/**
 * 每分鐘自動執行的通知檢查 (保留給觸發器使用)
 */
function checkAndNotify() {
  var props = PropertiesService.getScriptProperties();
  var allKeys = props.getKeys();
  var now = new Date().getTime();

  var systemKeys = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'SYNC_SECRET', 'REFRESH_TOKEN'];

  allKeys.forEach(function(key) {
    if (systemKeys.indexOf(key) !== -1) return;
    try {
      var raw = props.getProperty(key);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data.targetTime) return; 

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

function handleListRecent() {
  var token = getAccessToken();
  var folderId = getTargetFolderId(token);
  var query = "'" + folderId + "' in parents and mimeType='text/csv' and trashed=false";
  var url = "https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent(query) + "&orderBy=modifiedTime desc&pageSize=5&fields=files(name)";
  var res = UrlFetchApp.fetch(url, { headers: { Authorization: "Bearer " + token } });
  var data = JSON.parse(res.getContentText());
  var fileNames = data.files.map(function(f) { return f.name; });
  return createResponse({ status: 'success', files: fileNames });
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
