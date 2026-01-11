
const LINE_TOKEN = 'Add base code (without tokens)'; 

function doPost(e) {
  const json = JSON.parse(e.postData.contents);
  const replyToken = json.events[0].replyToken;
  const userMessage = json.events[0].message.text;
  
  // 1. 届いたメッセージをスペースで区切る
  const parts = userMessage.split(/[\s　]+/);
  if (parts.length < 4) {
    return replyLine(replyToken, "形式：[大] [中] [品名] [金額] [備考]");
  }

  // 2. データを変数に分ける
  const majorCode = Number(parts[0]);
  const minorCode = Number(parts[1]);
  const itemName  = parts[2];
  const amount    = Number(parts[3]);
  const remark    = parts[4] || "なし";

if(isNaN(majorCode) || majorCode < 1 || majorCode > 3)
  {return replyLine(replyToken,"１つめは１～３で入力せなあかんで！！")}

if(isNaN(minorCode) || minorCode < 1 || minorCode > 17)
  {return replyLine(replyToken,"２つめは１～１７で入力せなあかんで！！")}

if(isNaN(amount))
  {return replyLine(replyToken,"４つめは金額を数字で入れなあかんで！！")}

  // 3. マスタ名に変換（JavaScriptの「オブジェクト」という基本知識）
  const majorMap = {1: "固定費", 2: "変動費", 3: "特別費"};
  const majorName = majorMap[majorCode] || "不明";

  const minorMap = {
    1:"住宅ローン", 2:"車ローン", 3:"医療保険", 4:"生命保険", 5:"固定水道光熱費", 
    6:"通信費", 7:"教育費", 8:"サブスク", 9:"その他",
    10:"食費", 11:"外食費", "12":"日用品", 13:"趣味", 14:"交通費", 15:"美容品", 16:"医療費",
    17:"特別費"
  };
  const minorName = minorMap[minorCode] || "不明";

  // 4. シートに書き込む
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const today = new Date();
  const sheetName = Utilities.formatDate(today, "JST", "yyyy-MM");
  let sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  
  // シートが空なら見出しを作る
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["日付", "大項目", "中項目", "品名", "金額", "備考"]);
  }

  // データを追加
  sheet.appendRow([
    Utilities.formatDate(today, "JST", "yyyy/MM/dd HH:mm"),
    majorName,
    minorName,
    itemName,
    amount,
    remark
  ]);

  // 5. シンプルな返信（まずここを改造する）
  const resMsg = `記録しました！\n項目：${minorName}\n金額：${amount}円`;
  replyLine(replyToken, resMsg);
}

// LINEに返信する関数（ここは魔法のセット）
function replyLine(token, message) {
  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", {
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + LINE_TOKEN,
    },
    "method": "post",
    "payload": JSON.stringify({
      "replyToken": token,
      "messages": [{ "type": "text", "text": message }]
    })
  });
}
