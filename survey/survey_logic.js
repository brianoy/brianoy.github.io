function chk_force_fill(chk_fill_list) {
    // 檢查強制填入的內容 遍歷所有必填欄位
    let formValid = true; // 追蹤counter 如果下面有問題就會變成false
    chk_fill_list.forEach(name => {
        const element = document.querySelector(`[name="${name}"]`); // 選擇對應的表單元素

        if (element) {
            // 如果是選項的話，在外層框框加紅色
            if (element.type === "checkbox" || element.type === "radio") {
                // 優先嘗試找到 <tr> 父元素，找不到則使用 .ques 父元素
                const parentOptionList = element.closest('tr') || element.closest('.ques') || element.closest('.option-list');
                const radioChecked = document.querySelector(`[name="${name}"]:checked`); // 檢查是否有選中

                if (!radioChecked && parentOptionList) {
                    formValid = false;
                    parentOptionList.style.border = "2px solid red"; // 在找到的父元素上添加紅框
                }
                else{
                    // 如果第一次有問題，第二次填了，就把紅色的框框拿掉
                    // bug: 如果說一個父框有多個必填 會造成最後一個有填而已 但不顯示框框
                    // 沒有修，自己把必填拆成自己一個父框框
                    // 修復方法，在最外面先統一取消紅框，然後把這個else刪掉就好了
                    parentOptionList.style.border = "1px solid #ddd";
                }
            } 
            // 如果是文字的話，直接在對話框外面加紅色
            else if (element.type === "text" || element.type === "textarea") {
                // 如果是文字框，檢查是否為空
                if (element.value.trim() === "") {
                    formValid = false;
                    element.style.border = "2px solid red"; // 添加紅框
                } else { 
                    // 如果第一次有問題，第二次填了，就把紅色的框框拿掉
                    element.style.border = "1px solid #ddd";
                }
            }
        }
    });
    // 都沒問題就return true
    // 有問題就return false
    return formValid;
}

/**
 * 普通狀態下的button event listenrer
 * 
 */
function submit_btn_event(form_name){
    // 按下提交鍵
    document.getElementById(form_name).addEventListener('submit', function(e) {
        e.preventDefault(); // 防止表單提交
        let formValid = true; // 追蹤counter 如果下面有問題就會變成false
    
        // 清除先前的紅框
        const optionLists = document.querySelectorAll('tr');
        optionLists.forEach(optionList => {
            optionList.style.border = ""; // 清除紅框
        });
    
        if (!chk_force_fill(fetch_form)){// 無論如何都要檢查section1
            formValid = false;
        } 
    
        if (formValid){ // 如果上面檢查都沒問題那就送出表單了
            form_submit(form_process(e))
        }
        else{
            alert('請填寫所有必填欄位');
        }
    })
}


/**
 * 
 * * form 變成json
 * @returns json
 * 
 */
function form_process(e){
   const formData = new FormData(e.target);
   const results = {};

   // 自動補齊缺失的鍵並將值設為 "null"，或是說創建好一個初始值都弄好的json到results裡面
   fetch_form.forEach(key => {
       if (!(key in results)) {
           results[key] = "null";
       }
   });

   // 手動處理所有欄位
   fetch_form.forEach(name => {
       const checkboxes = document.querySelectorAll(`[name="${name}"]`);
       if (checkboxes.length > 0 && checkboxes[0].type === "checkbox") {
           // 多選框：收集所有選中的值為一個陣列
           results[name] = Array.from(checkboxes)
               .filter(checkbox => checkbox.checked)
               .map(checkbox => checkbox.value);
       } 
       else {
           // 其他類型（如 text, textarea, radio）：直接取值
           const value = formData.get(name);
           if (value !== "") {
               results[name] = value;
           }
       }
   });
   // results.token = token
   return results
}



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


// =========================================================================================================

// 組別分派邏輯

// 不做泛化 反正本來就是為了分組而設計的
// 在每一次使用者點擊時都有機會可以刷新分組
function group_update_listener(){
    document.getElementById('base_LEC5').addEventListener('click', function(e) {
        var section2 = document.getElementById('section2');
        if (checkHC()){
            console.log("分配組別HC"); // 選擇6-11、14、16-21題
            section2.classList.add('hide'); // 隱藏第二部分
            HC = true;
        }
        else{ 
            if (checkIPT() === null) { //NONE: checkIPT()為null
                console.log("尚未判斷組別"); // 選擇6-11、14、16-21題
                IPT = true;
            }
            else if (checkIPT()) { //IPT: checkIPT()為true
                console.log("分配組別IPT"); // 選擇6-11、14、16-21題
                IPT = true;
            }
            else { // N_PTP: checkIPT()為false
                console.log("分配組別N_IPT"); // 選擇1-5、12、13、15、22題
                IPT = false;
            }
            section2.classList.remove('hide'); // 顯示第二部分
            HC = false;
        }
    });
}
// =========================================================================================================

/** niptiptpds5 section2邏輯，如果使用者勾選了F，那麼其他選項就不能勾，或是說如果使用者勾選了ABCDE，那麼就不能勾選F
*   不做泛化 反正本來就是為了分組而設計的
**/
function group_table_limit_listener(){
    // 對表格中的 checkbox 添加事件監聽
    document.querySelectorAll('.targetTable input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const row = this.closest('tr'); // 找到當前 checkbox 所在的行
            const checkboxes = row.querySelectorAll('input[type="checkbox"]');

            if (this.value === 'f') {
                // 如果勾選的是 "f"，禁用其他選項
                checkboxes.forEach(cb => {
                    if (cb.value !== 'f') {
                        cb.disabled = this.checked; // 如果 f 勾選，禁用其他
                    }
                });
            } else {
                // 如果勾選的是 "a-e"，禁用 "f"
                const fCheckbox = row.querySelector('input[value="f"]');
                fCheckbox.disabled = Array.from(checkboxes).some(cb => 
                    cb.checked && cb.value !== 'f'
                );
            }
        });
    });
}
//============================================================================================================

/**
 * 確認第二部分第A題選哪題
 * check IPT function
 * N_IPT組：第二部分A選擇1-5、12、13、15、22題
 * IPT組：第二部分A選擇6-11、14、16-21題
 * */
function checkIPT() {
    const IPT_select = ["6", "7", "8", "9", "10", "11", "14", "16", "17", "18", "19", "20", "21"];

    const selectedValue = document.querySelector('input[name="LEC_QA"]:checked');
    if (!selectedValue){ // 如果還沒select過，那selectedValue就是null，如果在null的時候selectedValue.value會報錯
        return null;
    }
    // 檢查選擇的值是否在預設的選項中
    if (IPT_select.includes(selectedValue.value)) {
        return true; // IPT
    }
    else {
        return false; // N_IPT
    }

}

//============================================================================================================

/**
 * 確認第一部分表格是否都選f
 * check HC function
 * */
function checkHC() {
    // 取得帶有 target-ques 的題目
    const questions = document.querySelectorAll('.targetTable');
    let allFSelected = true; // 假設全選 f

    // 檢查每個題目的選項
    questions.forEach((question) => {
        const fOption = question.querySelector('input[type="checkbox"][value="f"]:checked');
        if (!fOption) {
            allFSelected = false; // 有任一題未選 f
        }
    });

    // 根據結果跳轉
    if (allFSelected) {
        // 代表全部都選f，後面的區塊都不用出現
        return true;
    } 
    else {
        // 代表有不是f的，後面的區塊要出現
        return false;
    }
}

//============================================================================================================

/**
 * 組別分派用
 * 在upload資料再多加一個分組標記
 * */
function group_form_submit(e){
    var temp = form_process(e)
    if(HC){
        temp.tramaGroup = "HC"
    }
    else if(IPT){
        temp.tramaGroup = "IPT"
    }
    else{
        temp.tramaGroup = "N_IPT"
    }
    form_submit(temp)
}

//============================================================================================================

/**
 * 組別分派用
 * 專門給base lec5的button event listener
 * */
function group_submit_btn_event(form_name){
    document.getElementById(form_name).addEventListener('submit', function(e) {
        e.preventDefault(); // 防止表單提交
        let formValid = true; // 追蹤counter 如果下面有問題就會變成false
    
        // 清除先前的紅框
        const optionLists = document.querySelectorAll('.ques');
        optionLists.forEach(optionList => {
            optionList.style.border = ""; // 清除紅框
        });
        const text_areas = document.querySelectorAll('input[type="text"]');
        text_areas.forEach(text_area => {
            text_area.style.border = "#bbb solid 1px"; // 清除紅框
        });
        text_require_section1()
        if (!chk_force_fill(require_fill_section1)){// 無論如何都要檢查section1
            formValid = false;
        } 
    
        if (!HC){ // 非健康組就要檢查section2了
            text_require_section2()
            if (!chk_force_fill(require_fill_section2)){// 如果不是健康組就要檢查section2有沒有都填入  
                formValid = false;
            }
        }
        if (formValid){ // 如果上面檢查都沒問題那就送出表單了
            group_form_submit(e)
        }
        else{
            alert('請填寫所有必填欄位');
        }
    });
}

// =====================================================================================
/**
 * section1 中如果有勾選其他的，會讓其他後面的輸入框變成必填
 * 
 * 
 */
function text_require_section1(){
    const gender = document.querySelectorAll('input[name="gender"]'); // 第二題 gender_more
    const res_status = document.querySelectorAll('input[name="res_status"]'); // 第八題 res_status_more
    const med_history = document.querySelectorAll('input[name="med_history"]'); // 第九題 med_history_more_diagnose med_history_more_age
    const medication_history = document.querySelectorAll('input[name="medication_history"]'); // 第十題 medication_history_more
    
    if (gender[2].checked) {
        require_fill_section1.unshift("gender_more")
    }
    else{
        require_fill_section1 = require_fill_section1.filter(item => item !== "gender_more");
    }


    if (res_status[4].checked) {
        require_fill_section1.unshift("res_status_more")
    }
    else{
        require_fill_section1 = require_fill_section1.filter(item => item !== "res_status_more");
    }


    if (med_history[0].checked) {
        require_fill_section1.unshift("med_history_more_age")
        require_fill_section1.unshift("med_history_more_diagnose")
    }
    else{
        require_fill_section1 = require_fill_section1.filter(item => item !== "med_history_more_age");
        require_fill_section1 = require_fill_section1.filter(item => item !== "med_history_more_diagnose");
    }


    if (medication_history[0].checked) {
        require_fill_section1.unshift("medication_history_more")
    }
    else{
        require_fill_section1 = require_fill_section1.filter(item => item !== "medication_history_more");
    }

}

// =====================================================================================
/**
 * section2 中如果有勾選其他的，會讓其他後面的輸入框變成必填
 * 
 * 
 */
function text_require_section2(){
    const LEC_Q17_1 = document.querySelectorAll('input[name="LEC_Q17_1"]'); // 第17題 LEC_Q17_1_more
    const LEC_QG = document.querySelectorAll('input[name="LEC_QG"]'); // 第G題 LEC_QG_more
    const LEC_QL = document.querySelectorAll('input[name="LEC_QL"]'); // 第L題 LEC_QL_more

    if (LEC_Q17_1[5].checked) {
        require_fill_section2.unshift("LEC_Q17_1_more")
    }
    else{
        require_fill_section2 = require_fill_section2.filter(item => item !== "LEC_Q17_1_more");
    }

    if (LEC_QG[4].checked) {
        require_fill_section2.unshift("LEC_QG_more")
    }
    else{
        require_fill_section2 = require_fill_section2.filter(item => item !== "LEC_QG_more");
    }

    if (LEC_QL[1].checked) {
        require_fill_section2.unshift("LEC_QL_more")
    }
    else{
        require_fill_section2 = require_fill_section2.filter(item => item !== "LEC_QL_more");
    }

}
// =========================================無法返回前一頁==============================================
function no_return_event(){
    window.history.pushState(null, "", location.href);
    window.addEventListener("popstate", () => {
      window.history.pushState(null, "", location.href);
      alert("此頁不支援返回操作");
    });
}


// =========================================================================================================

/** agree_after邏輯，如果使用者勾選了接不需要，那麼其他選項就會跟著消失
*   不做泛化 反正本來就是為了這個白吃東西設計的
**/
function after_agree_noneed_listener(){
    // 對表格中的 checkbox 添加事件監聽
    document.querySelectorAll('input[type="checkbox"]')[0].addEventListener('change', function () {
        if (this.checked === true) {
            // 如果勾選都不要，那麼 都不要 就取消勾選
            document.querySelectorAll('input[type="checkbox"]')[2].checked = false
        } 
    })
    document.querySelectorAll('input[type="checkbox"]')[1].addEventListener('change', function () {
        if (this.checked === true) {
            // 如果勾選要，那麼 都不要 就取消勾選
            document.querySelectorAll('input[type="checkbox"]')[2].checked = false
        } 
    })
    document.querySelectorAll('input[type="checkbox"]')[2].addEventListener('change', function () {
        if (this.checked === true) {
            // 如果勾選都不要，那麼其他兩個自動取消勾選
            document.querySelectorAll('input[type="checkbox"]')[0].checked = false
            document.querySelectorAll('input[type="checkbox"]')[1].checked = false
        } 
    })


}