var HC = false;
var IPT = false;

// 如果HC=true    IPT=false     則組別為HC
// 如果HC=false    IPT=true     則組別為IPT
// 如果HC=false    IPT=false    則組別為N_IPT

var require_fill_section1 = ["age", "gender", "educ", "emp_status", "occupation", "econ_status",
    "mar_status", "res_status", "med_history", "medication_history"]; // 必填

var require_fill_section2 = ["LEC_Q1", "LEC_Q2", "LEC_Q3", "LEC_Q4", "LEC_Q5", "LEC_Q6", "LEC_Q7", "LEC_Q8",
    "LEC_Q9", "LEC_Q10", "LEC_Q11", "LEC_Q12", "LEC_Q13", "LEC_Q14", "LEC_Q15",
    "LEC_Q16", "LEC_Q17", "LEC_Q17_1", "LEC_Q17_2", "LEC_QA", "LEC_QB", "LEC_QC",
    "LEC_QD", "LEC_QE", "LEC_QF", "LEC_QG", "LEC_QH", "LEC_QI", "LEC_QJ", "LEC_QK",
    "LEC_QL", "LEC_QM", "LEC_QN"] // 必填

var fetch_form = [ //獲取表格的資料
    "age", "gender", "gender_more", "educ", "emp_status", "occupation", "econ_status",
    "mar_status", "res_status","res_status_more", "med_history","med_history_more_age","med_history_more_diagnose", "medication_history",
    "medication_history_more",
    "LEC_Q1", "LEC_Q2", "LEC_Q3", "LEC_Q4", "LEC_Q5", "LEC_Q6", "LEC_Q7", "LEC_Q8",
    "LEC_Q9", "LEC_Q10", "LEC_Q11", "LEC_Q12", "LEC_Q13", "LEC_Q14", "LEC_Q15",
    "LEC_Q16", "LEC_Q17", "LEC_Q17_1","LEC_Q17_1_more", "LEC_Q17_2", "LEC_QA", "LEC_QB", "LEC_QC",
    "LEC_QD", "LEC_QE", "LEC_QF", "LEC_QG","LEC_QG_more", "LEC_QH", "LEC_QI", "LEC_QJ", "LEC_QK",
    "LEC_QL","LEC_QL_more", "LEC_QM", "LEC_QN"];


// ==================================================================================================

/**
 * 如果HC組：第一部分1~17題皆選擇「(f)該事件對你不適用」
 * 下方就全部都不會出現
 */
group_update_listener()

// ==================================================================================================

group_submit_btn_event('base_LEC5')
no_return_event()
group_table_limit_listener()