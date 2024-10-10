/*init*/
console.log("尚未付費，僅供預覽，請勿盜用")


function upload_to_gs(roundDurations){
  // 將資料發送到 Google Sheets
  fetch('https://script.google.com/macros/s/AKfycbwt8yHSXka_UP8xASIXki8c99X70yJGAN-yGzBtiQ8PL4q07fGL2mRALgSuO_EPuUDtWg/exec', {
    redirect: "follow",
    method: 'POST',
    body: JSON.stringify(roundDurations), // 將資料轉換成 JSON 格式
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}

var jsPsych = initJsPsych({
  // timeline: timeline,
  // show_progress_bar: true, // 需要progress bar嗎?
  on_finish: function() {
    jsPsych.data.displayData('csv');
    // jsPsychSheet.uploadData(jsPsych.data.get().csv());
    var finish_data_json = jsPsych.data.get() // json
    var finish_data_csv  = jsPsych.data.get().csv() // json
    console.log(finish_data_csv);
    var timeElapsedData = finish_data_json.select('time_elapsed').values; // 提取 time_elapsed 欄位
    // 創建一個新的陣列，來存儲每個回合所花費的時間
    let roundDurations = [];

    // 計算每個回合的持續時間
    for (let i = 1; i < timeElapsedData.length; i++) {
        let duration = timeElapsedData[i] - timeElapsedData[i - 1];  // 當前時間點 - 上一個時間點
        roundDurations.push(duration);
    }

    // 顯示每個回合所花費的時間
    console.log(roundDurations);
    upload_to_gs(roundDurations)
  },
});

var timeline = [];
var invest_game_user_money = 1000; // default 1000
var invest_game_bot_money = 1000; // default 1000
var current_slider_value = 0;
var reward = 0;

/*預加載*/
var preload = {
  type: jsPsychPreload,
  images: ['img/test.jpg']
};


/**
 * timeline next element
 */
function nextTrial() {
  jsPsych.finishTrial(); // End current trial
}



/*歡迎畫面 */
var welcome = {
  type: jsPsychHtmlKeyboardResponse, // 隨便找一個type 但是不給他choices就好
  choices: "NO_KEYS",
  stimulus: '<h2><p>此為預覽版本<\p><\h2> <p>本實驗不會使用到鍵盤，請使用滑鼠點擊任意地方繼續<\p>請使用電腦施測，不要使用手機',
  on_load: function() {
    document.body.addEventListener('click', nextTrial);
  },
  on_finish: function() {
      document.body.removeEventListener('click', nextTrial);
  }
};





/** 
 * 給他選的方案1
 * 
 * 
 * 
 * 
 * **/
var ques = {
  type: jsPsychHtmlKeyboardResponse, // 隨便找一個type 但是不給他choices就好
  choices: "NO_KEYS",
  stimulus: "(方案1)實驗一的說明 測試測試1234 滑鼠按一下就是下一步",
  on_load: function() {
    document.body.addEventListener('click', nextTrial);
  },
  on_finish: function() {
      document.body.removeEventListener('click', nextTrial);
  }
};




/** 
 * 給他選的方案2
 * 
 * 
 * 
 * 
 * **/
var ques_2 = {
  type: jsPsychInstructions,
  pages: [
      "(方案2)實驗一的說明 測試測試1234 單按滑鼠不會有任何反應，一定要按下一步",
  ],
  show_clickable_nav: true,
  allow_backward: false,
  button_label_previous: '上一步',
  button_label_next: '下一步'
}




/**
 * 
 * 
 * 
 * slider display update
 * 
 * 
 * 
 * 
 */
function updateSliderValue() {
  var slider = document.querySelector('input[type="range"]'); // 找到滑動條元素
  var display = document.getElementById('slider-value'); // 找到顯示數字的元素
  display.innerHTML = slider.value; // 初始顯示值

  // 當滑動條變動時，更新顯示的數字
  slider.addEventListener('click', function() {
    display.innerHTML = slider.value;
    current_slider_value = slider.value;
  });
}



/** 
 * slider滑塊 咖哩咖離 -4 ~ 4
 * 
 * 
 * 
 * 
 * **/
var ranking_template1 = {
  type: jsPsychHtmlSliderResponse,
  data: { varname: 'rank1_temp' },
  on_load: function() { 
    updateSliderValue(); // 更新滑動條顯示值
  },
  stimulus: '(part2-1)這個拉條是給第二部分用的', // 用來顯示數字
  labels: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
  min: -4,
  max: 4,
  slider_start: 0,
  button_label: '下一步',
  require_movement: true,
  prompt: '<p>當前值: <span id="slider-value">0</span></p>',
}





/** 
 * slider滑塊 咖哩咖離 0 ~ 8
 * 
 * 
 * 
 * 
 * **/
var ranking_template2 = {
  type: jsPsychHtmlSliderResponse,
  data: { varname: 'rank2_temp' },
  on_load: function() { 
    updateSliderValue(); // 更新滑動條顯示值
  },
  stimulus: '(part2-2)這個拉條是給第二部分用的', // 用來顯示數字
  labels: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  min: 0,
  max: 8,
  slider_start: 4,
  button_label: '下一步',
  require_movement: true,
  prompt: '<p>當前值: <span id="slider-value">0</span></p>',
}




/**
 * 1~5 跟 11~15輪
 *     x3x(0.65~0.8)
 * let randomValue = Math.random() * (0.8 - 0.65) + 0.65;
 * console.log(randomValue);
 * 
 * 
 */
function invest_rich(){
  let randomValue = Math.random() * (0.8 - 0.65) + 0.65;
  console.log('倍率為' + randomValue)

  invest_game_user_money -= current_slider_value
  invest_game_bot_money += current_slider_value*3

  reward = Math.round(randomValue*invest_game_bot_money)

  invest_game_bot_money -= reward
  invest_game_user_money += reward
}



/**
 * 6~10輪 
 *     x3x(0~0.35)
 * let randomValue = Math.random() * (0.35 - 0) + 0;
 * console.log(randomValue);
 * 
 * 
 */
function invest_poor(){
  let randomValue = Math.random() * (0.35 - 0) + 0;
  console.log('倍率為' + randomValue)

  invest_game_user_money -= current_slider_value
  invest_game_bot_money += current_slider_value*3

  reward = Math.round(randomValue*invest_game_bot_money)

  invest_game_bot_money -= reward
  invest_game_user_money += reward
}



/*投資遊戲歡迎畫面 */
var invest_game_ready = {
  type: jsPsychHtmlKeyboardResponse, // 隨便找一個type 但是不給他choices就好
  choices: "NO_KEYS",
  stimulus: "投資遊戲練習開始 請將滑鼠任意點擊一下",
  on_load: function() {
    document.body.addEventListener('click', nextTrial);
  },
  on_finish: function() {
      document.body.removeEventListener('click', nextTrial);
  }
};




/**
 * 
 * listen 滑快按鈕 輸出錢錢
 * 
 * } 
 */
function handleClick(event) {
  if (event.target && event.target.id === 'jspsych-html-slider-response-next') {
      console.log('這輪投資了$' + current_slider_value + '錢錢')
      document.removeEventListener("click", handleClick);  // 移除listener
  }
}

/** 
 * invest_game
 * 
 * 
 * 
 * 
 * **/
var invest_game = {
  type: jsPsychHtmlSliderResponse,
  on_load: function() { 
    updateSliderValue(); // 更新滑動條顯示值
    document.addEventListener("click", handleClick);
  },
  stimulus: '<style>img{height: 40vh; width: auto;}</style><h1><p>您選擇投資多少錢？<\p><\h1> <img src="img/test.jpg" alt="描述圖片的文字" width="500"> ',
  require_movement: true,
  labels: ['$0 不想投資他', '$1000 all in'],
  min: 0,
  max: 1000,
  slider_start: 500,
  button_label: '下一輪',
  prompt: '<p>投資金額: $<span id="slider-value">0</span></p>',
};




/**
 * 
 * 
 * 回饋畫面計算中...
 *  目前秒數是250ms
 */
var cauculating = {
  type: jsPsychHtmlKeyboardResponse, // 隨便找一個type 但是不給他choices就好
  choices: "NO_KEYS",
  stimulus: "回饋金額計算中...",
  trial_duration: 250
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
 * 有錢有錢有錢有錢
 * 輸出最後大家剩多少錢
 * 
 */
var invest_rich_results = {
  type: jsPsychHtmlKeyboardResponse, // 隨便找一個type 但是不給他choices就好
  on_load: function() { 
    invest_rich() // 變有錢算法
    display_invest_money()
  },
  choices: "NO_KEYS",
  stimulus: '<p>夥伴回饋給您：<span id="reward_value">0</span><\p><p><\p><p><\p><p><\p><p>您的金額：<span id="your_money">0</span><\p><p>他的金額：<span id="his_money">0</span><\p>',
  trial_duration: 2000
};

/**
 * 
 * 瓊瓊瓊瓊瓊瓊
 * 輸出最後大家剩多少錢
 * 
 */
var invest_poor_results = {
  type: jsPsychHtmlKeyboardResponse, // 隨便找一個type 但是不給他choices就好
  on_load: function() { 
    invest_poor() // 虧錢算法
    display_invest_money()
  },
  choices: "NO_KEYS",
  stimulus: '<p>夥伴回饋給您：<span id="reward_value">0</span><\p><p><\p><p><\p><p><\p><p>您的金額：<span id="your_money">0</span><\p><p>他的金額：<span id="his_money">0</span><\p>',
  trial_duration: 2000
};


/**
 * 專注點
 * 目前是亂數250ms
 */
var game_set = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="font-size:60px;">+</div>',
  choices: "NO_KEYS",
  trial_duration: function(){
    return jsPsych.randomization.sampleWithoutReplacement([250], 1)[0];
  }
};



/** 
 * 
 * 
 * part1_loop
 * 
 */
var part1_loop_rich = {
  timeline: [game_set, invest_game, cauculating, invest_rich_results],
  repetitions: 5,
};

var part1_loop_poor = {
  timeline: [game_set, invest_game, cauculating, invest_poor_results],
  repetitions: 5,
};



/**
 * define debrief
 * 
 * 這段是實驗執行完成後，會先呈現一些簡單的結果數據給受試者看
 * 
 * trials: 把被標記為 response 的 task 資料給撈出來
 * correct_trials: 把作答是正確的 trials 資料給撈出來
 * accuracy: 計算受試者在實驗中的整體作答平均正確率
 * rt: 計算受試者在實驗中的整體作答平均反應時間
 */
var debrief_block = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function() {

    var trials = jsPsych.data.get().filter({task: 'response'});
    var correct_trials = trials.filter({correct: true});
    var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
    var rt = Math.round(correct_trials.select('rt').mean());

    return `<p>You responded correctly on ${accuracy}% of the trials.</p>
      <p>Your average response time was ${rt}ms.</p>
      <p>Press any key to complete the experiment. Thank you!</p>`;

  }
};


/*結束畫面 */
var end = {
  type: jsPsychHtmlKeyboardResponse, // 隨便找一個type 但是不給他choices就好
  choices: "NO_KEYS",
  stimulus: "<p>結束了，謝謝你的作答<\p>此為預覽版本",
  on_load: function() {
    document.body.addEventListener('click', nextTrial);
  },
  on_finish: function() {
      document.body.removeEventListener('click', nextTrial);
  }
};



/**
 * QUEUE
 */
timeline.push(preload);
timeline.push(welcome);
//timeline.push(ques);
//timeline.push(ques_2);
//timeline.push(ranking_template1);
//timeline.push(ranking_template2);
timeline.push(invest_game_ready);
timeline.push(part1_loop_rich);
timeline.push(part1_loop_poor);
// timeline.push(part1_loop_rich);
timeline.push(end);

jsPsych.run(timeline);