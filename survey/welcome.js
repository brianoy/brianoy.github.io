const dialogBox = document.getElementById('dialog-box');
const header = document.getElementById('header');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const dots = document.querySelectorAll('.navigation .dot');
const dotsarray = document.getElementById('dots');
const options = document.getElementById('options');
var upload_data = {};
const min_index = 1;
const max_index = 5;
let currentStep = 1;
const radioButtons = document.querySelectorAll('input[name="participation"]');

// 為每個單選按鈕添加change事件監聽器
radioButtons.forEach(radio => {
    radio.addEventListener('change', (event) => {
      if (event.target.checked) {
          const selectedValue = event.target.value;
          console.log('選擇值:', selectedValue);
          // 根據不同的選項執行不同的操作
          switch(selectedValue) {
            case 'no': // 執行選擇"否"時的操作
            upload_data.p_NP = "否";
              break;
                
            case 'partial': // 執行選擇"是，但未完成完整研究"時的操作
              upload_data.p_NP = "是，但未完成完整研究";
              break;
                
            case 'yes': // 執行選擇"是"時的操作
            upload_data.p_NP = "是";
              break;
          }
          leftBtn.disabled = false;
          leftBtn.classList.remove('fade-out');
      }
    });
});

function no5do(){
  rightBtn.addEventListener('click', () => {

    dialogBox.innerHTML = `
    <h2>謝謝您的參與，很抱歉您並未符合實驗資格</h2>
    `;
    console.log("user quit study")
    leftBtn.classList.add('fade-out');
    rightBtn.classList.add('fade-out');

  });

}

leftBtn.addEventListener('click', () => {
    leftBtn.disabled = true;
    currentStep++;
    dialogBox.classList.add('fade-out');
    setTimeout(() => {
        if (currentStep === 2) {
            dialogBox.innerHTML = `
            <h2>本研究旨在了解人們在不同情境下的決策行為與情緒反應，並探討個人經歷（包括創傷經歷）對其中的影響。</h2>
            <p>稍等我們將一起閱讀知情同意書，若您同意參與研究，您會先填寫一些問卷，之後進入作業階段，並在結束時收到相關的研究回饋。</p>
            `;
        } 
        else if (currentStep === 3) {
            dialogBox.innerHTML = `
            <h2>研究全程約需 30–40 分鐘。</h2>
            <p>請預留充足的時間，並在網路連線穩定的情況下進行。此研究需要一次性完成，且若在過程中畫面超過10分鐘無回應，系統將視為中止，並跳轉至提醒視窗。當然，您在過程中也可以隨時選擇中止研究，我們會尊重您的決定。</p>
            `;
        } 
        else if (currentStep === 4) {
            dialogBox.innerHTML = `
            <h2>當您準備好時，請點擊「開始」按鈕，研究將正式開始。</h2>
            <p>再次感謝您的參與,期待與您共同邁向更多發現!</p>
            `;
            leftBtn.textContent = "開始";
        } 
        else if (currentStep === 5) {
          dialogBox.innerHTML = `
          <h2>您是否參與過本研究？</h2>
          `;
          leftBtn.classList.add('fade-out');
          header.classList.remove('fade-out');
          options.classList.remove('fade-out');
          leftBtn.textContent = "確定";
        }

        else if (currentStep === 6) {
          options.classList.add('fade-out');
          dialogBox.innerHTML = `
          <h2>您是否年滿十八歲？</h2>
          <p>（本研究對象為十八歲以上成人，未滿十八歲者將未能參與，感謝您的興趣參與與體諒！）</p>
          `;
          header.classList.add('fade-out');
          rightBtn.classList.remove('hide');
          rightBtn.classList.remove('fade-out');
          leftBtn.classList.remove('fade-out');
          leftBtn.textContent = "是，我實際年齡已滿十八歲。繼續進行";
          rightBtn.textContent = "否，我實際年齡未滿十八歲。退出研究";
          no5do();
          
        }

        else if (currentStep === 7){
          dialogBox.innerHTML = `
          <h2>接下來，請閱讀知情同意書</h2>
          <h3>研究團隊並建議您下載此文件以便詳閱內容。若您同意參與研究，請勾選『同意』以進入研究。</h3>
          `;
          rightBtn.classList.add('hide');
          leftBtn.textContent = "下一步";
          leftBtn.classList.remove('fade-out');

        }
        else if (currentStep === 8){
          form_submit(upload_data);
        }
        else {
          // 不應該出現
          // 做一個error 404
        }

        dialogBox.classList.remove('fade-out');
        
    },500)
    
    if ((currentStep >= (min_index+1)) && (currentStep <= max_index-1 )) { // 在1~4頁的時候
      dots[currentStep - 1].classList.add('active');
      dots[currentStep - 2].classList.remove('active');
    }
    else {
      dots.forEach(function(dot) {
        dotsarray.classList.add('fade-out');
      });
    }
    setTimeout(() => {
      leftBtn.disabled = false;
    },500)
});

no_return_event()



