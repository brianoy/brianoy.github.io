/*
*鎖東鎖西 
*https://wonderland.coderbridge.io/2021/12/30/js-disable-right-mouse-button/
*/ 


function iEsc(){ return false; }
function iRec(){ return true; }
function DisableKeys() {
    if(event.ctrlKey || event.shiftKey || event.altKey)  {
    window.event.returnValue=false;
    iEsc();}
}

document.ondragstart=iEsc;
document.onkeydown=DisableKeys;
document.oncontextmenu=iEsc;

if (typeof document.onselectstart !="undefined") document.onselectstart=iEsc;
else
{
    document.onmousedown=iEsc;
    document.onmouseup=iRec;
}

function DisableRightClick(e)
{
    if (window.Event){ if (e.which == 2 || e.which == 3) iEsc();}
    else
        if (event.button == 2 || event.button == 3)
        {
            event.cancelBubble = true
            event.returnValue = false;
            iEsc();
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
no_return_event()