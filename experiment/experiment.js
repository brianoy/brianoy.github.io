// 設定秒數，如果是debug的時候可以更改true或false來讓實驗秒數少一點

// var time_settings = [階段,遊戲畫面,回饋畫面計算中，回饋金額顯示,專注點0.8秒,專注點0.2秒,下一位夥伴提示語,情緒評級作業指導語,懸浮視窗5分鐘];
if(false){ // normal mode
  var time_settings = [3000,20000,2000,5000,800,200,5000,60000,300000,600000];
}
else{ // debug mode
  console.log("現在時間用的是debug設定檔")
  var time_settings = [1000,3000,1000,1000,800,200,1000,1000,60000,15000000];
}

var terminate = false // if true 就是已經終止研究
var show_prompt_already = false;
var jsPsych = initJsPsych({
  override_safe_mode:true,
  // show_progress_bar: true, // 需要progress bar嗎?
  on_finish: function() {
    var finish_data_json = jsPsych.data.get() // json
    form_submit(finish_data_json)
  },
});


// -----------------------------------------------------------------------------------------------------------

var timeline = [];
var invest_game_user_money = 1000; // default 1000
var invest_game_bot_money = 1000; // default 1000
var reward = 0;
var current_slider_value = 0;

var practice_times = 0;
var real_times = 0;
var invest_round = 0;
var emotion_level_round = 0;
const practice_face_img = ["img/練習圖片1.png", "img/練習圖片2.png"];
var emotion_face_img = ["img/練習圖片1.png", "img/練習圖片2.png", "img/生氣臉a.png", "img/生氣臉b.png", "img/快樂臉a.png", "img/快樂臉b.png"]



/**
 * 把emotion_face_img後面四項洗牌
 */
function shuffle_emotion_face_img(){
  // 取出後面四項
  var subArray = emotion_face_img.splice(2);

  // 使用 Fisher-Yates 演算法打亂
  for (let i = subArray.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [subArray[i], subArray[j]] = [subArray[j], subArray[i]];
  }

  // 合併回原來的 array
  emotion_face_img = emotion_face_img.concat(subArray)
}


/*預加載*/
var preload = {
  type: jsPsychPreload,
  images: ["img/練習圖片1.png", "img/練習圖片2.png", "img/生氣臉a.png", "img/生氣臉b.png", "img/快樂臉a.png", "img/快樂臉b.png"]
};


/** 
 * 練習階段
 * 畫面不動不被影響，3秒後跳脫 
 * **/
var practice_start = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "<h2>練習階段</h2>",
  choices: "NO_KEYS",
  trial_duration: time_settings[0],
  on_load:()=>{
    console.log("練習階段:")
  }
};


/** 
 * 真實階段
 * 畫面不動不被影響，3秒後跳脫 
 * **/
var real_start = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "<h2>正式階段</h2>",
  choices: "NO_KEYS",
  trial_duration: time_settings[0],
  on_load:()=>{
    console.log("正式開始:")
  }
};


/**
 * slider display update
 */
function updateSliderValue() {
  var slider = document.querySelector('input[type="range"]'); // 找到滑動條元素
  var display = document.getElementById('slider-value'); // 找到顯示數字的元素
  display.innerHTML = slider.value; // 初始顯示值

  
  slider.addEventListener('mousemove', function() { // 當滑動條被focus且滑鼠有移動到就會更新
    display.innerHTML = slider.value;
    current_slider_value = slider.value;
  });
  slider.addEventListener('click', function() { // 當滑動條被focus且滑鼠被release就會更新
    display.innerHTML = slider.value;
    current_slider_value = slider.value;
  });
}

/**
 * invest algorithm
 * init_value 決定了倍率的初始值，有錢算法就輸入0.6，變窮算法就輸入0.3
 * @params init_value->倍率的初始值
 * @params 會用到全域的current_slider_value: str
 * @params 會用到全域的invest_game_user_money:int invest_game_bot_money:int
 */
function invest_algo(init_value){
  invest_game_user_money = 1000; // default 1000
  invest_game_bot_money = 1000; // default 1000
  // 回歸預設1000
  function magnification(init_value){
    if (current_slider_value == 0) return 0;
    let step = Math.floor((current_slider_value) / 100);
    return init_value + step * 0.01;
  } 
  let times = magnification(init_value)

  invest_game_user_money -= current_slider_value
  invest_game_bot_money += current_slider_value*3

  reward = Math.round(times*current_slider_value*3)
  console.log('倍率為: ', times, ' 回饋金額: ', reward)
  invest_game_bot_money -= reward
  invest_game_user_money += reward
  console.log(invest_game_user_money,invest_game_bot_money,current_slider_value)
}

/**
 * rich algorithm 
 * 1到5 跟 11到16輪
 *     x3x(0.6~0.7)
 */
function invest_rich(){
  invest_algo(0.6) // 0.6開始計算到0.7
}

/**
 * poor algorithm 
 * 6到10輪 
 *     x3x(0.3到0.4)
 */
function invest_poor(){
  invest_algo(0.3) // 0.3開始計算到0.4
}

/**
 * 洗牌挑選快樂臉跟生氣臉
 */
function drawImages() {
  // 定義圖片檔案
  const angryFaces = ["img/生氣臉a.png", "img/生氣臉b.png"];
  const happyFaces = ["img/快樂臉a.png", "img/快樂臉b.png"];

  // 隨機抽取一張生氣臉圖片
  const randomAngryFace = angryFaces[Math.floor(Math.random() * angryFaces.length)];

  // 隨機抽取一張快樂臉圖片
  const randomHappyFace = happyFaces[Math.floor(Math.random() * happyFaces.length)];

  // 將兩張圖片加入到一個陣列並隨機排序
  const results = [randomAngryFace, randomHappyFace].sort(() => Math.random() - 0.5);

  return results; // 回傳抽取結果
}

/** 
 * 在console內顯示有無做出反應或是反應時間和投資金額
 * **/
function handle_invest_respond(data){
  
  if ((data.rt === null) && (current_slider_value == 0)) { // 沒有按下滑桿也沒有按下確定
    data.rt = "null"
    data.response = "null"
    data.timeout = true
    console.log('第' + invest_round + "輪未作出任何反應"+"，反應時間: " + data.rt + " ms");
  } 
  else if (data.rt === null){// 有按下滑桿但是沒有按下確定
    data.rt = 20000
    data.response = current_slider_value
    data.timeout = false
    console.log('第' + invest_round + '輪投資了$' + current_slider_value + '元'+ "有按下滑桿但是沒有按下確定"+"，反應時間: " + data.rt + " ms");
  }
  else { // 正常情況
    data.timeout = false
    console.log('第' + invest_round + '輪投資了$' + current_slider_value + '元'+"，反應時間: " + data.rt + " ms");
  }
}

/** 
 * 20 秒後自動結束
 * 練習遊戲畫面
 * 滑塊、顯示畫面、數字
 * **/
var invest_game_practice = {
  type: jsPsychHtmlSliderResponse,
  on_load: function() { 
    updateSliderValue(); // 更新滑動條顯示值
    current_slider_value = 0;
  },
  on_finish: function(data) { 
    handle_invest_respond(data)
  },
  stimulus:function() {
    practice_times++;
    return `<h1>您選擇投資多少錢？</h1> <img src="`+ practice_face_img[practice_times-1] + `" alt="如果您看見這段文字就代表您的瀏覽器不支援圖片顯示或是網速過慢，此問題請盡快聯繫實驗者" width="500"> <p>請移動滑桿選擇數值並點擊以完成投資確認</p>`;
  },
  require_movement: true,
  trial_duration: time_settings[1], // 20 秒後自動結束
  labels: ['$0', '$1000'],
  min: 0,
  max: 1000,
  slider_start: 500,
  button_label: '確定',
  prompt: '<p>投資金額: $<span id="slider-value">0</span></p>',
};


/** 
 * 20 秒後自動結束
 * 正式遊戲畫面
 * 滑塊、顯示畫面、數字
 * **/
var invest_game = {
  type: jsPsychHtmlSliderResponse,
  on_load: function() { 
    updateSliderValue(); // 更新滑動條顯示值
    current_slider_value = 0;
    invest_round++;
  },
  on_finish: function(data) { 
    handle_invest_respond(data)
    if (invest_round === 16) {
      pickImg.shift();
      console.log("在陣列中移除第一張照片，這應該只會發生一次")
    }
  },
  stimulus:function(){
    return `<h1>您選擇投資多少錢？</h1> <img src="`+ pickImg[0] + `" alt="如果您看見這段文字就代表您的瀏覽器不支援圖片顯示或是網速過慢，此問題請盡快聯繫實驗者" width="500"> <p>請移動滑桿選擇數值並點擊以完成投資確認</p> `;
  },
  trial_duration: time_settings[1], // 20 秒後自動結束
  require_movement: true,
  labels: ['$0', '$1000'],
  min: 0,
  max: 1000,
  slider_start: 500,
  button_label: '確定',
  prompt: '<p>投資金額: $<span id="slider-value">0</span></p>',
};


/**
 * 回饋畫面計算中...
 *  目前秒數是2秒
 */
var cauculating = {
  type: jsPsychHtmlKeyboardResponse, // 隨便找一個type 但是不給他choices就好
  choices: "NO_KEYS",
  stimulus: "回饋金額計算中...",
  trial_duration: time_settings[2]
};


function display_invest_money(){
  var reward_value = document.getElementById('reward_value'); // 找到顯示數字的元素
  var your_money = document.getElementById('your_money'); // 找到顯示數字的元素
  var his_money = document.getElementById('his_money'); // 找到顯示數字的元素
  reward_value.innerHTML = reward
  your_money.innerHTML = invest_game_user_money
  his_money.innerHTML = invest_game_bot_money
}


/**
 * 
 * 練習練習練習練習
 * 輸出最後大家剩多少錢
 * 目前秒數是5秒
 */
var invest_practice_results = {
  type: jsPsychHtmlKeyboardResponse, // 隨便找一個type 但是不給他choices就好
  choices: "NO_KEYS",
  stimulus: `<h2>以下以💰替代，正式遊戲會顯示實際數值</h2><p>夥伴回饋給您：<span id="reward_value">💰💰💰</span></p><p>您的金額：<span id="your_money">💰💰💰</span></p><p>他的金額：<span id="his_money">💰💰💰</span></p>`,
  trial_duration: time_settings[3]
};


/**
 * 
 * 有錢有錢有錢有錢
 * 輸出最後大家剩多少錢
 * 目前秒數是5秒
 */
var invest_rich_results = {
  type: jsPsychHtmlKeyboardResponse, // 隨便找一個type 但是不給他choices就好
  on_load: function() { 

    invest_rich() // 變有錢算法
    display_invest_money()
  },
  choices: "NO_KEYS",
  stimulus: '<p>夥伴回饋給您：<span id="reward_value">0</span></p><p>您的金額：<span id="your_money">0</span></p><p>他的金額：<span id="his_money">0</span></p>',
  trial_duration: time_settings[3]
};


/**
 * 變窮變窮變窮變窮
 * 輸出最後大家剩多少錢
 * 目前秒數是5秒
 */
var invest_poor_results = {
  type: jsPsychHtmlKeyboardResponse, // 隨便找一個type 但是不給他choices就好
  on_load: function() { 
    invest_poor() // 虧錢算法
    display_invest_money()
  },
  choices: "NO_KEYS",
  stimulus: '<p>夥伴回饋給您：<span id="reward_value">0</span></p><p>您的金額：<span id="your_money">0</span></p><p>他的金額：<span id="his_money">0</span></p>',
  trial_duration: time_settings[3]
};


/**
 * 專注點0.8秒
 */
var focus_point_800 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="font-size:60px;">+</div>',
  choices: "NO_KEYS",
  trial_duration: time_settings[4]
};


/**
 * 專注點0.2秒
 */
var focus_point_200 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="font-size:60px;">+</div>',
  choices: "NO_KEYS",
  trial_duration: time_settings[5]
};


/**
 * 下一位夥伴提示語
 * 目前是5秒
 */
var next_partner = {
  type: jsPsychHtmlKeyboardResponse, // 隨便找一個type 但是不給他choices就好
  choices: "NO_KEYS",
  stimulus: "<h2>與下一位遊戲夥伴的投資遊戲即將開始！</h2>",
  trial_duration: time_settings[6]
};


/**
 * 練習->正式
 */
var invest_game_ready_real_game = {
  type: jsPsychInstructions,
  pages: [
      "<h2>準備好進入遊戲，請按【開始】</h2>",
  ],
  show_clickable_nav: true,
  allow_backward: false,
  button_label_previous: '上一步',
  button_label_next: '開始'
}


/**
 * 感謝您完成投資遊戲作業。接下來，您將進行最後一項作業－情緒評級作業。
 */
var invest_done = {
  type: jsPsychInstructions,
  pages: [
  `
  <h3>感謝您完成投資遊戲作業。</h3>
  <h3>接下來，您將進行最後一項作業－情緒評級作業。請注意，為了確保研究的有效性，我們希望您能一次性完成所有試驗，並盡量避免中斷。</h3>
  <h3>整個過程預計需要約 5分鐘。</h3>

  <h3>在進行過程中，請根據畫面上的指示進行操作。若您感到不適或有任何問題，您可以隨時選擇中止實驗。</h3>
  <h3>只需點擊出現在不同階段界面上的「中止實驗」按鈕，或直接關閉網頁（按下「x」），我們會尊重您的選擇。</h3>
  <h3>謝謝您的參與，請準備好開始！</h3>
  `
  ],
  show_clickable_nav: true,
  allow_backward: false,
  button_label_previous: '上一步',
  button_label_next: '下一步'
}


/**
 * 情緒評級作業指導語	內定超過60秒參與者未按「下一步」直接跳下一頁
 * 接下來將於螢幕上看見臉孔表情圖片，一次一張，您的任務是評估每張臉孔表情圖片
 */
var emotion_guide = {
  type: jsPsychInstructions,
  pages: [
`
<h3>接下來將於螢幕上看見臉孔表情圖片，一次一張</h3>
<h3>您的任務是評估每張臉孔表情圖片</h3>
<h3>「正面或負面程度如何?」、「讓您感到威脅的程度如何?」與「您信任他/她的程度如何？」。</h3>

`],
  trial_duration: time_settings[7],
  show_clickable_nav: true,
  allow_backward: false,
  button_label_previous: '上一步',
  button_label_next: '下一步'
}


/**
 * 準備好時，請按【開始】
 */
var emotion_start = {
  type: jsPsychInstructions,
  pages: [
`
<h3>準備好時，請按【開始】</h3>
`,
  ],
  show_clickable_nav: true,
  allow_backward: false,
  button_label_previous: '上一步',
  button_label_next: '開始'
}


/** 
 * slider滑塊 -4 到 4 
 * 這個表情的正面或負面程度如何？
 * **/
var negative_positive_level = {
  type: jsPsychHtmlSliderResponse,
  data: { varname: 'V' },
  on_load: function() { 
    updateSliderValue(); // 更新滑動條顯示值
  },
  stimulus:function(){
    return `<h1>這個表情的正面或負面程度如何？</h1> <img src="`+ emotion_face_img[emotion_level_round] + `" alt="如果您看見這段文字就代表您的瀏覽器不支援圖片顯示或是網速過慢，此問題請盡快聯繫實驗者" width="500"> `;
  },
  labels: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
  min: -4,
  max: 4,
  slider_start: 0,
  button_label: '下一步',
  require_movement: true,
  prompt: '<p>當前值: <span id="slider-value">0</span></p>',
}


/** 
 * slider滑塊 0 到 9 
 * 這個表情讓您感到威脅的程度如何？
 * **/
var feel_threat_level = {
  type: jsPsychHtmlSliderResponse,
  data: { varname: 'Threat' },
  on_load: function() { 
    updateSliderValue(); // 更新滑動條顯示值
  },
  stimulus:function(){
    return `<h1>這個表情讓您感到威脅的程度如何？</h1> <img src="`+ emotion_face_img[emotion_level_round] + `" alt="如果您看見這段文字就代表您的瀏覽器不支援圖片顯示或是網速過慢，此問題請盡快聯繫實驗者" width="500"> `;
  },
  labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  min: 0,
  max: 9,
  slider_start: 5,
  button_label: '下一步',
  require_movement: true,
  prompt: '<p>當前值: <span id="slider-value">0</span></p>',
}


/** 
 * slider滑塊 0 到 9 
 * 您信任他/她的程度如何？
 * **/
var trust_level = {
  type: jsPsychHtmlSliderResponse,
  data: { varname: 'Trust' },
  on_load: function() { 
    updateSliderValue(); // 更新滑動條顯示值
  },
  on_finish:function(){
    emotion_level_round++;
  },
  stimulus:function(){
    return `<h1>您信任他/她的程度如何？</h1> <img src="`+ emotion_face_img[emotion_level_round] + `" alt="如果您看見這段文字就代表您的瀏覽器不支援圖片顯示或是網速過慢，此問題請盡快聯繫實驗者" width="500"> `;
  },
  labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  min: 0,
  max: 9,
  slider_start: 5,
  button_label: '下一步',
  require_movement: true,
  prompt: '<p>當前值: <span id="slider-value">0</span></p>',
}


/** 
 * 您認為您的遊戲夥伴是一名真實的人類玩家嗎？（請選擇最符合您感受的選項）
 * **/
var trust_robot_survey = {
  type: jsPsychSurveyLikert,
  questions: [
    {
      prompt: '<h2>請評估您對於信任遊戲中的遊戲夥伴（對方玩家）是否為真實人類的相信程度。您認為您的遊戲夥伴是一名真實的人類玩家嗎？（請選擇最符合您感受的選項）</h2>',
      labels: ["完全是人類", "大部分是人類", "不確定", "大部分是電腦", "完全是電腦"],
      required: true
    }
  ],
  button_label: "確定>>"
};


/** 
 * 全部實驗結束
 * **/
var all_exp_done = {
  type: jsPsychInstructions,
  pages: [
  `<h2>感謝您完成實驗作業！接下來，請閱讀研究後的知情同意書與回饋資訊。若您同意本研究使用您的數據，請勾選『同意』。再次感謝您的參與！</h2>`
  ],
  show_clickable_nav: true,
  allow_backward: false,
  button_label_previous: '上一步',
  button_label_next: '下一步'
}

/**
 * ===================================================QUEUE=ITEM=========================================================
 */

/** 
 * 練習練習練習練習練習練習
 * 投資遊戲 練習2輪
 */
var invest_game_practice_queue = {
  timeline: [focus_point_800, invest_game_practice, cauculating, invest_practice_results],
  repetitions: 2,
};

/**
 * 💰💰💰💰
 * 正式正式正式正式正式正式
 * 投資實驗 part1、2 第1到5輪
 * 💵💵💵💵
 */
var invest_game_queue_rich_1_5 = {
  timeline: [focus_point_800, invest_game, cauculating, invest_rich_results],
  repetitions: 5,
};

/**
 * 🥲🥲🥲🥲
 * 正式正式正式正式正式正式
 * 投資實驗 part1、2 第6到10輪
 * 👎👎👎👎
 */
var invest_game_queue_poor_6_10 = {
  timeline: [focus_point_800, invest_game, cauculating, invest_poor_results],
  repetitions: 5,
};
/**
 * 💰💰💰💰
 * 正式正式正式正式正式正式
 * 投資實驗 part1、2 第11到16輪
 * 💵💵💵💵
 */
var invest_game_queue_rich_11_15 = {
  timeline: [focus_point_800, invest_game, cauculating, invest_rich_results],
  repetitions: 5,
};

/**
 * 💰💰💰💰
 * 正式正式正式正式正式正式
 * 投資實驗 part1、2 第16輪
 * 💵💵💵💵
 */
var invest_game_queue_rich_16 = {
  timeline: [focus_point_800, invest_game, cauculating, invest_rich_results],
  repetitions: 1,
};

/**
 * 練習練習練習練習練習練習
 * 情緒評估實驗
 */
var emotion_level_practice_queue = {
  timeline: [focus_point_200, negative_positive_level, feel_threat_level, trust_level],
  repetitions: 2,
}

/**
 * 正式正式正式正式正式正式
 * 情緒評估實驗
 */
var emotion_level_queue = {
  timeline: [focus_point_200, negative_positive_level, feel_threat_level, trust_level],
  repetitions: 4,
}


//=========================================================main=========================================================
//===================================================QUEUES=TIMELINE====================================================

// 使用抽取功能抽出實驗一的圖片
var pickImg = drawImages();
var pickImg_backup = [...pickImg]
console.log("抽取的圖片順序：", pickImg);
shuffle_emotion_face_img()
console.log("emotion_face抽取的圖片順序：", emotion_face_img);
// preload資源
timeline.push(preload);


/**
 * ==========第一部分：投資遊戲==========
 */

// 剛開始進去歡迎畫面
timeline.push(practice_start);

// 練習兩次投資
timeline.push(invest_game_practice_queue);

// 準備就緒
timeline.push(focus_point_800);
timeline.push(invest_game_ready_real_game);

// 正式投資遊戲開始提示語
timeline.push(real_start)

// 正式第一part投資
timeline.push(invest_game_queue_rich_1_5);
timeline.push(invest_game_queue_poor_6_10);
timeline.push(invest_game_queue_rich_11_15);
timeline.push(invest_game_queue_rich_16);

// 第一張圖片會自動被踢掉
timeline.push(next_partner);

// 正式第二part投資
timeline.push(invest_game_queue_rich_1_5);
timeline.push(invest_game_queue_poor_6_10);
timeline.push(invest_game_queue_rich_11_15);
timeline.push(invest_game_queue_rich_16);

// 感謝您完成投資遊戲作業。投資遊戲結束
timeline.push(invest_done);



/**
 * ==========第二部分：情緒評估==========
 */

// 情緒評估說明
timeline.push(emotion_guide)

// 情緒評估開始按鈕
timeline.push(emotion_start)

// 練習情緒評估開始提示語
timeline.push(practice_start)

// 練習兩次情緒評估
timeline.push(emotion_level_practice_queue);

// 正式情緒評估開始提示語
timeline.push(real_start)

// 正式四次情緒評估
timeline.push(emotion_level_queue);

//信任機器人遊戲夥伴
timeline.push(focus_point_800);
timeline.push(trust_robot_survey);

//結束
timeline.push(all_exp_done);

// run
jsPsych.run(timeline);


// ==============================懸浮視窗定時器=====================================
let timeout_pause_5min; // idle
let timeout_terminate_5min; // force stop

// ================idle========================
function startTimer_idle() {
  timeout_pause_5min = setTimeout(() => {
    console.log("實驗暫停")
    jsPsych.pauseExperiment();
    showPrompt();
  }, time_settings[8]); // 先五分鐘
}

function resetTimer_idle() {
  clearTimer_idle();
  startTimer_idle();
}

function clearTimer_idle() {
  clearTimeout(timeout_pause_5min);
}

// ================terminate===================
function startTimer_terminate() {
  timeout_terminate_5min = setTimeout(() => {
    // closePrompt() //bug fix 不小心調用了兩次closePrompt 請引以為戒
    terminateResearch(true)
  }, time_settings[9]); // 10分鐘
}

function resetTimer_terminate() {
  clearTimer_terminate();
  startTimer_terminate();
}

function clearTimer_terminate() {
  clearTimeout(timeout_terminate_5min);
}

// ==============================懸浮視窗=====================================
function showPrompt() {
  show_prompt_already = true
  const overlay = document.createElement('div');
  overlay.id = 'overlay';
  overlay.style.display = 'block';

  const prompt = document.createElement('div');
  prompt.id = 'timeoutPrompt';
  prompt.style.display = 'block';
  prompt.innerHTML = `
    <p>您還在螢幕前嗎？提醒您的畫面已停滯許久，5分鐘後若未能繼續進行，將會終止此研究！
    請點擊下方按鈕繼續進行研究，謝謝！↓</p>
    <p>再次感謝您的參與！如果需要任何幫助，請聯絡我們：<br>
    聯絡人/主試者：廖彗君<br>
    email：<adress><a href="mailto:trauma.cycu.psych@gmail.com">trauma.cycu.psych@gmail.com</a></adress><br>
    指導教授：洪福建</p>
    <p>此外，您也可以點擊以下【回饋表單】填寫您的意見（可匿名或選填聯絡資訊），或直接透過上述聯絡方式與我們聯繫。如您在參與過程中感到情緒不適並感到需要支持，我們已準備了相關資源資訊，您可以視需求下載或隨時聯繫我們。</p>
    <button id="terminateResearch">我希望終止研究</button>
    <button id="feedbackForm">回饋表單</button>
    <button id="downloadResources">下載心理衛教單</button>
    <button id="return">返回</button>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(prompt);

  // 按鈕事件綁定
  document.getElementById('terminateResearch').addEventListener('click', ()=>{terminateResearch(false)});
  document.getElementById('feedbackForm').addEventListener('click', () => {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSfSK85PjVf8gPqx-17YZu935HX9TzyoB71CbzegUuonasJPow/viewform', '_blank'); 
  });
  document.getElementById('downloadResources').addEventListener('click', () => {
    window.open('../pdf_file/心理衛教單.pdf', '_blank'); 
  });
  document.getElementById('return').addEventListener('click', () => {
    closePrompt();
  });


}

// 關閉提示框
function closePrompt() {
  show_prompt_already = false
  document.body.removeChild(document.getElementById('overlay'));
  document.body.removeChild(document.getElementById('timeoutPrompt'));
  console.log("實驗恢復")
  jsPsych.resumeExperiment()
}

//=======================================終止研究邏輯====================================================
/**
 * 
 * @param { bool true強迫結束 或是 false開對話結束
 * } force 
 * 
 * endExperiment後要resumeExperiment才會出現結束文字，否則會是一片空白
 * 調用pause會在當前trail結束後生效，意味著實驗畫面後會多出一個暫停畫面，暫停畫面是空白的
 * 直到resume後才會再繼續讀下一個trial進來 注意是trail 不是timeline
 * jspsych永遠不會覆蓋body上的overlay element
 */
function terminateResearch(force) {
  function doterminate(){
    terminate = true
    console.log("實驗結束")
    

    jsPsych.endExperiment(`
      <p>我們尊重您的選擇，您的感受對我們非常重要！感謝您之前的參與！<br>已結束實驗，請直接關閉此網頁即可</p>
      <p>再次感謝您的參與！如果需要任何幫助，請聯絡我們：</p>
      <div class="notice-box">聯絡人/主試者：廖彗君<br>
      email：<adress><a href="mailto:trauma.cycu.psych@gmail.com">trauma.cycu.psych@gmail.com</a></adress><br>
      指導教授：洪福建</div>
      <p>此外，您也可以點擊以下【回饋表單】填寫您的意見（可匿名或選填聯絡資訊），或直接透過上述聯絡方式與我們聯繫。</p>
      <p>如您在參與過程中感到情緒不適並感到需要支持，我們已準備了相關資源資訊，您可以視需求下載或隨時聯繫我們。</p>
      <div class="button-container">
      <a href='../pdf_file/心理衛教單.pdf' target="_blank" class="stop-button">回饋表單</a>
      <a href='https://docs.google.com/forms/d/e/1FAIpQLSfSK85PjVf8gPqx-17YZu935HX9TzyoB71CbzegUuonasJPow/viewform' target="_blank" class="stop-button">下載心理衛教單</a>
      </div>
      `);
      closePrompt() // 會先remove overlay然後resume exp
  }
  
  if (force) {
    doterminate()
  }
  else if (confirm('確定要終止實驗?如果有意願下載心理衛教單或填寫回饋表單，請於關閉前完成。')) { // force == false
    doterminate()
  }
  clearTimer_idle()
  clearTimer_terminate()
}

//=======================================監聽整個文件的點擊事件====================================================
window.onload = () => {
  startTimer_idle()
  startTimer_terminate()
  document.addEventListener("click", () => {
    if (!terminate && !show_prompt_already){
      resetTimer_idle()
      resetTimer_terminate()
    }
  });
};

//=======================================交給父視窗====================================================
// 實際提交給父視窗
function form_submit(upload_data){
  // console.log('Survey Results:', results);
  upload_data.timestamp = tag_time()
  upload_data.drawpart1 = pickImg_backup
  upload_data.drawpart2 = emotion_face_img
  upload_to_parent_window(upload_data) // call api
}

// 產生時間戳章
function tag_time(){
var currentTime = new Date();
var formattedTime = currentTime.getFullYear() + '/' + 
                   (currentTime.getMonth() + 1) + '/' + 
                   currentTime.getDate() + ' ' + 
                   currentTime.getHours() + ':' + 
                   (currentTime.getMinutes().toString().padStart(2, '0'));
return formattedTime
}

// POST到父視窗邏輯 
function upload_to_parent_window(to_parent_payload){
  window.parent.postMessage(
      {
          action: "sendData",
          payload: to_parent_payload
      },
      '*'
  );
}
