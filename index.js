// todo catch all data from iframe
/**
 * 要接回來的資料 問使用者有沒有做過
 * agree的email和是否要刪除 base+lec5問卷 hc/ipt問卷 
 * guide的quiz的兩題答對與否 guide的quiz的兩題回答時間
 * guide三個投資金額 exp一大串要回傳
 */

var url = "https://script.google.com/macros/s/AKfycbzo7nVqKc6b8F9N8QN4bQlKkqRDSdTS4unDX6pxrDzkgDmY5DJ0I5CsYOpFLhB6hr2qYQ/exec"
var url_base64 = ""

var index_done_before = "" // catch from index.html 0
var agree_form_json = {} // catch from agree.html 1
var base_survey_json = {} // catch from baseLED5.html 2
var group_survey_json = {} // catch from hc/nipt/ipt 3 4
var guide_json = {} // catch from guide 5
var exp = {} // catch from exp 6
var after_agree_json = {} // catch from after_agree 7

var merged_part1 = {}
var merged_part2 = {}

var index_counter = 0;
var assign_group = ""
const frame = document.getElementById("content-frame");

// 順序頁面對應表
const pages = [
  "survey/welcome",       // index 0
  "survey/agree",         // index 1
  "survey/baseLEC5",      // index 2
  "survey/hcDASS21",      // index 3
  "survey/niptIptPDS5",   // index 4
  "guide/guide",          // index 5
  "experiment/experiment", // index 6
  "survey/agree_after",     // index 7
  "survey/end"     // index 8
];

// 切換 iframe 的內容頁面，避免新增歷史紀錄
function showPage(pagePath) {
  frame.contentWindow.location.replace(`${pagePath}.html`);
}

// 實現子畫面回傳資料後自動跳轉
function jump_page() {
  if (index_counter < pages.length) {
    showPage(pages[index_counter]);
  } else {
    console.log("已完成所有頁面跳轉");
    // 這裡可以加入完成邏輯，例如顯示成功訊息或跳轉到結束頁面
  }
}


// upload part1
function upload_part1() {
  merged_part1 = { ...index_done_before, ...agree_form_json, ...base_survey_json,  ...group_survey_json};
  console.log("正在上傳資料1")
  return upload_to_gs(1, merged_part1) // 1for第一part
}
// upload part2
function upload_part2() {
  merged_part2 = { ...guide_json, ...exp, ...after_agree_json};
  merged_part2.email = agree_form_json.email
  console.log("正在上傳資料2")
  return upload_to_gs(2, merged_part2) // 2for第二part
}

// 子畫面回傳資料後要讓東西去接他
function payload_process(payload){
  console.log("第",index_counter,"個去接它")
  // part1
  if (index_counter == 0){ // welcome
    index_done_before = payload
    index_done_before.timestamp_0 = index_done_before.timestamp
    delete index_done_before.timestamp;
  }
  else if (index_counter == 1){ // agree
    agree_form_json = JSON.parse(JSON.stringify(payload))
    agree_form_json.timestamp_1 = agree_form_json.timestamp
    delete agree_form_json.timestamp;

  }
  else if (index_counter == 2){ // base lec5
    resetTimeout_1hr() // 問卷一個小時限制開始計時
    base_survey_json = JSON.parse(JSON.stringify(payload))
    // 同時這裡要判斷分組 在這邊存成global var
    assign_group = base_survey_json.tramaGroup
    if (assign_group === 'HC') {
      // do nothing index_counter正常情況會2變成3
    }
    else{
      // ipt nipt null 都會在這邊
      // index_counter多加1 這樣index_counter就會直接從2跳到4
      // 這樣就會跳掉hc的問卷直接去找niptipt
      index_counter++
    }
    base_survey_json.timestamp_2 = base_survey_json.timestamp
    delete base_survey_json.timestamp;
  }
  else if (index_counter == 3){ // hc
    group_survey_json = JSON.parse(JSON.stringify(payload))
    // index_counter多加1 這樣index_counter就會直接從3跳到5
    // 這樣就會跳掉niptipt的問卷直接去找guide
    index_counter++
    group_survey_json.timestamp_3 = group_survey_json.timestamp
    delete group_survey_json.timestamp
    upload_part1()
    clearTimeout_1hr() // 問卷一個小時結束計時
  }

  else if (index_counter == 4){ //nipt ipt
    group_survey_json = JSON.parse(JSON.stringify(payload))
    group_survey_json.timestamp_4 = group_survey_json.timestamp
    delete group_survey_json.timestamp
    upload_part1()
    clearTimeout_1hr() // 問卷一個小時結束計時
  }
  // part1 上傳
  // part2
  else if (index_counter == 5){ // guide
    guide_json = JSON.parse(JSON.stringify(payload))
    guide_json.timestamp_5 = guide_json.timestamp

    for (let key in guide_json.quiz) {
      guide_json[`${key.replace('-', '_')}_ans`] = guide_json.quiz[key].selectedAnswer
      guide_json[`${key.replace('-', '_')}_isCorrect`] = guide_json.quiz[key].isCorrect
      guide_json[`${key.replace('-', '_')}_rt`] = guide_json.quiz[key].timeTaken
    }

    delete guide_json.quiz
    delete guide_json.timestamp
  }
  else if (index_counter == 6){ // exp
    // 正式可以改成let
    var temp_exp = JSON.parse(JSON.stringify(payload))
    process_exp_data(temp_exp)
  }
  else if (index_counter == 7){ // 事後研究同意表單
    after_agree_json = JSON.parse(JSON.stringify(payload))
    after_agree_json.timestamp_7 = after_agree_json.timestamp
    delete after_agree_json.timestamp;
    upload_part2()
    setTimeout(() => {
      remove_block_reload_event()
      alert("上傳成功，您可以關閉網頁了") // 注意 這只是定時器，隨時要修正 但是我很懶
    }, 6000);

  }
  // part2 上傳
  index_counter++
}

function process_exp_data(inputData) {
  // part1 映射成ang或hap
  var drawpart1_map = inputData.drawpart1.map(item => item.includes('快樂') ? 'hap' : 'ang');
  // part2 映射成ang或hap
  var drawpart2_map = inputData.drawpart2.slice(2).map(item => {
    if (item.includes("生氣臉a")) return "ang_a";
    if (item.includes("生氣臉b")) return "ang_b";
    if (item.includes("快樂臉a")) return "hap_a";
    if (item.includes("快樂臉b")) return "hap_b";
    return 'error'; // 預防未預期的情況
  });


  // 時間戳
  exp.timestamp_6 = inputData.timestamp
  // 練習回應內容 時間
  exp['inv_Prac1'] = inputData.trials[3].response
  exp['rt_inv_Prac1'] = inputData.trials[3].rt
  exp['inv_Prac2'] = inputData.trials[7].response
  exp['rt_inv_Prac2'] = inputData.trials[7].rt
  // 抽出來的圖片順序
  exp['IG_group'] = inputData.drawpart1
  exp['ER_group'] = inputData.drawpart2


  // part1 第一張臉回應內容 時間
  let counter = 1;
  for(let i = 14 ; i < 74+1 ; i+=4 ){
    exp[`inv_${drawpart1_map[0]}${counter}`] = inputData.trials[i].response
    exp[`rt_${drawpart1_map[0]}${counter}`] = inputData.trials[i].rt
    counter++
  };


  // part1 第二張臉回應內容 時間
  counter = 1;
  for(let i = 79 ; i < 139+1 ; i+=4 ){
    exp[`inv_${drawpart1_map[1]}${counter}`] = inputData.trials[i].response
    exp[`rt_${drawpart1_map[1]}${counter}`] = inputData.trials[i].rt
    counter++
  };


  //part2 練習兩次回應內容 時間
  counter = 1;
  for(let i = 147 ; i < 151+1 ; i+=4 ){
    exp[`V_Prac${counter}`] = inputData.trials[i].response
    exp[`rtV_Prac${counter}`] = inputData.trials[i].rt
    exp[`Threat_Prac${counter}`] = inputData.trials[i+1].response
    exp[`rtThreat_Prac${counter}`] = inputData.trials[i+1].rt
    exp[`Trust_Prac${counter}`] = inputData.trials[i+2].response
    exp[`rtTrust_Prac${counter}`] = inputData.trials[i+2].rt
    counter++
  };


  //part2 正式四張臉回應內容 時間
  counter = 1;
  for(let i = 156 ; i < 168+1 ; i+=4 ){
    exp[`V_${drawpart2_map[counter-1]}`] = inputData.trials[i].response
    exp[`rtV_${drawpart2_map[counter-1]}`] = inputData.trials[i].rt
    exp[`Threat_${drawpart2_map[counter-1]}`] = inputData.trials[i+1].response
    exp[`rtThreat_${drawpart2_map[counter-1]}`] = inputData.trials[i+1].rt
    exp[`Trust_${drawpart2_map[counter-1]}`] = inputData.trials[i+2].response
    exp[`rtTrust_${drawpart2_map[counter-1]}`] = inputData.trials[i+2].rt
    counter++
  };

  exp['P_Trust'] = inputData.trials[172].response.Q0

}


// 監聽子頁面回傳的資料
function wait_child_listener(){
  window.addEventListener("message", (event) => {
    // console.log("Current child page URL:", frame.src); // 紀錄子畫面 URL 好像用replace的就看不到了
    if (event.data && event.data.action === "sendData") {
      // 獲取 JSON 資料
      const payload = event.data.payload;
      console.log("Received data from child:", payload);
      payload_process(payload)
      jump_page(); // 每次處理後自動跳轉下一頁
    }
    else if (event.data && event.data.action === "noData") { // 正常回傳但是沒有資料的子網頁 應該不存在這種東西
      jump_page(); // 每次處理後自動跳轉下一頁
    }
  });
}



//  =======================================abandoned=================================================
/**
 * token產生器 棄用
 * require: MD5 function
 * @returns token:str
 */
function generate_token() {
  var MD5 = function(d){var r = M(V(Y(X(d),8*d.length)));return r.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}
  function generate_temp_token() {
    const length = 126
    const charset = "CDEFGHJKLMPQSTUVWXZacdefghjkmnprstuvwxyz123456789";
    let token = "";
    for (let i = 0; i < length; i++) {
      token += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return token
  }

  let token = 't' + generate_temp_token() + 'n'
  let part1 = token.substring(0, 64);
  let part2 = token.substring(64);
  // Step 3
  let md5_part1 = MD5(part1);
  let md5_part2 = MD5(part2);
  // Step 4
  let final_md5 = MD5(md5_part1 + md5_part2);
  let final_token = part1 + final_md5 + part2

  console.log(final_token)
  return final_token
}

/**
 * token驗證器 棄用
 * require: MD5 function
 */
function verifyToken(token_input) {
    
  var MD5 = function(d){var r = M(V(Y(X(d),8*d.length)));return r.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}
  const charset = "CDEFGHJKLMPQSTUVWXZacdefghjkmnprstuvwxyz123456789";
  const validChars = new RegExp(`^[${charset}]+$`);

  const first64 = token_input.slice(0,64);  // 前64字
  const last64 = token_input.slice(-64);    // 後64字
  
  // 1.長度
  if (token_input.length !== 160) {
    console.error("token非法的長度")
    return;
  }
  // 2.字元集
  if (!validChars.test(first64) || !validChars.test(last64)) {
    console.error("token非法的字元集")
    return;
  }

  // 3. 檢查首尾字元
  if (token_input[0] !== 't' || token_input[token_input.length - 1] !== 'n') {
    console.error("token頭尾非t或n")
    return;
  }

  // 4. 檢查 MD5 驗證
  const middle32 = token_input.slice(64, 96);  // 中間32字
  const md5First64 = MD5(first64);   // 對前64字進行MD5
  const md5Last64 = MD5(last64);     // 對後64字進行MD5
  const finalHash = MD5(md5First64 + md5Last64);  // 兩個MD5結果拼接後再MD5

  if (middle32 !== finalHash) {
    console.error("MD5不合法")
    return;
  }

  console.log("合法")
}

// 棄用
// token 從上一個網頁傳來的token引導 棄用
// index.html傳來的token
function chk_token(){
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "0";
  if (!verifyToken(token)) { // 驗證token錯誤
      alert("警告，token錯誤，這將導致實驗收集異常，請不要進行實驗，盡快聯絡實驗者")
      console.error("警告，token錯誤，這將導致實驗收集異常，請不要進行實驗，盡快聯絡實驗者")
  } // 都沒事就什麼訊息都不用
}


//  =======================================阻止重新整理=================================================
/**
 * 如果使用者在重新整理後都沒有跟網頁互動就不會阻止
 * 
 */
function beforeUnloadHandler(event) {
  event.preventDefault();
  console.log("使用者點擊了reload但是被攔截");
}

function keydownHandler(event) {
  // 阻止 F5 和 Ctrl+R
  if (event.key === "F5" || (event.ctrlKey && event.key === "r")) {
    event.preventDefault();
    alert("重新整理已被禁用");
  }
}
function block_reload_event() {
  window.addEventListener("beforeunload", beforeUnloadHandler);
  document.addEventListener("keydown", keydownHandler);
}

function remove_block_reload_event(){
  window.removeEventListener("beforeunload", beforeUnloadHandler);
  document.removeEventListener("keydown", keydownHandler);
}


//  =======================================上傳到google sheet =================================================
/**
 * 
 * 
 */

function tag_time(){
  var currentTime = new Date();
  var formattedTime = currentTime.getFullYear() + '/' + 
                      (currentTime.getMonth() + 1) + '/' + 
                      currentTime.getDate() + ' ' + 
                      currentTime.getHours() + ':' + 
                      (currentTime.getMinutes().toString().padStart(2, '0'));
  return formattedTime
}


// ==========================================upload json file to google sheet====================================================================================================
/*function doPost(e) {

  var jsonObject = JSON.parse(e.postData.contents);

  if (jsonObject.part == 1) {
    console.log("part1")
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("第一部分raw"); // 替換為你的工作表名稱
    var predefinedKeys = [
      'email', 'timestamp_0', 'timestamp_1', 'timestamp_2', 'timestamp_3', 'timestamp_4', 'p_NP', 'delete_data_if_pause',
      'tramaGroup', 'agree_to_attend', 'agree_to_attend_1', 'agree_to_attend_2', 'agree_to_attend_3', 'age', 'gender',
      'gender_more', 'educ', 'emp_status', 'occupation', 'econ_status', 'mar_status', 'res_status', 'res_status_more',
      'med_history', 'med_history_more_age', 'med_history_more_diagnose', 'medication_history', 'medication_history_more',
      'LEC_Q1', 'LEC_Q2', 'LEC_Q3', 'LEC_Q4', 'LEC_Q5', 'LEC_Q6', 'LEC_Q7', 'LEC_Q8', 'LEC_Q9', 'LEC_Q10', 'LEC_Q11',
      'LEC_Q12', 'LEC_Q13', 'LEC_Q14', 'LEC_Q15', 'LEC_Q16', 'LEC_Q17', 'LEC_Q17_1', 'LEC_Q17_1_more', 'LEC_Q17_2',
      'LEC_QA', 'LEC_QB', 'LEC_QC', 'LEC_QD', 'LEC_QE', 'LEC_QF', 'LEC_QG', 'LEC_QG_more', 'LEC_QH', 'LEC_QI', 'LEC_QJ',
      'LEC_QK', 'LEC_QL', 'LEC_QL_more', 'LEC_QM', 'LEC_QN', 'PDS_q1', 'PDS_q2', 'PDS_q3', 'PDS_q4', 'PDS_q5', 'PDS_q6',
      'PDS_q7', 'PDS_q8', 'PDS_q9', 'PDS_q10', 'PDS_q11', 'PDS_q12', 'PDS_q13', 'PDS_q14', 'PDS_q15', 'PDS_q16',
      'PDS_q17', 'PDS_q18', 'PDS_q19', 'PDS_q20', 'PDS_q21', 'PDS_q22', 'PDS_q23', 'PDS_q24', 'DASS_q1', 'DASS_q2',
      'DASS_q3', 'DASS_q4', 'DASS_q5', 'DASS_q6', 'DASS_q7', 'DASS_q8', 'DASS_q9', 'DASS_q10', 'DASS_q11', 'DASS_q12',
      'DASS_q13', 'DASS_q14', 'DASS_q15', 'DASS_q16', 'DASS_q17', 'DASS_q18', 'DASS_q19', 'DASS_q20', 'DASS_q21',
      'PMBS_q1', 'PMBS_q2', 'PMBS_q3', 'PMBS_q4', 'PMBS_q5', 'PMBS_q6', 'PMBS_q7', 'PMBS_q8', 'PMBS_q9', 'PMBS_q10',
      'PMBS_q11', 'PMBS_q12', 'PMBS_q13', 'PMBS_q14', 'PMBS_q15'
    ];
  }
  else if (jsonObject.part == 2) {
    console.log("part2")
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("第二部分raw");
    var predefinedKeys = [
      'email', 'timestamp_5', 'timestamp_6', 'timestamp_7', 
      '1_1_ans', '1_1_isCorrect', '1_1_rt', 
      '1_2_ans', '1_2_isCorrect', '1_2_rt', 
      '2_1_ans', '2_1_isCorrect', '2_1_rt', 
      '2_2_ans', '2_2_isCorrect', '2_2_rt', 
      'inv1', 'inv2', 'inv3', 
      'inv_Prac1', 'rt_inv_Prac1', 
      'inv_Prac2', 'rt_inv_Prac2', 
      'IG_group', 
      'inv_ang1', 'rt_ang1', 'inv_ang2', 'rt_ang2', 'inv_ang3', 'rt_ang3', 
      'inv_ang4', 'rt_ang4', 'inv_ang5', 'rt_ang5', 'inv_ang6', 'rt_ang6', 
      'inv_ang7', 'rt_ang7', 'inv_ang8', 'rt_ang8', 'inv_ang9', 'rt_ang9', 
      'inv_ang10', 'rt_ang10', 'inv_ang11', 'rt_ang11', 'inv_ang12', 'rt_ang12',
      'inv_ang13', 'rt_ang13', 'inv_ang14', 'rt_ang14', 'inv_ang15', 'rt_ang15', 
      'inv_ang16', 'rt_ang16', 
      'inv_hap1', 'rt_hap1', 'inv_hap2', 'rt_hap2', 'inv_hap3', 'rt_hap3', 
      'inv_hap4', 'rt_hap4', 'inv_hap5', 'rt_hap5', 'inv_hap6', 'rt_hap6', 
      'inv_hap7', 'rt_hap7', 'inv_hap8', 'rt_hap8', 'inv_hap9', 'rt_hap9', 
      'inv_hap10', 'rt_hap10', 'inv_hap11', 'rt_hap11', 'inv_hap12', 'rt_hap12', 
      'inv_hap13', 'rt_hap13', 'inv_hap14', 'rt_hap14', 'inv_hap15', 'rt_hap15', 
      'inv_hap16', 'rt_hap16', 
      'V_Prac1', 'rtV_Prac1', 'Threat_Prac1', 'rtThreat_Prac1', 'Trust_Prac1', 'rtTrust_Prac1', 
      'V_Prac2', 'rtV_Prac2', 'Threat_Prac2', 'rtThreat_Prac2', 'Trust_Prac2', 'rtTrust_Prac2', 
      'ER_group', 
      'V_ang_a', 'rtV_ang_a', 'Threat_ang_a', 'rtThreat_ang_a', 'Trust_ang_a', 'rtTrust_ang_a', 
      'V_ang_b', 'rtV_ang_b', 'Threat_ang_b', 'rtThreat_ang_b', 'Trust_ang_b', 'rtTrust_ang_b',
      'V_hap_a', 'rtV_hap_a', 'Threat_hap_a', 'rtThreat_hap_a', 'Trust_hap_a', 'rtTrust_hap_a', 
      'V_hap_b', 'rtV_hap_b', 'Threat_hap_b', 'rtThreat_hap_b', 'Trust_hap_b', 'rtTrust_hap_b', 
      'P_Trust', 'agree_using_data', 'reward'
    ];
  }
  else {
    console.log("其他raw")
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("其他raw");
    var predefinedKeys = [
      'email'
    ];
  }
  delete jsonObject["part"];

  var remainingKeys = Object.keys(jsonObject).filter(key => !predefinedKeys.includes(key));
  var keys = predefinedKeys.concat(remainingKeys);

  // 根據 keys 順序取值
  var values = keys.map(key => 
    key in jsonObject 
      ? (Array.isArray(jsonObject[key]) ? jsonObject[key].join(', ') : jsonObject[key]) 
      : ''
  );

  // 如果第一行是標題，則自動檢查並添加標題
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(keys);
  }

  // 添加資料
  sheet.appendRow(values);
  return ContentService.createTextOutput('Success');
}*/

// POST到google sheet邏輯 
// json和array都可用
// 一維解開而已 不會解到裡面
function upload_to_gs(upload_part, upload_data){ // json
  upload_data.part = upload_part;
  // 將資料發送到 Google Sheets
  fetch(url, {
    redirect: "follow",
    method: 'POST',
    body: JSON.stringify(upload_data), // 將資料轉換成 JSON 格式
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    }
  })
    .then(response => response.text())
    .then(data => {
      if (data === "Success") {
        console.log("上傳成功"); // 改為輸出中文訊息
        // return true; // successful
      } 
      
      else {
        alert("上傳時伺服器回應錯誤，請停止實驗並將此訊息截圖告知實驗者")
        console.warn("伺服器回應錯誤", data);
        // return false; // failed
      }
    })
    .catch(error => {
      console.error('Error:', error)
      // return false; // failed
    });
}

// ==========================================upload array to google sheet====================================================================================================
/*
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents); // 解析 JSON 資料
  sheet.appendRow(data); // 將資料添加到表格的一行
  return ContentService.createTextOutput('Success');
}
*/
/*
function upload_array_to_gs(upload_array){
  var url = "https://script.google.com/macros/s/AKfycbxUWMbFmIYcRZEhnt0By9FXuC4FPmuzR9_VLFQVAvhzOy6oL8zGIM9PIp56N1KulzCA4g/exec"
  // 將資料發送到 Google Sheets
  fetch(url, {
    redirect: "follow",
    method: 'POST',
    body: JSON.stringify(upload_array), // 將資料轉換成 JSON 格式
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
  })
    .then(response => response.text())
    .then(data => {
      if (data === "Success") {
        console.log("上傳成功"); // 改為輸出中文訊息
      } else {
        console.log("伺服器回應:", data);
      }
    })
    .catch(error => console.error('Error:', error));
}*/

// ===================================================追蹤是否一個小時內有點擊===================================================================
let timeout_1hr;

// 定義重置計時器的函數
function resetTimeout_1hr() {
    // 清除先前的計時器
    clearTimeout(timeout_1hr);
    
    // 設定新的計時器
    timeoutId = setTimeout(() => {
        alert("您的填寫時間已超過60分鐘，本問卷無須過度深思或追求完美答案，如果有任何問題歡迎與我們聯繫");
    }, 3600000);
}

function clearTimeout_1hr() {
  clearTimeout(timeout_1hr);
}

// ===================================================main()===========================================================================
wait_child_listener()
block_reload_event()
