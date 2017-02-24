 (function(factory) {
     if (typeof define == 'function' && define.cmd) {
         define(function(require) {
             var $ = require('jquery');
             factory($, window, document);
         })
     } else {
         factory($, window, document);
     }
 }(function($, window, document) {
     var cache = {},
         datepickerId = 0;;

     var defaultOptions = {
         el: 'id', //日历显示定位位置的id，当选中日期后将数据显示到该id内
         eCont: '', //单纯当做日历使用的元素id
         startDate: '', //'1980-05-01'日历展示的初始日期，也可以使用这样的格式'%y-%M-01 00:00:00',%y表示当前年份
         date: new Date(), //格式：new Date()默认选中当前日期,用于保存实际上选中的日期
         current: '', //格式："yyyy-mm-dd" 不是当前实际选中的日期，是用于计算并展示日历的时间,初始化时默认等于date，用户不可自定义
         minDate: "1900-01-01 00:00:00",
         maxDate: "2099-12-31 23:59:59",


         isShowClear: true, //bool	true	是否显示清空按钮
         isShowOK: true, //bool	true	是否显示确定按钮
         isShowToday: true, //bool	true	是否显示今天按钮
         readOnly: false, //isShowClear false 和 readOnly true 最好同时使用,
         dateFmt: 'yyyy-MM-dd', // 格式:'yyyy-MM-dd HH:mm:ss   'H:mm:ss'只显示时分秒   'yyyy年MM月'年月
         firstDayOfWeek: 0, //默认一周日开始,可设置 0 - 6 的任意一个数字,0:星期日 1:星期一 
         position: 'bottom', //自定义弹出位置top，left,right,bottom

         calendars: 1, //单日历还是双日历---待实现
         onpicked: function(date) {}, //选中日期时的回调函数,date是选中的日期，类型：Date

         onBeforeShow: function() {}
     }


     var views = {
             years: 'datepickerViewYears',
             months: 'datepickerViewMonths',
             days: 'datepickerViewDays'
         },
         tpl = {
             header: [
                 '<div class="dpTitle">',
                 '<div class="navImg datepickerYearGoPrev"><a></a></div><div class="navImg datepickerMonthGoPrev"><a></a></div>',
                 '<div style="float:left" class="datepickerMonthMenu"><div class="menuSel MMenu" style="display: none; left: 36px;">',
                 '</div><input class="datapickerinput datapickerInputMonth"></div>',
                 '<div style="float:left"  class="datepickerYearMenu"><div class="menuSel YMenu" style="display: none;"></div><input class="datapickerinput datapickerInputYear"></div>',
                 '<div class="navImg datepickerYearGoNext"><a></a></div><div class="navImg  datepickerMonthGoNext"><a></a></div>',
                 '<div style="float:right"></div>',
                 '</div>'
             ],
             time: ['<div class="dpTime" style="display: none;">',
                 '<div class="menuSel hhMenu" style="display: none;"></div>',
                 '<div class="menuSel mmMenu" style="display: none;"></div>',
                 '<div class="menuSel ssMenu" style="display: none;"></div>',
                 '<table cellspacing="0" cellpadding="0" border="0"><tbody>',
                 '<tr><td rowspan="2"><span class="dpTimeStr">时间</span>&nbsp;<input class="tB inputHour inputTime" maxlength="2"><input value=":" class="tm" readonly=""><input class="tE inputMinute inputTime" maxlength="2"><input value=":" class="tm" readonly=""><input class="tE inputSecond inputTime" maxlength="2"></td><td><button class="dpTimeUp"></button></td></tr>',
                 '<tr><td><button class="dpTimeDown"></button></td></tr>',
                 '</tbody></table>',
                 '</div>'
             ],
             control: ['<div class="dpControl">',
                 '<input class="dpButton datepickerClearInput" type="button" value="清空">',
                 '<input class="dpButton datepickerToday" type="button" value="今天">',
                 '<input class="dpButton datepickerOk" type="button" value="确定">',
                 '</div>'
             ],
             Quickselect: '<div class="datepickerQuickSelect"></div>',
             days: [
                 '<table class="WdayTable" width="100%" border="0" cellspacing="0" cellpadding="0"><tbody>',
                 '<tr class="MTitle" align="center"><td><%=weekslist[0]%></td><td><%=weekslist[1]%></td><td><%=weekslist[2]%></td><td><%=weekslist[3]%></td><td><%=weekslist[4]%></td><td><%=weekslist[5]%></td><td><%=weekslist[6]%></td></tr>',
                 '<tr>',
                 '<td class="<%=weeks[0].days[0].classname%>"><span><%=weeks[0].days[0].text%></span></td>',
                 '<td class="<%=weeks[0].days[1].classname%>"><span><%=weeks[0].days[1].text%></span></td>',
                 '<td class="<%=weeks[0].days[2].classname%>"><span><%=weeks[0].days[2].text%></span></td>',
                 '<td class="<%=weeks[0].days[3].classname%>"><span><%=weeks[0].days[3].text%></span></td>',
                 '<td class="<%=weeks[0].days[4].classname%>"><span><%=weeks[0].days[4].text%></span></td>',
                 '<td class="<%=weeks[0].days[5].classname%>"><span><%=weeks[0].days[5].text%></span></td>',
                 '<td class="<%=weeks[0].days[6].classname%>"><span><%=weeks[0].days[6].text%></span></td>',
                 '</tr>',
                 '<tr>',
                 '<td class="<%=weeks[1].days[0].classname%>"><span><%=weeks[1].days[0].text%></span></a></td>',
                 '<td class="<%=weeks[1].days[1].classname%>"><span><%=weeks[1].days[1].text%></span></a></td>',
                 '<td class="<%=weeks[1].days[2].classname%>"><span><%=weeks[1].days[2].text%></span></a></td>',
                 '<td class="<%=weeks[1].days[3].classname%>"><span><%=weeks[1].days[3].text%></span></a></td>',
                 '<td class="<%=weeks[1].days[4].classname%>"><span><%=weeks[1].days[4].text%></span></a></td>',
                 '<td class="<%=weeks[1].days[5].classname%>"><span><%=weeks[1].days[5].text%></span></a></td>',
                 '<td class="<%=weeks[1].days[6].classname%>"><span><%=weeks[1].days[6].text%></span></a></td>',
                 '</tr>',
                 '<tr>',
                 '<td class="<%=weeks[2].days[0].classname%>"><span><%=weeks[2].days[0].text%></span></a></td>',
                 '<td class="<%=weeks[2].days[1].classname%>"><span><%=weeks[2].days[1].text%></span></a></td>',
                 '<td class="<%=weeks[2].days[2].classname%>"><span><%=weeks[2].days[2].text%></span></a></td>',
                 '<td class="<%=weeks[2].days[3].classname%>"><span><%=weeks[2].days[3].text%></span></a></td>',
                 '<td class="<%=weeks[2].days[4].classname%>"><span><%=weeks[2].days[4].text%></span></a></td>',
                 '<td class="<%=weeks[2].days[5].classname%>"><span><%=weeks[2].days[5].text%></span></a></td>',
                 '<td class="<%=weeks[2].days[6].classname%>"><span><%=weeks[2].days[6].text%></span></a></td>',
                 '</tr>',
                 '<tr>',
                 '<td class="<%=weeks[3].days[0].classname%>"><span><%=weeks[3].days[0].text%></span></a></td>',
                 '<td class="<%=weeks[3].days[1].classname%>"><span><%=weeks[3].days[1].text%></span></a></td>',
                 '<td class="<%=weeks[3].days[2].classname%>"><span><%=weeks[3].days[2].text%></span></a></td>',
                 '<td class="<%=weeks[3].days[3].classname%>"><span><%=weeks[3].days[3].text%></span></a></td>',
                 '<td class="<%=weeks[3].days[4].classname%>"><span><%=weeks[3].days[4].text%></span></a></td>',
                 '<td class="<%=weeks[3].days[5].classname%>"><span><%=weeks[3].days[5].text%></span></a></td>',
                 '<td class="<%=weeks[3].days[6].classname%>"><span><%=weeks[3].days[6].text%></span></a></td>',
                 '</tr>',
                 '<tr>',
                 '<td class="<%=weeks[4].days[0].classname%>"><span><%=weeks[4].days[0].text%></span></a></td>',
                 '<td class="<%=weeks[4].days[1].classname%>"><span><%=weeks[4].days[1].text%></span></a></td>',
                 '<td class="<%=weeks[4].days[2].classname%>"><span><%=weeks[4].days[2].text%></span></a></td>',
                 '<td class="<%=weeks[4].days[3].classname%>"><span><%=weeks[4].days[3].text%></span></a></td>',
                 '<td class="<%=weeks[4].days[4].classname%>"><span><%=weeks[4].days[4].text%></span></a></td>',
                 '<td class="<%=weeks[4].days[5].classname%>"><span><%=weeks[4].days[5].text%></span></a></td>',
                 '<td class="<%=weeks[4].days[6].classname%>"><span><%=weeks[4].days[6].text%></span></a></td>',
                 '</tr>',
                 '<tr>',
                 '<td class="<%=weeks[5].days[0].classname%>"><span><%=weeks[5].days[0].text%></span></a></td>',
                 '<td class="<%=weeks[5].days[1].classname%>"><span><%=weeks[5].days[1].text%></span></a></td>',
                 '<td class="<%=weeks[5].days[2].classname%>"><span><%=weeks[5].days[2].text%></span></a></td>',
                 '<td class="<%=weeks[5].days[3].classname%>"><span><%=weeks[5].days[3].text%></span></a></td>',
                 '<td class="<%=weeks[5].days[4].classname%>"><span><%=weeks[5].days[4].text%></span></a></td>',
                 '<td class="<%=weeks[5].days[5].classname%>"><span><%=weeks[5].days[5].text%></span></a></td>',
                 '<td class="<%=weeks[5].days[6].classname%>"><span><%=weeks[5].days[6].text%></span></a></td>',
                 '</tr>',
                 '</tbody></table>'
             ],
             yearMenu: [
                 '<table cellspacing="0" cellpadding="3" border="0" nowrap="nowrap" data-year="<%=currentYear%>"><tbody>',
                 '<tr><td                  class="<%=data[0].classname%>"><%=data[0].text%></td><td  class="<%=data[6].classname%>"><%=data[6].text%></td></tr>',
                 '<tr nowrap="nowrap"><td  class="<%=data[1].classname%>"><%=data[1].text%></td><td  class="<%=data[7].classname%>"><%=data[7].text%></td></tr>',
                 '<tr nowrap="nowrap"><td  class="<%=data[2].classname%>"><%=data[2].text%></td><td  class="<%=data[7].classname%>"><%=data[8].text%></td></tr>',
                 '<tr nowrap="nowrap"><td  class="<%=data[3].classname%>"><%=data[3].text%></td><td  class="<%=data[9].classname%>"><%=data[9].text%> </td></tr>',
                 '<tr nowrap="nowrap"><td  class="<%=data[4].classname%>"><%=data[4].text%></td><td  class="<%=data[10].classname%>"><%=data[10].text%></td></tr>',
                 '<tr nowrap="nowrap"><td  class="<%=data[5].classname%>"><%=data[5].text%></td><td  class="<%=data[11].classname%>"><%=data[11].text%></td></tr>',
                 '</tbody></table>',
                 '<table cellspacing = "0" cellpadding = "3" border = "0" align = "center"> <tbody> <tr> <td class = "<%=prevClassName%>"> ← </td><td class="yearMenuClose yearMenuControl">×</td> <td class = "<%=nextClassName%>"> → </td></tr> </tbody></table > '
             ],
             monthMenu: [
                 '<table cellspacing="0" cellpadding="3" border="0" nowrap="nowrap"><tbody>',
                 '<tr nowrap="nowrap"><td data-month="1" class="<%=data[0].classname%>"><%=data[0].text%></td><td data-month="7" class="<%=data[6].classname%>"><%=data[6].text%></td></tr>',
                 '<tr nowrap="nowrap"><td data-month="2" class="<%=data[1].classname%>"><%=data[1].text%></td><td data-month="8" class="<%=data[7].classname%>"><%=data[7].text%></td></tr>',
                 '<tr nowrap="nowrap"><td data-month="3" class="<%=data[2].classname%>"><%=data[2].text%></td><td data-month="9" class="<%=data[8].classname%>"><%=data[8].text%></td></tr>',
                 '<tr nowrap="nowrap"><td data-month="4" class="<%=data[3].classname%>"><%=data[3].text%></td><td data-month="10" class="<%=data[9].classname%>"><%=data[9].text%> </td></tr>',
                 '<tr nowrap="nowrap"><td data-month="5" class="<%=data[4].classname%>"><%=data[4].text%></td><td data-month="11" class="<%=data[10].classname%>"><%=data[10].text%></td></tr>',
                 '<tr nowrap="nowrap"><td data-month="6" class="<%=data[5].classname%>"><%=data[5].text%></td><td data-month="12" class="<%=data[11].classname%>"><%=data[11].text%></td></tr>',
                 '</tbody></table>',
             ]

         };



     extendDate();


     /**
      * @constructor  
      * @description 日期选择插件
      * @param {Object}   options -弹窗配置,   
      * @param {Node}     [options.el='']  -作为日期选择器显示定位位置的id，当选中日期后将数据显示到该元素内
      * @param {Node}     [options.eCont=''] -单纯当做日历使用的元素id
      * @param date: new Date() 格式：new Date()默认选中当前日期,用于保存实际上选中的日期
      * @param current: '' 格式："yyyy-mm-dd" 不是当前实际选中的日期，是用于计算并展示日历的时间,初始化时默认等于date，用户不可自定义
      * @param {String}   [options.startDate=''] -'1980-05-01'日历展示的初始日期，也可以使用这样的格式'%y-%M-01 00:00:00',%y表示当前年份
      * @param {String}   [options.minDate="1900-01-01 00:00:00"] -最小日期
      * @param {String}   [options.maxDate="2099-12-31 23:59:59"] -最大日期
      * @param {Boolean}  [options.isShowClear=true] -是否显示清空按钮
      * @param {Boolean}  [options.isShowOK=true]    -是否显示确定按钮
      * @param {Boolean}  [options.isShowToday=true]	-是否显示今天按钮
      * @param {Boolean}  [options.readOnly=false] -false 和 readOnly true 最好同时使用,
      * @param {String}   [options.dateFmt='yyyy-MM-dd'] -格式:'yyyy-MM-dd HH:mm:ss   'H:mm:ss'只显示时分秒   'yyyy年MM月'年月
      * @param {Number}   [options.firstDayOfWeek=0] -默认一周日开始,可设置 0 - 6 的任意一个数字,0:星期日 1:星期一 
      * @param {String}   [options.position='bottom'] - 自定义弹出位置top，left,right,bottom
      * @param {Number}   [options.calendars=1] -单日历还是双日历---待实现
      * @param {function} [options.onpicked=function(date){}]  //选中日期时的回调函数,date是选中的日期，类型：Date
      * @param {function} [options.onRenderCell=function() { return true }]
      * @param {function} [options.onBeforeShow=function() {}]
      *
      * @example 
      *  new DatePicker({
      *     el: '#simple-calendar',
      *     minDate: "2016-12-01 00:00:00",
      *     maxDate: "2017-10-01 23:59:59",
      *     firstDayOfWeek: "1",
      *     onpicked: function(date) {
      *         alert("date" + date);
      *     }
      * });
      *
      */
     var DatePicker = function(options) {
         /*
              关于时间格式问题，有的时包括时分秒的,有的不包括
              currnet 和date  保存数据时应该都是按照new Date()的格式保存
              然后具体显示时间时要根据时间格式判断来进行时间显示
              注意时间格式的两个问题，一个是IE下用yyyy/mm/dd的格式来new Date()
              另一个是赋值问题，注意时间类型是引用对象
        */
         this.options = $.extend({}, defaultOptions, options || {});
         this.id = datepickerId++;
         this.init();
     };

     var fn = DatePicker.prototype;

     /**
      * 初始化
      * @private 
      */
     fn.init = function() {
         //设置当前时间,如果未设定开始时间,则取当前日期为默认值

         if (this.options.startDate) {
             var current = this.options.startDate;
         } else {
             var current = new Date();
         }
         if (this.options.dateFmt === 'yyyy-MM-dd HH:mm:ss') {
             this.showTime = true;
         } else {
             this.showTime = false;
         }

         this.options.current = new Date(current.getTime());
         //日期以/分隔保存，以防止在IE下 new Date()报错
         this.options.maxDate = (this.options.maxDate).replace(/-/g, "/");
         this.options.minDate = (this.options.minDate).replace(/-/g, "/");
         //如果起始时间大于最大时间和最小时间
         if (new Date(this.options.maxDate) < this.options.current) {
             this.options.current = new Date(this.options.maxDate);
         } else if (new Date(this.options.minDate) > this.options.current) {
             this.options.current = new Date(this.options.minDate);
         }

         this.bulidCalender();
         if (!this.options.eCont) {
             this.offsetHeight = $(this.options.el).get(0).offsetHeight;
             this.offsetWidth = $(this.options.el).get(0).offsetWidth;
             this.bindEl();
         }
     }



     /**
      * 初始化日期选择器DOM结构 
      * @private 
      */
     fn.bulidCalender = function() {

         var $WdateDiv = $('<div class="WdateDiv"></div>');
         $WdateDiv.append(tpl.header.join(""), '<div  class="datepickerDays"></div>', tpl.time.join(""), tpl.Quickselect, tpl.control.join(""));

         if (this.options.eCont) {
             $(this.options.eCont).append($WdateDiv);
         } else {
             $("body").append($WdateDiv);
             $WdateDiv.css("visibility", "hidden");
         }

         var date = new Date(this.options.current.getTime());
         $WdateDiv.find(".datapickerinput").eq(0).val((date.getMonth() + 1) + "月");
         $WdateDiv.find(".datapickerinput").eq(1).val(date.getFullYear());


         this.wrapper = $WdateDiv;
         this.yearMenuWerapper = this.wrapper.find(".YMenu");
         this.monthMenuWerapper = this.wrapper.find(".MMenu");
         var dpControl = $WdateDiv.find(".dpControl");

         if (!this.options.eCont) {
             $(this.options.eCont).empty().append($WdateDiv);
             var dpTime = $WdateDiv.find(".dpTime");
             if (this.showTime) {
                 dpTime.css("display", "block");
                 var current = this.options.current;
                 dpTime.find("input:eq(0)").val(current.getHours()).addClass("active");
                 dpTime.find("input:eq(2)").val(current.getMinutes());
                 dpTime.find("input:eq(4)").val(current.getSeconds());
             }
             if (!this.options.isShowClear) {
                 dpControl.find(".datepickerClearInput").css("display", "none");
             }
             if (!this.options.isShowOK) {
                 dpControl.find(".datepickerToday").css("display", "none");
             }
             if (!this.options.isShowToday) {
                 dpControl.find(".datepickerOk").css("display", "none");
             }
         } else {
             dpControl.css("display", "none");
             $WdateDiv.find(".datepickerQuickSelect").css("display", "none");
         }
         this.bulidDay();
         this.YearOrMonthButtonControl();
         this.bindCalender();
         if (!this.options.eCont) {
             this.bindControl();
         }

     }

     /**
      * 创建日期选择器中的日期部分DOM
      * @private 
      */
     fn.bulidDay = function() {
         var options = this.options;
         var cnt, date;
         var weekList = ["日", "一", "二", "三", "四", "五", "六"];

         for (var i = 0; i < options.calendars; i++) {
             data = { weeks: [], weekslist: [] };
             for (var i = options.firstDayOfWeek; i < 7; i++) {
                 data.weekslist.push(weekList[i])
             }
             for (var i = 0; i < options.firstDayOfWeek; i++) {
                 data.weekslist.push(weekList[i])
             }

             date = new Date(options.current.getTime());
             date.setDate(1);

             month = date.getMonth();
             var dow = (date.getDay() - options.firstDayOfWeek) % 7;
             date.addDays(-(dow + (dow < 0 ? 7 : 0)));
             cnt = 0;
             var curr;
             curr = new Date(options.current.getTime());
             if (curr > new Date(options.maxDate)) {
                 curr = new Date(options.maxDate);
                 this.options.current = new Date(curr.getTime());
             } else if (curr < new Date(options.minDate)) {
                 curr = new Date(options.minDate);
                 this.options.current = new Date(curr.getTime());
             }
             while (cnt < 42) {
                 indic = parseInt(cnt / 7, 10);
                 indic2 = cnt % 7;
                 if (!data.weeks[indic]) {
                     data.weeks[indic] = {
                         days: []
                     };
                 }
                 data.weeks[indic].days[indic2] = {
                     text: date.getDate(),
                     classname: []
                 };

                 var today = new Date();
                 if (today.getDate() == date.getDate() && today.getMonth() == date.getMonth() && today.getYear() == date.getYear()) {
                     data.weeks[indic].days[indic2].classname.push('datepickerToday');
                 }
                 if (date > today) {
                     // current month, date in future
                     data.weeks[indic].days[indic2].classname.push('datepickerFuture');
                 }

                 //超过最大和最小日期限制的时间
                 if ((date > new Date(options.maxDate)) || (date < new Date(options.minDate))) {
                     data.weeks[indic].days[indic2].classname.push('datepickerInvalidDay');
                 } else {
                     data.weeks[indic].days[indic2].classname.push('datepickerValidDay');
                 }

                 if (month != date.getMonth()) {
                     data.weeks[indic].days[indic2].classname.push('datepickerNotInMonth');
                     if (options.current > date) {
                         //用data比较会比较准确，因为会牵涉到最小2016-12-01 和2017-01-01单纯比较月份时 前面月份大于后面的  
                         data.weeks[indic].days[indic2].classname.push('datepickerMonthprev');
                     } else {
                         data.weeks[indic].days[indic2].classname.push('datepickerMonthNext');
                     }
                     // disable clicking of the 'not in month' cells
                 } else {
                     data.weeks[indic].days[indic2].classname.push('datepickerInMonth');
                 }

                 if (date.getDay() == 0) {
                     data.weeks[indic].days[indic2].classname.push('datepickerSunday');
                 }
                 if (date.getDay() == 6) {
                     data.weeks[indic].days[indic2].classname.push('datepickerSaturday');
                 }
                 //  var fromUser = options.onRenderCell(date);

                 if (curr) {
                     if (curr.getDate() == date.getDate() && curr.getMonth() == date.getMonth() && curr.getYear() == date.getYear()) {
                         data.weeks[indic].days[indic2].classname.push('datepickerSelected');
                     }
                 }
                 //  if (fromUser.disabled) {
                 //      data.weeks[indic].days[indic2].classname.push('datepickerDisabled');
                 //  }
                 //  if (fromUser.className) {
                 //      data.weeks[indic].days[indic2].classname.push(fromUser.className);
                 //  }
                 data.weeks[indic].days[indic2].classname = data.weeks[indic].days[indic2].classname.join(' ');
                 cnt++;
                 date.addDays(1);
             }
             // Fill the datepickerDays template with data
             html = tmpl(tpl.days.join(''), data); //+ html;
         }
         this.wrapper.find(".datepickerDays").empty().html(html);

     }

     /**
      * 创建日期选择器中的年份选择菜单DOM
      * @private 
      * @param {Number} year 年份
      */
     fn.bulidYearMenu = function(year) {
         var maxYear = new Date(this.options.maxDate).getFullYear();
         var minYear = new Date(this.options.minDate).getFullYear();
         var html, data, dow, year;

         dow = year - 6;
         data = {
             data: [],
             currentYear: year,
             prevClassName: "",
             nextClassname: ""
         }
         if (minYear >= dow) {
             data.prevClassName = "invalidMenu";
         } else {
             data.prevClassName = "yearMenuGoprev yearMenuControl";
         }
         for (var j = 0; j < 12; j++) {
             year = dow + j;
             data.data[j] = {
                 text: year,
                 classname: ["yearMenu"]
             };

             if ((maxYear >= year) && (year >= minYear)) {
                 data.data[j].classname.push("menu");
             } else {
                 data.data[j].classname.push("invalidMenu");
             }
             data.data[j].classname = data.data[j].classname.join(" ");
         }
         if (maxYear >= year) {
             data.nextClassName = "yearMenuGoNext yearMenuControl";
         } else {
             data.nextClassName = "invalidMenu";
         }

         // datepickerYears template
         html = tmpl(tpl.yearMenu.join(''), data);
         this.yearMenuWerapper.empty().append(html);
     }

     /**
      * 创建日期选择器中的月份选择菜单DOM
      * @private 
      */
     fn.bulidMonthMenu = function() {
         var months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一", "十二"];
         var maxDate = new Date(this.options.maxDate);
         var date = new Date(this.options.current.getTime());
         var minDate = new Date(this.options.minDate);
         var maxMonth = maxDate.getMonth();
         var minMonth = minDate.getMonth();
         var html, data;
         data = {
             data: [],
             prevClassName: ""
         }
         if (date.getFullYear() === maxDate.getFullYear() || minDate.getFullYear() === date.getFullYear()) {
             for (var j = 0; j < 12; j++) {
                 data.data[j] = {
                     text: months[j],
                     classname: ["monthMenu"]
                 };
                 if (minDate.getFullYear() === maxDate.getFullYear()) {
                     if ((minMonth <= j) && (j <= maxMonth)) {
                         data.data[j].classname.push("menu");
                     } else {
                         data.data[j].classname.push("invalidMenu");
                     }
                 } else if (date.getFullYear() === maxDate.getFullYear()) {
                     if (j <= maxMonth) {
                         data.data[j].classname.push("menu");
                     } else {
                         data.data[j].classname.push("invalidMenu");
                     }
                 } else {
                     if (minMonth <= j) {
                         data.data[j].classname.push("menu");
                     } else {
                         data.data[j].classname.push("invalidMenu");
                     }
                 }
                 data.data[j].classname = data.data[j].classname.join(" ");
             }
         } else {
             for (var j = 0; j < 12; j++) {
                 data.data[j] = {
                     text: months[j],
                     classname: 'monthMenu menu'
                 };
             }
         }
         // datepickerYears template
         html = tmpl(tpl.monthMenu.join(''), data);
         this.monthMenuWerapper.empty().append(html);
     }

     /**
      * 绑定日期选择器主题中的事件
      * @private 
      */
     fn.bindCalender = function() {
         var datePickerWrapper = this.wrapper,
             options = this.options;
         var self = this;

         var wrapperHeader = datePickerWrapper.find(".dpTitle");
         var input = datePickerWrapper.find(".datapickerinput");

         wrapperHeader.on("click", ".navImg", function() {
             if ($(this).hasClass("invalid")) {
                 return false;
             }
             if ($(this).hasClass("datepickerYearGoPrev")) {
                 self.yearOrMonthChange(1, -1);
             } else if ($(this).hasClass("datepickerMonthGoPrev")) {
                 self.yearOrMonthChange(2, -1);
             } else if ($(this).hasClass("datepickerYearGoNext")) {
                 self.yearOrMonthChange(1, 1);
             } else if ($(this).hasClass("datepickerMonthGoNext")) {
                 self.yearOrMonthChange(2, 1);
             }
         });

         wrapperHeader.find(".menuSel").on("click", "td.menu", $.proxy(this.menuClikHandler, this));
         wrapperHeader.find(".datapickerinput").on("focus", function() {
             var date, year;
             if ($(this).hasClass("datapickerInputYear")) {
                 date = new Date(options.current.getTime());
                 year = date.getFullYear();
                 self.bulidYearMenu(year);
                 self.monthMenuWerapper.css("display", "none");
                 self.yearMenuWerapper.css("display", "block");

             } else {
                 self.bulidMonthMenu();
                 self.monthMenuWerapper.css("display", "block");
                 self.yearMenuWerapper.css("display", "none");
             }
         });

         $("body").on("click", function(e) {
             var ele = $(e.target);
             if (!ele.hasClass("datapickerinput")) {
                 wrapperHeader.find(".menuSel").css("display", "none");
             } else if (ele.hasClass("datapickerInputMonth")) {
                 wrapperHeader.find(".YMenu").css("display", "none");
             } else if (ele.hasClass("datapickerInputYear")) {
                 wrapperHeader.find(".MMenu").css("display", "none");
             }
         });

         //绑定日期点击事件
         var dayWrapper = datePickerWrapper.find(".datepickerDays");
         dayWrapper.on("click", "td.datepickerValidDay", $.proxy(this.dateselect, this));
     }

     /**
      * 绑定清空，今天，确定等按钮和时分秒输入框的事件控制
      * @private 
      */
     fn.bindControl = function() {
         var datePickerWrapper = this.wrapper;
         var self = this;
         var dpTime = datePickerWrapper.find(".dpTime");

         var dpControl = datePickerWrapper.find(".dpControl");


         //'清空','确认','今天' 按钮事件绑定
         dpControl.on("click", ".dpButton", function(e) {
             var input = datePickerWrapper.find(".datapickerinput");
             var ele = $(e.target);
             if (ele.hasClass("datepickerClearInput")) {
                 self.options.date = "";
             } else if (ele.hasClass("datepickerToday")) {
                 self.dateChange();
                 //重新渲染tpl.day中的内容，并进行填充；  
                 self.bulidDay();
                 self.options.onpicked.call(self, self.options.date);
             } else if (ele.hasClass("datepickerOk")) {
                 self.options.date = new Date(self.options.current.getTime());
             }

             self.elSetValue();
             //datapicker关闭
             self.hidden();
         });

         dpTime.on("click", "input.inputTime", function() {
             //默认inputHour处于active状态 当点击inputMinute和inputSecond后，被点击的处于活跃状态 
             dpTime.find("input.inputTime").removeClass("active");
             $(this).addClass("active");
         });

         dpTime.on("blur", "input.inputTime", function() {
             var val = parseInt($(this).val());
             if (!val || isNaN(val)) {
                 val = 0;
             } else {
                 if (val < 0) {
                     val = 0;
                 } else if (val > 59) {
                     val = 59;
                 }
                 if ($(this).hasClass("inputHour") && val > 23) {
                     val = 23;
                 }
             }
             $(this).val(val);
             self.hoursChange();
         });


         dpTime.on("click", ".dpTimeUp", function() {
             var input = dpTime.find("input.inputTime.active");
             if (input.hasClass("inputHour")) {
                 var val = parseInt(input.val());
                 if (val < 23) {
                     val++;
                     input.val(val);
                     self.hoursChange();
                 }
             } else {
                 var val = parseInt(input.val());
                 if (val < 59) {
                     if (val < 54) {
                         val = val + 5;
                     } else {
                         val++;
                     }
                     input.val(val);
                     self.hoursChange();
                 }
             }
         });

         dpTime.on("click", ".dpTimeDown", function() {
             var input = dpTime.find("input.inputTime.active");
             if (input.hasClass("inputHour")) {
                 var val = parseInt(input.val());
                 if (val > 0) {
                     val--;
                     input.val(val);
                 }
             } else {
                 var val = parseInt(input.val());
                 if (val > 0) {
                     if (val > 5) {
                         val = val - 5;
                     } else {
                         val--;
                     }
                     input.val(val);
                 }
             }
         });

     }

     /**
      * 绑定el上的事件
      * @private 
      */
     fn.bindEl = function() {
         var self = this;
         if (this.options.readOnly) {
             $(this.options.el).attr("readOnly", true);
         } else {
             $(this.options.el).on("blur", function() {
                 self.valid($(this).val());
             });
         }
         $(this.options.el).on("click", function(e) {
             e.stopPropagation()
             self.show();
         });

     }



     /**
      * 处理年份和月份变化 
      * @private 
      * @param {Number} type 年份和月份变化类型
      * @param {Number} num 变化数量
      */
     fn.yearOrMonthChange = function(type, num) {
         var date = new Date(this.options.current.getTime());
         var wrapperHeader = this.wrapper.find(".dpTitle");
         var input = wrapperHeader.find(".datapickerinput");
         /* 
          * 1,2,为点击月份或年份增加或减少按钮
          * 3,4为点击月份或年份菜单
          */
         switch (type) {
             case 1:
                 date.addYears(num);
                 break;
             case 2:
                 date.addMonths(num);
                 break;
             case 3:
                 date.setYear(num);
                 break;
             case 4:
                 date.setMonth(num);
                 break;
         }
         this.options.current = new Date(date.getTime());
         this.YearOrMonthButtonControl();
         //重新渲染tpl.day中的内容，并进行填充；  
         this.bulidDay();
         input.eq(0).val((date.getMonth() + 1) + "月");
         input.eq(1).val(date.getFullYear());
     }

     /**
      * 日期选择器中的年份月粉增加或减少按钮可点击状态控制
      * @private 
      */
     fn.YearOrMonthButtonControl = function() {
         var date = new Date(this.options.current.getTime());
         var maxDate = new Date(this.options.maxDate);
         var minDate = new Date(this.options.minDate);
         var maxYear = maxDate.getFullYear();
         var minYear = minDate.getFullYear();
         var maxMonth = maxDate.getMonth();
         var minMonth = minDate.getMonth();
         var wrapperHeader = this.wrapper.find(".dpTitle");
         var YearGoPrev = wrapperHeader.find(".navImg.datepickerYearGoPrev"),
             MonthGoPrev = wrapperHeader.find(".navImg.datepickerMonthGoPrev"),
             YearGoNext = wrapperHeader.find(".navImg.datepickerYearGoNext"),
             MonthGoNext = wrapperHeader.find(".navImg.datepickerMonthGoNext");

         //当前年份大于等于maxYear  或 当年年份+1时,月份也会超过最大限制
         if (date.getFullYear() >= maxYear || ((date.getFullYear() + 1) >= maxYear && date.getMonth() > maxMonth)) {
             YearGoNext.addClass("invalid");
             if (date.getFullYear() === maxYear && date.getMonth() >= maxMonth) {
                 MonthGoNext.addClass("invalid");
             } else {
                 MonthGoNext.removeClass("invalid");
             }
         } else {
             YearGoNext.removeClass("invalid");
         }

         if (date.getFullYear() <= minYear || ((date.getFullYear() - 1) <= minYear && date.getMonth() < minMonth)) {
             YearGoPrev.addClass("invalid");
             if (date.getFullYear() === minYear && date.getMonth() <= minMonth) {
                 MonthGoPrev.addClass("invalid");
             } else {
                 MonthGoPrev.removeClass("invalid");
             }
         } else {
             YearGoPrev.removeClass("invalid");
         }
     }

     /**
      * 年或月份菜单点击事件处理
      * @param {Event} e dom事件对象
      * @private 
      */
     fn.menuClikHandler = function(e) {

         var self = this;
         var ele = $(e.target);
         if (ele.hasClass("menu")) {
             if (ele.hasClass("monthMenu")) {
                 var monthSelect = parseInt(ele.data("month")) - 1;
                 self.yearOrMonthChange(4, monthSelect);
             } else {
                 var yearSelect = ele.text();
                 self.yearOrMonthChange(3, yearSelect);
             }
         } else {
             e.stopPropagation();
             if (ele.hasClass("yearMenuGoprev")) {
                 var table = ele.parents("table").siblings("table");
                 if (table.length) {
                     var year = parseInt(table.attr("data-year")) - 12;
                 }
                 self.bulidYearMenu(year);
             } else if (ele.hasClass("yearMenuClose")) {
                 var table = ele.parents(".YMenu").css("display", "none");
             } else if (ele.hasClass("yearMenuGoNext")) {
                 var table = ele.parents("table").siblings("table");
                 if (table.length) {
                     var year = parseInt(table.attr("data-year")) + 12;
                     self.bulidYearMenu(year);
                 }
             }

         }
     }

     /**
      * 日期选择器中的日期选中事件处理
      * @param {Event} e dom事件对象
      * @private 
      */
     fn.dateselect = function(e) {
         var ele = $(e.target),
             day;
         if (ele.is("span")) {
             day = parseInt(ele.text());
             ele = ele.parents("td");
         } else {
             day = parseInt(ele.find("span").text());
         }
         if (ele.hasClass("datepickerInvalidDay")) {
             return false;
         }
         if (ele.hasClass("datepickerInMonth")) {
             this.dateChange(1, day);
         } else if (ele.hasClass("datepickerMonthprev")) {
             this.dateChange(3, day);
         } else {
             this.dateChange(2, day);
         }
         // ele.addClass("datepickerSelected");
         this.options.onpicked.call(this, this.options.date);
         this.elSetValue();
         console.log(this.options.current)
     }

     /**
      * 处理日期变化 
      * @private 
      * @param {Number} type 日期变化类型
      * @param {Number} num 变化数量
      */
     fn.dateChange = function(type, num) {
         var options = this.options;
         var input = this.wrapper.find(".datapickerinput");
         var date;
         if (type) {
             date = new Date(options.current.getTime());
             /* 
              * 5,6,7为点击日历上的日期，
              * 5是当前月日期，6是日历上前一个月的某天，7是日历上后一月的某天
              * YearOrMonth为空时，为点击当天
              */
             switch (type) {
                 case 1:
                     date.setDate(num);
                     break;
                 case 2:
                     date.addMonths(1);
                     date.setDate(num);
                     break;
                 default:
                     date.addMonths(-1);
                     date.setDate(num);
             }
         } else {
             date = new Date();
         }
         this.options.date = date;
         this.options.current = new Date(date.getTime());
         //重新渲染tpl.day中的内容，并进行填充；  
         this.bulidDay();
         input.eq(0).val((date.getMonth() + 1) + "月");
         input.eq(1).val(date.getFullYear());
     }

     /**
      * 处理时分秒变化后的显示框数据显示 
      * @private 
      * @param {Number} type 年份和月份变化类型
      * @param {Number} num 变化数量
      */
     fn.hoursChange = function() {
         var dpTime = this.wrapper.find(".dpTime");
         var hour = dpTime.find("input:eq(0)").val();
         var min = dpTime.find("input:eq(2)").val();
         var sec = dpTime.find("input:eq(4)").val();
         this.options.current.setHours(hour, min, sec);
     }

     /**
      * 验证el元素中的日期
      * @private 
      * @param {String} date -待验证的日期字符串
      */
     fn.valid = function(date) {
         if (date) {
             var options = this.options;
             var reg = /^\d{4}-((0[1-9])|([0-9])|(1[0-2]))-((0[1-9])|([0-9])|([1-2][0-9])|(3[0-1]))$/;
             if (reg.test(date)) {
                 date = new Date(date.replace(/-/g, "/"));
                 if ((new Date(options.minDate) <= date) || (date <= new Date(options.maxDate))) {
                     this.options.current = new Date(date.getTime());
                     this.options.date = new Date(date.getTime());
                 }
             }
             this.elSetValue();
         }
     }

     /**
      * el元素日期赋值
      * @private 
      */
     fn.elSetValue = function() {
         var currnet = this.options.date;
         var val;
         if (currnet && this.options.el && !this.options.eCont) {
             if (this.showTime) {
                 val = currnet.getFullYear() + '-' + (currnet.getMonth() + 1) + '-' + currnet.getDate() + ' ' + currnet.getHours() + ":" + currnet.getMinutes() + ":" + currnet.getSeconds();
             } else {
                 val = currnet.getFullYear() + '-' + (currnet.getMonth() + 1) + '-' + currnet.getDate();
             }
         }
         $(this.options.el).val(val);
     }

     /**
      * 日期选择器显示
      * @private 
      */
     fn.show = function() {
         var options = this.options;
         var self = this;
         var cal = this.wrapper;
         self.bulidDay();
         if (!(cal.css("visibility") === "visible")) {
             var calEl = cal.get(0);
             //  var options = cal.data('datepicker');

             //  var test = options.onBeforeShow.apply(this, [calEl]);
             //  if (options.onBeforeShow.apply(this, [calEl]) == false) {
             //      return;
             //  }

             //  fill(calEl);
             //var pos = $(this).offset();
             var pos = $(options.el).offset();
             //  var viewPort = getViewport();
             var top = pos.top;
             var left = pos.left;

             cal.css({
                 visibility: 'hidden',
                 display: 'block'
             });
             //  layout(calEl);
             switch (options.position) {
                 case 'top':
                     top -= calEl.offsetHeight;
                     break;
                 case 'left':
                     left -= calEl.offsetWidth;
                     break;
                 case 'right':
                     left += this.offsetWidth;
                     break;
                 case 'bottom':
                     top += this.offsetHeight;
                     break;
             }
             //  if (top + calEl.offsetHeight > viewPort.t + viewPort.h) {
             //      top = pos.top - calEl.offsetHeight;
             //  }
             //  if (top < viewPort.t) {
             //      top = pos.top + this.offsetHeight + calEl.offsetHeight;
             //  }
             //  if (left + calEl.offsetWidth > viewPort.l + viewPort.w) {
             //      left = pos.left - calEl.offsetWidth;
             //  }
             //  if (left < viewPort.l) {
             //      left = pos.left + this.offsetWidth
             //  }
             cal.css({
                 visibility: 'visible',
                 display: 'block',
                 top: top + 'px',
                 left: left + 'px'
             });
             //  options.onAfterShow.apply(this, [cal.get(0)]);

             var clickHandler = function(ev) {
                 if ($(ev.target).parents(".WdateDiv").length === 0) {
                     self.hidden();
                 }
             }
             $(document).on("click." + this.id, $.proxy(clickHandler, this));

             // global listener so clicking outside the calendar will close it
         }
         return false;
     }

     /**
      * 日期选择隐藏
      * @private 
      */
     fn.hidden = function() {
         $(this.options.el).removeClass("active");
         var cal = this.wrapper;
         cal.css({
             visibility: 'hidden',
             display: 'block'
         });
         $(document).off('click.' + this.id);
     }



     function extendDate() {
         if (Date.prototype.tempDate) {
             return;
         }
         Date.prototype.tempDate = null;

         Date.prototype.addDays = function(n) {
             this.setDate(this.getDate() + n);
             this.tempDate = this.getDate();
         };
         Date.prototype.addMonths = function(n) {
             if (this.tempDate == null) {
                 this.tempDate = this.getDate();
             }
             this.setDate(1);
             this.setMonth(this.getMonth() + n);
             this.setDate(Math.min(this.tempDate, this.getMaxDays()));
         };
         Date.prototype.addYears = function(n) {
             if (this.tempDate == null) {
                 this.tempDate = this.getDate();
             }
             this.setDate(1);
             this.setFullYear(this.getFullYear() + n);
             this.setDate(Math.min(this.tempDate, this.getMaxDays()));
         };
         Date.prototype.getMaxDays = function() {
             var tmpDate = new Date(Date.parse(this)),
                 d = 28,
                 m;
             m = tmpDate.getMonth();
             d = 28;
             while (tmpDate.getMonth() == m) {
                 d++;
                 tmpDate.setDate(d);
             }
             return d - 1;
         };
     }


     function getCallback(func) {
         if ($.type(func) == 'string') {
             if (func.indexOf('.') == -1)
                 return func = window[func];
             var ns = func.split('.');
             var name = window[ns.shift()];
             while (ns.length) {
                 name = name[ns.shift()];
             }
             return name;
         }
         return func;
     }

     function readOptions(el) {
         var options = {};
         var config = [];
         for (var n in defaultOptions) {
             n = n.replace(/([A-Z])/g, "-$1").toLowerCase();
             config.push(n);
         }
         for (var i = 0, l = config.length; i < l; i++) {
             var n = config[i];
             var an = "data-" + n;
             if (n.indexOf('-') != -1) {
                 n = (n.split('-')).map(function(v, i) {
                     if (i == 0) return v;
                     return v.charAt(0).toUpperCase() + v.substring(1, v.length);
                 }).join('');
             }
             var val = el.attr(an);
             if (val) {
                 if (val == "false") {
                     val = false;
                 } else if (n.substr(0, 2) == "on") {
                     val = getCallback(val);
                 }
                 options[n] = val;
             }
         }
         return options;
     }
     if (!Array.prototype.map) {
         Array.prototype.map = function(f, oThis) {
             if (!f || f.constructor != Function.toString()) return;
             oThis = oThis || window;
             var a = [];
             for (var i = 0, len = this.length; i < len; i++) {
                 a.push(f.call(oThis, this[i], i, this));
             }
             return a;
         }
     }

     function init(context) {
         var selector = '[data-component="DatePicker"]';
         context.find(selector).each(function() {
             var el = $(this);
             var options = readOptions(el);
             el.data("datePicker", new DatePicker(el, options));
         });
     }
     Select.init = init;
     $(function() {
         init($doc);
     });

     var tmpl = function tmpl(str, data) {
         // Figure out if we're getting a template, or if we need to
         // load the template - and be sure to cache the result.
         var fn = !/\W/.test(str) ?
             cache[str] = cache[str] ||
             tmpl(document.getElementById(str).innerHTML) :

             // Generate a reusable function that will serve as a template
             // generator (and which will be cached).
             new Function("obj",
                 "var p=[],print=function(){p.push.apply(p,arguments);};" +

                 // Introduce the data as local variables using with(){}
                 "with(obj){p.push('" +

                 // Convert the template into pure JavaScript
                 str
                 .replace(/[\r\t\n]/g, " ")
                 .split("<%").join("\t")
                 .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                 .replace(/\t=(.*?)%>/g, "',$1,'")
                 .split("\t").join("');")
                 .split("%>").join("p.push('")
                 .split("\r").join("\\'") +
                 "');}return p.join('');");

         // Provide some basic currying to the user
         return data ? fn(data) : fn;
     };


     window.DatePicker = DatePicker;
 }));