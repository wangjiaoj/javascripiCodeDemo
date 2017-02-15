 (function($) {
     var cache = {},
         tmpl;

     var defaultOptions = {
         el: 'id', //日历显示定位位置的id，当选中日期后将数据显示到该id内
         date: new Date(), //格式：new Date()默认选中当前日期,用于保存实际上选中的日期
         current: '', //格式："yyyy-mm-dd" 不是当前实际选中的日期，是用于计算并展示日历的时间,初始化时默认等于date，用户不可自定义
         minDate: "1900-01-01 00:00:00",
         maxDate: "2099-12-31 23:59:59",
         eCont: '', //单纯当做日历使用的元素id
         startDate: '', //'1980-05-01'日历展示的初始日期，也可以使用这样的格式'%y-%M-01 00:00:00',%y表示当前年份
         isShowClear: true, //bool	true	是否显示清空按钮
         isShowOK: true, //bool	true	是否显示确定按钮
         isShowToday: true, //bool	true	是否显示今天按钮
         readOnly: false, //isShowClear false 和 readOnly true 最好同时使用,
         dateFmt: 'yyyy-MM-dd', // 格式:'yyyy-MM-dd HH:mm:ss   'H:mm:ss'只显示时分秒   'yyyy年MM月'年月
         firstDayOfWeek: 0, //默认一周日开始,可设置 0 - 6 的任意一个数字,0:星期日 1:星期一 
         position: { left: 100, top: 50 }, //自定义弹出位置
         onpicked: function() {}, //选中日期时的回调函数
         calendars: 1, //单日历还是双日历

         onRenderCell: function() { return {} },
         onBeforeShow: function() {}
     }
     var ids = {},
         views = {
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
                 '<table cellspacing="0" cellpadding="0" border="0"><tbody><tr><td rowspan="2"><span class="dpTimeStr">时间</span>&nbsp;<input class="tB" maxlength="2"><input value=":" class="tm" readonly=""><input class="tE" maxlength="2"><input value=":" class="tm" readonly=""><input class="tE" maxlength="2"></td><td><button class="dpTimeUp"></button></td></tr><tr><td><button class="dpTimeDown"></button></td></tr></tbody></table>',
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

     var DatePicker = function(options) {
         this.options = $.extend({}, defaultOptions, options || {});
         this.init();
     }; // DatePicker

     var fn = DatePicker.prototype;

     fn.init = function() {
         //设置当前时间,如果未设定开始时间,则取当前日期为默认值
         //日期以/分隔保存，以防止在IE下 new Date()报错
         if (this.options.date) {
             var current = this.options.date;
         } else {
             var current = new Date();
         }
         if (this.options.dateFmt === 'yyyy-MM-dd HH:mm:ss') {
             this.options.showTime = true;
         } else {
             this.options.showTime = false;
         }
         this.options.current = current.getFullYear() + "-" + (current.getMonth() + 1) + "-" + current.getDate();
         this.options.maxDate = (this.options.maxDate).replace(/-/g, "/");
         this.options.minDate = (this.options.minDate).replace(/-/g, "/");

         this.bulidCalender();
         this.bind();
     }
     fn.bind = function() {
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
             if (!$(this).hasClass("active")) {
                 $(this).addClass("active");
                 self.show();
             }
         });

     }

     fn.valid = function(date) {
         if (date) {
             var options = this.options;
             var reg = /^\d{4}-((0[1-9])|([0-9])|(1[0-2]))-((0[1-9])|([0-9])|([1-2][0-9])|(3[0-1]))$/;
             if (reg.test(date)) {
                 date = new Date(date.replace(/-/g, "/"));
                 if (new Date(options.minDate) <= date <= new Date(options.maxDate)) {
                     this.options.current = this.options.current = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();;
                     this.options.date = date;
                 }
             }
             $(this.options.el).val(this.options.current);
         }

     }


     fn.bulidCalender = function() {

         var $WdateDiv = $('<div class="WdateDiv" style="visibility: hidden;"></div>');
         $WdateDiv.append(tpl.header.join(""), '<div  class="datepickerDays"></div>', tpl.time.join(""), tpl.Quickselect, tpl.control.join(""));
         var dataPicker = $("body").append($WdateDiv);
         var date = new Date((this.options.current).replace(/-/g, "/"));
         $WdateDiv.find(".datapickerinput").eq(0).val((date.getMonth() + 1) + "月");
         $WdateDiv.find(".datapickerinput").eq(1).val(date.getFullYear());
         this.wrapper = $WdateDiv;
         this.yearMenuWerapper = this.wrapper.find(".YMenu");
         this.monthMenuWerapper = this.wrapper.find(".MMenu");
         this.bulidDay()
         this.bindHeader();
         this.bindDay();
         this.bindControl();


     }

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

             date = new Date((options.current).replace(/-/g, "/"));
             date.setDate(1);

             month = date.getMonth();
             var dow = (date.getDay() - options.firstDayOfWeek) % 7;
             date.addDays(-(dow + (dow < 0 ? 7 : 0)));
             cnt = 0;
             var curr = new Date((options.current).replace(/-/g, "/"));;
             if (curr > new Date(options.maxDate)) {
                 curr = new Date(options.maxDate);
                 this.options.current = curr.getFullYear() + "-" + (curr.getMonth() + 1) + "-" + curr.getDate();
             } else if (curr < new Date(options.minDate)) {
                 curr = new Date(options.minDate);
                 this.options.current = curr.getFullYear() + "-" + (curr.getMonth() + 1) + "-" + curr.getDate();
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
                 }
                 if (month != date.getMonth()) {
                     data.weeks[indic].days[indic2].classname.push('datepickerNotInMonth');
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
                 var fromUser = options.onRenderCell(date);

                 if (curr) {
                     if (curr.getDate() == date.getDate() && curr.getMonth() == date.getMonth() && curr.getYear() == date.getYear()) {
                         data.weeks[indic].days[indic2].classname.push('datepickerSelected');
                     }
                 }
                 if (fromUser.disabled) {
                     data.weeks[indic].days[indic2].classname.push('datepickerDisabled');
                 }
                 if (fromUser.className) {
                     data.weeks[indic].days[indic2].classname.push(fromUser.className);
                 }
                 data.weeks[indic].days[indic2].classname = data.weeks[indic].days[indic2].classname.join(' ');
                 cnt++;
                 date.addDays(1);
             }
             // Fill the datepickerDays template with data
             html = tmpl(tpl.days.join(''), data); //+ html;
         }
         this.wrapper.find(".datepickerDays").empty().html(html);

     }

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
                 classname: []
             };

             if ((maxYear >= year) && (year >= minYear)) {
                 data.data[j].classname.push("menu");
             } else {
                 data.data[j].classname.push("invalidMenu");
             }
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

     fn.bulidMonthMenu = function() {
         var months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
         var maxDate = new Date(this.options.maxDate);
         var date = new Date(this.options.current);
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
                     classname: []
                 };
                 if ((minMonth <= j) && (j <= maxMonth)) {
                     data.data[j].classname.push("menu");
                 } else {
                     data.data[j].classname.push("invalidMenu");
                 }
             }
         } else {
             for (var j = 0; j < 12; j++) {
                 data.data[j] = {
                     text: months[j],
                     classname: ["menu"]
                 };
             }
         }
         // datepickerYears template
         html = tmpl(tpl.monthMenu.join(''), data);
         this.monthMenuWerapper.empty().append(html);
     }

     fn.bindHeader = function() {
         var datePickerWrapper = this.wrapper,
             options = this.options;;
         var self = this;

         var wrapperHeader = datePickerWrapper.find(".dpTitle");
         var input = datePickerWrapper.find(".datapickerinput");
         wrapperHeader.on("click", ".navImg", function() {
             if ($(this).hasClass("datepickerYearGoPrev")) {
                 self.dateChange(1, -1);
             } else if ($(this).hasClass("datepickerMonthGoPrev")) {
                 self.dateChange(2, -1);
             } else if ($(this).hasClass("datepickerYearGoNext")) {
                 self.dateChange(1, 1);
             } else if ($(this).hasClass("datepickerMonthGoNext")) {
                 self.dateChange(2, 1);
             }
         });
         wrapperHeader.find(".MMenu").on("click", "td.menu", function() {
             var monthSelect = parseInt($(this).data("month")) - 1;
             self.dateChange(4, monthSelect);
         });
         wrapperHeader.find(".YMenu").on("click", "td.menu", function(e) {
             var ele = $(e.target);
             if (ele.hasClass("menu")) {
                 var yearSelect = $(this).text();
                 self.dateChange(3, yearSelect);
             } else {

                 e.stopPropagation();
                 if (ele.hasClass("yearMenuGoprev")) {
                     var table = $(this).parents("table").siblings("table");
                     if (table.length) {
                         var year = parseInt(table.attr("data-year")) - 12;
                     }
                     self.bulidYearMenu(year);
                 } else if (ele.hasClass("yearMenuClose")) {
                     var table = $(this).parents(".YMenu").css("display", "none");
                 } else if (ele.hasClass("yearMenuGoNext")) {
                     var table = $(this).parents("table").siblings("table");
                     if (table.length) {
                         var year = parseInt(table.attr("data-year")) + 12;
                         self.bulidYearMenu(year);
                     }
                 }

             }
         });
         wrapperHeader.find(".datapickerinput").on("focus", function() {
             var date, year;
             if ($(this).hasClass("datapickerInputYear")) {
                 date = new Date((options.current).replace(/-/g, "/"));
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
     }

     fn.bindDay = function() {
         var options = this.options;
         var datePickerWrapper = this.wrapper;
         var dayWrapper = datePickerWrapper.find(".datepickerDays");
         dayWrapper.on("click", "td", $.proxy(this.dateselect, this));
     }

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
             this.dateChange(5, day);
         } else if (ele.hasClass("datepickerFuture")) {
             this.dateChange(6, day);
         } else {
             this.dateChange(7, day);
         }
         // ele.addClass("datepickerSelected");
         this.options.onpicked.call(this);
         $(this.options.el).val(this.options.current);
         console.log(this.options.current)
     }

     fn.dateChange = function(YearOrMonth, num) {
         var options = this.options;
         var datePickerWrapper = this.wrapper;
         var input = datePickerWrapper.find(".datapickerinput");
         var date = new Date((options.current).replace(/-/g, "/"));
         switch (YearOrMonth) {
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
             case 5:
                 date.setDate(num);
                 break;
             case 6:
                 date.addMonths(1);
                 date.setDate(num);
                 break;
             default:
                 date.addMonths(-1);
                 date.setDate(num);
         }
         if (YearOrMonth >= 5) {
             this.options.date = date;
         }

         this.options.current = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
         //重新渲染tpl.day中的内容，并进行填充；  
         this.bulidDay();

         input.eq(0).val((date.getMonth() + 1) + "月");
         input.eq(1).val(date.getFullYear());
     }

     fn.bindControl = function() {
         var datePickerWrapper = this.wrapper;
         var self = this;
         if (this.options.showTime) {
             $WdateDiv.find(".dpTime").css("display", "block");
             this.options.current;
             ////待修改撒
         }
         var dpControl = datePickerWrapper.find(".dpControl");
         var input = datePickerWrapper.find(".datapickerinput");
         dpControl.on("click", ".dpButton", function(e) {
             var ele = $(e.target);
             if (ele.hasClass("datepickerClearInput")) {
                 $(self.options.el).val();
             } else if (ele.hasClass("datepickerToday")) {
                 var date = new Date();
                 self.options.date = date;
                 self.options.current = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
                 //重新渲染tpl.day中的内容，并进行填充；  
                 self.bulidDay();

                 input.eq(0).val((date.getMonth() + 1) + "月");
                 input.eq(1).val(date.getFullYear());
                 $(self.options.el).val(self.options.current);
             } else if (ele.hasClass("datepickerOk")) {
                 datePickerWrapper.css("visibility", 'hidden');
             }
             //datapicker消失
         });


     }

     fn.show = function(ev) {
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
             $(document).on("click", $.proxy(this.hidden, this));
             // $(document).bind('mousedown', function() {
             //     self.hidden();
             // }); // global listener so clicking outside the calendar will close it
         }
         return false;
     }

     fn.hidden = function(ev) {

         if ($(ev.target).parents(".WdateDiv").length === 0) {
             $(this.options.el).removeClass("active");
             var cal = this.wrapper;
             cal.css({
                 visibility: 'hidden',
                 display: 'block'
             });
             $(document).off('mousedown');
         }
     }

     function canleder(options) {
         this.options = $.extend({}, defaultOptions, options || {});
         this.init();
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
 })(jQuery);