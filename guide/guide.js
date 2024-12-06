const dialog_box = document.getElementById('dialog-box');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const btnContainer = document.getElementById('button-container');
const quizContainer =  document.getElementById('quizFrame');

var option_choose = 0;
const min_index = 1;
const max_index = 5;
let currentStep = 1;
var temp_payload = {};
const radioButtons = document.querySelectorAll('input[name="participation"]');
var timeout_60;

function hide_buttons(){
  /*
  保留元素長寬高 按鈕不作用
  const btnContainer = document.getElementById('button-container');
  const leftBtn = document.getElementById('left-btn');
  const rightBtn = document.getElementById('right-btn');
  */
  btnContainer.classList.add('fade-out');
  leftBtn.disabled = true;
  rightBtn.disabled = true;
}

function show_buttons(){
  /*
  const btnContainer = document.getElementById('button-container');
  const leftBtn = document.getElementById('left-btn');
  const rightBtn = document.getElementById('right-btn');
  */
  btnContainer.classList.remove('fade-out');
  leftBtn.disabled = false;
  rightBtn.disabled = false;
}

function hide_dialog(){
  dialog_box.classList.add('fade-out');
}

function show_dialog(){
  dialog_box.classList.remove('fade-out');
}

function doloop(){
  // console.log(currentStep)
  hide_buttons();
  hide_dialog();
  if (currentStep === 2) {
    setTimeout(() => {
      dialog_box.innerHTML = `
      <h2>作業階段不會使用到鍵盤，請使用觸控板或滑鼠點擊任意地方繼續請使用電腦施測，不要使用手機</h2>

      
      <div class="animation_container">
      <!-- 滑鼠動畫 -->
      <div class="mouse-area">
        <div class="mouse">
          <div class="scroll-wheel"></div>
        </div>
        <div class="finger mouse-finger"></div>
      </div>
    
      <!-- 觸控板動畫 -->
      <div class="trackpad-area">
        <div class="laptop">
          <div class="trackpad"></div>
        </div>
        <div class="finger trackpad-finger"></div>
      </div>
    </div>`;
      show_buttons();
      show_dialog();
    },500)
  } 
  else if (currentStep === 3) { // 答題頁面
    dialog_box.classList.add('fade-out');// hide dialog
    setTimeout(() => {
      dialog_box.innerHTML = `` // hide dialog
      quizContainer.classList.remove('fade-out'); // show quiz
    },500)
  }
  else if (currentStep === 4) {
    dialog_box.innerHTML = `<h1>投資遊戲</h1>`
    dialog_box.classList.remove('fade-out');
    quizContainer.classList.add('fade-out');
    show_buttons();

    setTimeout(() => {
      quizContainer.classList.add('hide');
    },500)
  }
  else if (currentStep === 5) {
    setTimeout(() => {
      dialog_box.innerHTML = `<h2>接下來，您將與電腦上的遊戲夥伴進行一項投資
      遊戲您的任務是決定要投資夥伴0~1000元間的任意金額</h2>
    
      <h2>（遊戲規則後續會再次說明與可以選擇重新觀看，請您放心繼續進行）</h2>`
      show_buttons();
      show_dialog();
    },500)
  }
  else if (currentStep === 6) {
    setTimeout(() => {
      dialog_box.innerHTML = `<h2>遊戲開始時，您將於螢幕上看見遊戲夥伴的頭像。
      每一輪投資前，您和您的夥伴每人將會各獲得1000元的投資基金，您可以選擇投資任何金額給遊戲夥伴。</h2>`
      show_buttons();
      show_dialog();
    },500)
  }
  else if (currentStep === 7) {
    setTimeout(() => {
      dialog_box.innerHTML = `<h2>一旦投資，金額將會增加三倍（例如：投資5元將變成遊戲夥伴收到15元）。</h2>`
      show_buttons();
      show_dialog();
    },500)
  }
  else if (currentStep === 8) {
    setTimeout(() => {
      dialog_box.innerHTML = `<h2>隨後，遊戲夥伴可以將任何金額回饋給您。如此ㄧ來，您和您的遊戲夥伴將有機會合力獲得投資基金額外的獲利。每次投資您會立即看見遊戲夥伴的回饋金額，您可以決定用它來調整下一輪的投資。</h2>`
      show_buttons();
      show_dialog();
    },500)
  }
  else if (currentStep === 9) {
    setTimeout(() => {
      dialog_box.innerHTML = `<h2>投資開始前，請您先輸入三個欲投資金額：（此輪金額不影響後續投資，請您不要停留過久考慮！）</h2>
        <div class="investment-container">
          <div class="investment-item">
            <label for="investment1">投資一金額:</label>
            <input type="range" id="investment1" min="0" max="1000" value="100">
            <span id="investment1-value">100</span>元
          </div>

          <div class="investment-item">
            <label for="investment2">投資二金額:</label>
            <input type="range" id="investment2" min="0" max="1000" value="100">
            <span id="investment2-value">100</span>元
          </div>

          <div class="investment-item">
            <label for="investment3">投資三金額:</label>
            <input type="range" id="investment3" min="0" max="1000" value="100">
            <span id="investment3-value">100</span>元
          </div>
        </div>`

        show_buttons();
        show_dialog();
        const investment1 = document.getElementById('investment1');
        const investment2 = document.getElementById('investment2');
        const investment3 = document.getElementById('investment3');
    
        const investment1Value = document.getElementById('investment1-value');
        const investment2Value = document.getElementById('investment2-value');
        const investment3Value = document.getElementById('investment3-value');
    
        const confirmButton = document.getElementById('confirm-button');
    
        investment1.addEventListener('input', () => {
          investment1Value.textContent = investment1.value;
        });
    
        investment2.addEventListener('input', () => {
          investment2Value.textContent = investment2.value;
        });
    
        investment3.addEventListener('input', () => {
          investment3Value.textContent = investment3.value;
        });
    
      },500)
  }
  else if (currentStep === 10) {
    quizContainer.disabled = true;
    // yield results
    const investment1Amount = parseInt(investment1.value);
    const investment2Amount = parseInt(investment2.value);
    const investment3Amount = parseInt(investment3.value);
    temp_payload.inv1 = investment1Amount;
    temp_payload.inv2 = investment2Amount;
    temp_payload.inv3 = investment3Amount;
    console.log('投資一', investment1Amount);
    console.log('投資二', investment2Amount);
    console.log('投資三', investment3Amount);
    // yield results end

    setTimeout(() => {
      dialog_box.innerHTML = `
      <h2>基本遊戲規則說明<br>*這裡以10元投資基金示例</h2>
      <div class="images-container">
        <div class="image-item">
          <img src="1.png" alt="Image 1">
          <div class="image-caption">每一輪投資前，您和您的夥伴每人將會各獲得 1000 元的投資基金。</div>
        </div>
        <div class="image-item">
          <img src="2.png" alt="Image 2">
          <div class="image-caption">一旦投資，金額將會增加三倍（例如：投資 10 元將變成遊戲夥伴收到 30 元）</div>
        </div>
        <div class="image-item">
          <img src="3.png" alt="Image 3">
          <div class="image-caption">隨後，遊戲夥伴可以將任何金額回饋給您。</div>
        </div>
      </div>
      <div class="notice-box">如此一來，您和您的遊戲夥伴將有機會合力獲得投資基金額外的獲利。每次投資您會立即看見遊戲夥伴的回饋金額，您可以決定用它來調整下一輪的投資。</div>
      `
      show_buttons();
      show_dialog();
    },500)
    start60Timer()
  }

  else if (currentStep === 11) {
    clear60Timer()
    setTimeout(() => {
      dialog_box.innerHTML = `
      <h2>讓我們再說明一次基本遊戲規則</h2>
      <video controls><source src="1.mp4" type="video/mp4">您的網頁不支援影片撥放</video>
      `
      show_buttons();
      show_dialog();
    },500)
  }

  else if (currentStep === 12) {
    setTimeout(() => {
      dialog_box.innerHTML = `
      <h2>是否已了解基本遊戲規則呢?</h2>
      <button class="understand-button" onclick="currentStep=13;doloop()">我已了解</button>
      <br>
      <button class="next-button" onclick="currentStep=5;doloop()">再說一次</button>
      `
      // show_buttons();
      show_dialog();
    },500)
  }

  else if (currentStep === 13) {
    start60Timer()
    setTimeout(() => {
      dialog_box.innerHTML = `
      <h2>按下一步將跳轉到實驗頁面。</h2>
      <h3>接下來您將與電腦上的遊戲夥伴進行一項投資遊戲。遊戲開始時，您將於螢幕上看見遊戲夥伴的頭像。</h3>
      <div class="notice-box"><h3>
      每一輪投資前，您和您的夥伴每人將會各獲得 1000 元的投資基金。您的任務是決定要投資夥伴0~1000元間的任意金額。</h3></div>
      `
      show_buttons();
      show_dialog();
    },500)
  }

  else if (currentStep === 14) {
    clear60Timer()
    // 變成callback到main website
    form_submit(temp_payload)
  }

  else {
    // 不應該會出現這種狀況
    console.log("錯誤");
    window.location.href = `../error/error.html`
  }
}


leftBtn.addEventListener('click', () => {
    leftBtn.disabled = true;
    currentStep++;
    doloop();
});


window.addEventListener('message', function(event) {
  if (event.data.type === 'quizCompleted') {
    temp_payload.quiz = event.data.details
    if (event.data.success) {
      console.log('答題完成且通過！');
      // 這裡可以加入測驗通過後的處理邏輯
      // 例如：顯示下一個環節、儲存結果等
      setTimeout(() => {
        currentStep++;
        doloop();
      },1000)

    } else {
      console.log('答題完成但未通過！');
      alert("感謝您的耐心與參與！我們非常重視您的投入，但根據目前的設置，您已達到測驗次數上限，您可以重複參加測驗。這並不影響您未來參與研究的資格，並且您在本次填答的努力已幫助我們改進研究流程。期待在未來的研究中再次與您合作！謝謝您對我們研究的支持與理解。")
      // upload fail data
      // 處理未通過的情況
    }
  }
});


// =========================================無法返回前一頁==============================================
function no_return_event(){
  window.history.pushState(null, "", location.href);
  window.addEventListener("popstate", () => {
    window.history.pushState(null, "", location.href);
    alert("此頁不支援返回操作");
  });
}
no_return_event()

//=======================================交給父視窗====================================================

// 實際提交給父視窗
function form_submit(upload_data){
    // console.log('Survey Results:', results);
    upload_data.timestamp = tag_time()
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


//=======================================兩個莫名其妙的60秒跳過邏輯====================================================

function start60Timer() {
    console.log("timer start")
    // 設定 60 秒後跳轉
    timeout_60 = setTimeout(() => {
      currentStep++
      doloop()
      console.warn("60秒無反應，自動跳轉")
    }, 60000);
}

function clear60Timer() {
    // 使用者按下按鈕時重設定時器
    if (timeout_60 !== undefined) {
      console.log("timer clear")
      clearTimeout(timeout_60);
  }
}


//============================================================================================================

/**
 * 終止實驗按紐的event listener
 * */
function stop_exp_listener(){
  document.getElementById('right-btn').addEventListener('click', function(e) {
    if(confirm('確定要終止實驗?此操作無法返回')){
      dialog_box.innerHTML = `
      <p>我們尊重您的選擇，您的感受對我們非常重要！感謝您之前的參與！<br>已結束實驗，請直接關閉此網頁即可</p>
      <p>再次感謝您的參與！如果需要任何幫助，請聯絡我們：</p>
      <div class="notice-box">聯絡人/主試者：廖彗君<br>
      email：<adress><a href="mailto:trauma.cycu.psych@gmail.com">trauma.cycu.psych@gmail.com</a></adress><br>
      指導教授：洪福建</div>
      <p>此外，您也可以點擊以下【回饋表單】填寫您的意見（可匿名或選填聯絡資訊），或直接透過上述聯絡方式與我們聯繫。</p>
      <p>如您在參與過程中感到情緒不適並感到需要支持，我們已準備了相關資源資訊，您可以視需求下載或隨時聯繫我們。</p>
      <div class="button-container">
      <a href='../pdf_file/心理衛教單.pdf' target="_blank" id="feedbackForm" class="stop-button">回饋表單</a>
      <a href='https://docs.google.com/forms/d/e/1FAIpQLSfSK85PjVf8gPqx-17YZu935HX9TzyoB71CbzegUuonasJPow/viewform' target="_blank"  id="downloadResources" class="stop-button">下載心理衛教單</a>
      </div>
      `
      // 按鈕事件綁定
      document.getElementById('feedbackForm').addEventListener('click', () => {
        window.open('https://docs.google.com/forms/d/e/1FAIpQLSfSK85PjVf8gPqx-17YZu935HX9TzyoB71CbzegUuonasJPow/viewform', '_blank'); 
      });
      document.getElementById('downloadResources').addEventListener('click', () => {
        window.open('../pdf_file/心理衛教單.pdf', '_blank'); 
      });
      btnContainer.classList.add('fade-out')
    }
  })
}

stop_exp_listener()