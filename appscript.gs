function doGet(e) {
  return ContentService.createTextOutput('Hello World');
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents); // 解析 JSON 資料
  sheet.appendRow(data); // 將資料添加到表格的一行
  return ContentService.createTextOutput('Success');
}


/*
部署->新增部署內容->web app->取得授權



*/