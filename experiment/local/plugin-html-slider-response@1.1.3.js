var jsPsychHtmlSliderResponse=function(e){"use strict";function t(e,t){for(var s=0;s<t.length;s++){var r=t[s];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,(i=r.key,a=void 0,"symbol"==typeof(a=function(e,t){if("object"!=typeof e||null===e)return e;var s=e[Symbol.toPrimitive];if(void 0!==s){var r=s.call(e,t||"default");if("object"!=typeof r)return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(i,"string"))?a:String(a)),r)}var i,a}var s={name:"html-slider-response",parameters:{stimulus:{type:e.ParameterType.HTML_STRING,pretty_name:"Stimulus",default:void 0},min:{type:e.ParameterType.INT,pretty_name:"Min slider",default:0},max:{type:e.ParameterType.INT,pretty_name:"Max slider",default:100},slider_start:{type:e.ParameterType.INT,pretty_name:"Slider starting value",default:50},step:{type:e.ParameterType.INT,pretty_name:"Step",default:1},labels:{type:e.ParameterType.HTML_STRING,pretty_name:"Labels",default:[],array:!0},slider_width:{type:e.ParameterType.INT,pretty_name:"Slider width",default:null},button_label:{type:e.ParameterType.STRING,pretty_name:"Button label",default:"Continue",array:!1},require_movement:{type:e.ParameterType.BOOL,pretty_name:"Require movement",default:!1},prompt:{type:e.ParameterType.HTML_STRING,pretty_name:"Prompt",default:null},stimulus_duration:{type:e.ParameterType.INT,pretty_name:"Stimulus duration",default:null},trial_duration:{type:e.ParameterType.INT,pretty_name:"Trial duration",default:null},response_ends_trial:{type:e.ParameterType.BOOL,pretty_name:"Response ends trial",default:!0}}},r=function(){function e(t){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.jsPsych=t}var s,r,i;return s=e,(r=[{key:"trial",value:function(e,t){var s=this,r='<div id="jspsych-html-slider-response-wrapper" style="margin: 100px 0px;">';r+='<div id="jspsych-html-slider-response-stimulus">'+t.stimulus+"</div>",r+='<div class="jspsych-html-slider-response-container" style="position:relative; margin: 0 auto 3em auto; ',null!==t.slider_width?r+="width:"+t.slider_width+"px;":r+="width:auto;",r+='">',r+='<input type="range" class="jspsych-slider" value="'+t.slider_start+'" min="'+t.min+'" max="'+t.max+'" step="'+t.step+'" id="jspsych-html-slider-response-response"></input>',r+="<div>";for(var i=0;i<t.labels.length;i++){var a=100/(t.labels.length-1),n=i*(100/(t.labels.length-1));r+='<div style="border: 1px solid transparent; display: inline-block; position: absolute; left:calc('+n+"% - ("+a+"% / 2) - "+(n-50)/50*100*7.5/100+"px); text-align: center; width: "+a+'%;">',r+='<span style="text-align: center; font-size: 80%;">'+t.labels[i]+"</span>",r+="</div>"}r+="</div>",r+="</div>",r+="</div>",null!==t.prompt&&(r+=t.prompt),r+='<button id="jspsych-html-slider-response-next" class="jspsych-btn" '+(t.require_movement?"disabled":"")+">"+t.button_label+"</button>",e.innerHTML=r;var l={rt:null,response:null};if(t.require_movement){var u=function(){e.querySelector("#jspsych-html-slider-response-next").disabled=!1};e.querySelector("#jspsych-html-slider-response-response").addEventListener("mousedown",u),e.querySelector("#jspsych-html-slider-response-response").addEventListener("touchstart",u),e.querySelector("#jspsych-html-slider-response-response").addEventListener("change",u)}var o=function(){s.jsPsych.pluginAPI.clearAllTimeouts();var r={rt:l.rt,stimulus:t.stimulus,slider_start:t.slider_start,response:l.response};e.innerHTML="",s.jsPsych.finishTrial(r)};e.querySelector("#jspsych-html-slider-response-next").addEventListener("click",(function(){var s=performance.now();l.rt=Math.round(s-p),l.response=e.querySelector("#jspsych-html-slider-response-response").valueAsNumber,t.response_ends_trial?o():e.querySelector("#jspsych-html-slider-response-next").disabled=!0})),null!==t.stimulus_duration&&this.jsPsych.pluginAPI.setTimeout((function(){e.querySelector("#jspsych-html-slider-response-stimulus").style.visibility="hidden"}),t.stimulus_duration),null!==t.trial_duration&&this.jsPsych.pluginAPI.setTimeout(o,t.trial_duration);var p=performance.now()}},{key:"simulate",value:function(e,t,s,r){"data-only"==t&&(r(),this.simulate_data_only(e,s)),"visual"==t&&this.simulate_visual(e,s,r)}},{key:"create_simulation_data",value:function(e,t){var s={stimulus:e.stimulus,slider_start:e.slider_start,response:this.jsPsych.randomization.randomInt(e.min,e.max),rt:this.jsPsych.randomization.sampleExGaussian(500,50,1/150,!0)},r=this.jsPsych.pluginAPI.mergeSimulationData(s,t);return this.jsPsych.pluginAPI.ensureSimulationDataConsistency(e,r),r}},{key:"simulate_data_only",value:function(e,t){var s=this.create_simulation_data(e,t);this.jsPsych.finishTrial(s)}},{key:"simulate_visual",value:function(e,t,s){var r=this,i=this.create_simulation_data(e,t),a=this.jsPsych.getDisplayElement();if(this.trial(a,e),s(),null!==i.rt){var n=a.querySelector("input[type='range']");setTimeout((function(){r.jsPsych.pluginAPI.clickTarget(n),n.valueAsNumber=i.response}),i.rt/2),this.jsPsych.pluginAPI.clickTarget(a.querySelector("button"),i.rt)}}}])&&t(s.prototype,r),i&&t(s,i),Object.defineProperty(s,"prototype",{writable:!1}),e}();return r.info=s,r}(jsPsychModule);
//# sourceMappingURL=https://unpkg.com/@jspsych/plugin-html-slider-response@1.1.3/dist/index.browser.min.js.map