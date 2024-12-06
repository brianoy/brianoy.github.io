var fetch_form = ["agree_using_data", "reward"]
// 不去抓both_dont_want的數據，因為在前端就已經做好一勾起來其他兩個就會跟著一起取消了
submit_btn_event("agree_after_form")
no_return_event()
after_agree_noneed_listener()
