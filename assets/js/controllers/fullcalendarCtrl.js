
'use strict';
/**
 * Controller of the angularBootstrapCalendarApp
*/
app.controller('fullcalendarCtrl', ["$scope", "$uibModal", "$http", "$timeout", "$interval", "restSessionOut", "modalProvider", "modalProviderLeft", "APP", "duration", "notifications", "SweetAlert", "$state", "block_duration", "storeAppointmentData","$cookies","$rootScope", function ($scope, $uibModal, $http, $timeout, $interval, restSessionOut, modalProvider, modalProviderLeft, APP, duration, notifications, SweetAlert, $state, block_duration, storeAppointmentData,$cookies,$rootScope) {
  
  //console.log("localStorage", $cookies.get('userdata'))

  var auth_token = localStorage.getItem('auth_token');
  $http.defaults.headers.common.authtoken = auth_token;
  if (!localStorage.getItem('auth_token')) {
    restSessionOut.getRstOut();
  }
  if (!sessionStorage.getItem('login_time')) {
      restSessionOut.getRstOut();
  }
  
  if ($cookies.get('userdata') !== undefined) {
      $scope.loginUserData=JSON.parse($cookies.get('userdata'));

  }

  $scope.remove_custom_notification = function () {
    $("#custom_notification_bar").removeClass("show");
    $scope.copyAppointment = {}
    $scope.rebookAppointment = {}
  }

  /* Pre define varibles */

  $scope.filteredResources = [];
  var allEvents = [];
  $scope.workers = [];
  $scope.appointments = [];
  $scope.worker = {};
  $scope.workers_dropdown = false;
  $scope.calendarSidebarFlag = true;
  $scope.data_inside_modal = {}
  $scope.appointment_status = [];
  $scope.data_inside_left_modal = {}
  $scope.default_view = "resourceDay";
  $scope.interval_Start_End = {};
  $scope.current_date = {};
  $scope.appointment_setting = {}
  $scope.week_no = moment(new Date(), "MMDDYYYY").isoWeek();
  var modal_html_link = '';
  var modal_controller = '';
  $scope.display_in_appointment = {}
  $scope.copyAppointment = {};
  $scope.rebookAppointment = {};
  $scope.yellow_time_line = false;
  $scope.cancel_appointment_show = false;

  $scope.LightenDarkenColor1 = function (col, amt) {
  
    var usePound = false;
  
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
 
    var num = parseInt(col,16);
 
    var r = (num >> 16) + amt;
 
    if (r > 255) r = 255;
    else if  (r < 0) r = 0;
 
    var b = ((num >> 8) & 0x00FF) + amt;
 
    if (b > 255) b = 255;
    else if  (b < 0) b = 0;
 
    var g = (num & 0x0000FF) + amt;
 
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
 
    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
  
}


$scope.LightenDarkenColor = function (hex) {
var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',0.3)';
    }
    throw new Error('Bad Hex');

}







  /* Pre define varibles */


  $scope.fetch_calendar_setting = function () {

    $http.get(APP.API + 'user_appointment_setting'
    ).then(function (response) {
      try {
        if (response.data.status == "401") {
          restSessionOut.getRstOut();
        }
      } catch (err) { }
      // console.log('customer_for_appointment', response.data);
      //alert(angular.equals(response.data.data, {})); // true
      // alert( .id)

      var responce_data = response.data.data

      //console.log('responce_data_CalendarSetting',responce_data)
      $scope.week_Firstday = (responce_data.id != undefined) ? responce_data.first_day : 0;
      $scope.time_SlotDuration = (responce_data.id != undefined) ? responce_data.time_slot_duration : "00:10:00";
      $scope.min_Time = (responce_data.id != undefined) ? responce_data.start_time : "07:00:00";
      $scope.max_Time = (responce_data.id != undefined) ? responce_data.end_time : "23:00:00";
      $scope.display_in_appointment = (responce_data.id != undefined) ? ((responce_data.display == '') ? {} : JSON.parse(responce_data.display)) : {};
      $scope.value_which_pass_in_block_duration = moment.duration($scope.time_SlotDuration).asMinutes();
      $scope.yellow_time_line = (responce_data.id != undefined) ? ((responce_data.time_line == 0) ? false : true) : false;



      $scope.worker_list(0);


      // alert(duration)

    }).catch(function (request, status, errorThrown) {
    });
  }
  $scope.fetch_calendar_setting()


  $scope.worker_list = function (worker_id) {
    
    //getOnly single worker if worker login with role id 2
    if($rootScope.userdata.role_id == 2){
      worker_id = $rootScope.userdata.id;
    }else{
      worker_id = worker_id;
    }

    $http.get(APP.API + 'worker_list_for_calendar/' + worker_id
    ).then(function (response) {
      try {
        if (response.data.status == "401") {
          restSessionOut.getRstOut();
        }
      } catch (err) { }

      $scope.extra_working_hours = response.data.extra_working_hour;
      $scope.filteredResources = response.data.data;
      $scope.select_worker = response.data.all_worker;
      if (($scope.filteredResources).length > 0) {
        $scope.appointments_list()
        $scope.worker.id = $scope.filteredResources[0].id;
      } else {
        $scope.whenWorkerLessThanOne();
      }

    }).catch(function (request, status, errorThrown) {
    });
  }

  //$scope.worker_list(0);

  $scope.appointments_list = function () {

    switch ($scope.default_view) {

      case "resourceDay":

        var set_date, go_date;
        var api_link = 'list_appointment';
        if ($scope.current_date.date == undefined) {
          var cdate = 0
          set_date = go_date = $scope.current_date.go_date;
        } else {
          if (typeof ($scope.current_date.date) == 'string') {
            var cdate = $scope.current_date.date
            set_date = go_date = $scope.current_date.go_date;
          } else {

            //  console.log('$scope.current_date.date', $scope.current_date.date);

            if ($scope.current_date.date._d == undefined) {
              var year = $scope.current_date.date.getFullYear();
              var month = (($scope.current_date.date.getMonth() + 1).length < 2) ? '0' + ($scope.current_date.date.getMonth() + 1) : ($scope.current_date.date.getMonth() + 1);
              var day = (($scope.current_date.date.getDate()).length < 2) ? '0' + $scope.current_date.date.getDate() : $scope.current_date.date.getDate();
              var cdate = year + "-" + month + "-" + day
              set_date = go_date = $scope.current_date.go_date;
            } else {
              // console.log('$scope.current_date.date', $scope.current_date.date._d);

              var year = $scope.current_date.date._d.getFullYear();
              var month = (($scope.current_date.date._d.getMonth() + 1).length < 2) ? '0' + ($scope.current_date.date._d.getMonth() + 1) : ($scope.current_date.date._d.getMonth() + 1);
              var day = (($scope.current_date.date._d.getDate()).length < 2) ? '0' + $scope.current_date.date._d.getDate() : $scope.current_date.date._d.getDate();
              var cdate = year + "-" + month + "-" + day
              set_date = go_date = $scope.current_date.date._d;

            }

          }

        }

        var form_data = { date: cdate }
        allEvents = [];


        break;

      case "agendaWeek":
        var firstday = $scope.interval_Start_End.start.format("YYYY-MM-DD");
        var lastday = $scope.interval_Start_End.end.format("YYYY-MM-DD");

        var form_data = { worker_id: $scope.worker.id, firstday_of_week: firstday, lastday_of_week: lastday }
        var api_link = 'list_appointment_by_worker';
        var set_date, go_date;
        set_date = go_date = $scope.current_date.date;
        allEvents = [];

        break;

      case "agendaDay":
        if (typeof ($scope.current_date.date) == 'string') {
          var cdate = $scope.current_date.date
          var form_data = { worker_id: $scope.worker.id, firstday_of_week: cdate, lastday_of_week: cdate }
        } else {
          var year = $scope.current_date.date.getFullYear();
          var month = (($scope.current_date.date.getMonth() + 1).length < 2) ? '0' + ($scope.current_date.date.getMonth() + 1) : ($scope.current_date.date.getMonth() + 1);
          var day = (($scope.current_date.date.getDate()).length < 2) ? '0' + $scope.current_date.date.getDate() : $scope.current_date.date.getDate();
          var cdate = year + "-" + month + "-" + day
          var form_data = { worker_id: $scope.worker.id, firstday_of_week: cdate, lastday_of_week: cdate }
        }
        var api_link = 'list_appointment_by_worker';
        var set_date, go_date;
        set_date = go_date = $scope.current_date.go_date;
        allEvents = [];
        break;
    }

    $http.post(APP.API + api_link, form_data
    ).then(function (response) {
      try {
        if (response.data.status == "401") {
          restSessionOut.getRstOut();
        }
      } catch (err) { }
      $scope.appointments = response.data.data

      var full_name = '';
      var service_name = '';
      var address = '';
      var postal_code = '';
      var comments = '';
      var price = '';
      var mobile = '';
      var location = '';
      var booked_by = '';
      var customer_comments = '';



      for (var i = 0; i < $scope.appointments.length; i++) {

        if ($scope.appointments[i].customer != undefined) {

          if ($scope.appointments[i].customer.id != 0) {
            // full_name = ($scope.appointments[i].customer.firstname == null) ? '' : $scope.appointments[i].customer.firstname
            //   + " " + ($scope.appointments[i].customer.lastname == null) ? '' : $scope.appointments[i].customer.lastname;


            full_name = $scope.appointments[i].customer.firstname + " " + $scope.appointments[i].customer.lastname;
            service_name = '<br>' + $scope.appointments[i].service.name;
            mobile = ($scope.display_in_appointment.phone == true) ? (($scope.appointments[i].customer.mobile == null) ? '' : $scope.appointments[i].customer.mobile) : '';
            if(mobile){
              mobile = ((mobile.toString().match(/.{1,2}/g)).join(' '));
            }
            location = ($scope.display_in_appointment.location == true) ? (($scope.appointments[i].customer.city == null) ? '' : $scope.appointments[i].customer.city + '<br>') : '';

            address = ($scope.display_in_appointment.address == true) ?
              (($scope.appointments[i].customer.address == null) ? '' : $scope.appointments[i].customer.address) + " " +
              (($scope.appointments[i].customer.house_no == null) ? '' : $scope.appointments[i].customer.house_no) + '<br>' : '';
            postal_code = ($scope.display_in_appointment.postcode == true) ?
              (($scope.appointments[i].customer.postal_code == null) ? '' : $scope.appointments[i].customer.postal_code + '<br>') : '';
            customer_comments = ($scope.display_in_appointment.customer_comments == true) ? (($scope.appointments[i].customer.comments == null) ? '' : $scope.appointments[i].customer.comments) + '<br>' : '';
            comments = ($scope.display_in_appointment.comments == true) ? (($scope.appointments[i].comments == null) ? '' : $scope.appointments[i].comments) + '<br>' : '';
            price = ($scope.display_in_appointment.price == true) ? '<i class="fa fa-inr"></i>' + $scope.appointments[i].service.sales_price + '<br>' : '';

            // allEvents.push({
            //   'full_data': $scope.appointments[i],

            //   'title': ($scope.appointments[i].service_duration > 40) ? ('<strong>' + full_name + '</strong><p>' + address + postal_code + location + mobile + price + comments + customer_comments + '</p>') : $scope.appointments[i].customer.firstname,
            //   'start': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].start_time,
            //   'end': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].end_time, resourceId: $scope.appointments[i].worker_id,
            //   'borderColor': $scope.appointments[i].service.service_category.color,



            //   'backgroundColor': ($scope.appointments[i].appointment_status_color == undefined) ? '' : $scope.appointments[i].appointment_status_color.status_color,

            // });


            if ($scope.cancel_appointment_show) {

              var _title = '';
              if($scope.appointments[i].appointment_status_id != 5){
                _title = ('<strong id="'+$scope.appointments[i].id+'">' + full_name + '' + service_name + '</strong><p>' + address + postal_code + location + mobile + '<br>' + price + comments + customer_comments + '</p>');
              }else{
                _title = ('<strong style="color:#000000;" id="'+$scope.appointments[i].id+'">' + full_name + '' + service_name + '</strong><p style="color:#000000;">' + address + postal_code + location + mobile + '<br>' + price + comments + customer_comments + '</p>');
              }
              allEvents.push({
                'full_data': $scope.appointments[i],
                'title': _title,
                'start': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].start_time,
                'end': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].end_time, resourceId: $scope.appointments[i].worker_id,
                //'borderColor': $scope.appointments[i].service.service_category.color,

               // 'backgroundColor': ($scope.appointments[i].service.service_category == undefined) ? '' : $scope.appointments[i].service.service_category.color,

               'backgroundColor': ($scope.appointments[i].service.service_category == undefined) ? '' : (($scope.appointments[i].appointment_status_id != 5) ? $scope.appointments[i].service.service_category.color : $scope.LightenDarkenColor($scope.appointments[i].service.service_category.color,120)),

              });

            } else {

              if ($scope.appointments[i].appointment_status_id != 5) {
                allEvents.push({
                  'full_data': $scope.appointments[i],
                  'title': ('<strong id="'+$scope.appointments[i].id+'">' + full_name + '' + service_name + '</strong><p>' + address + postal_code + location + mobile + '<br>' + price + comments + customer_comments + '</p>'),
                  'start': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].start_time,
                  'end': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].end_time, resourceId: $scope.appointments[i].worker_id,
                  //'borderColor': $scope.appointments[i].service.service_category.color,

                  'backgroundColor': ($scope.appointments[i].service.service_category == undefined) ? '' : $scope.appointments[i].service.service_category.color,
                });
              }
            }


          }
        } else {


          if ($scope.appointments[i].customer_id == 0 && $scope.appointments[i].service_id == 0) {
            allEvents.push({
              'full_data': $scope.appointments[i],
              'title': '<p id="'+$scope.appointments[i].id+'">' + $scope.appointments[i].block_time_description + '</p>',
              'start': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].start_time,
              'end': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].end_time,
              resourceId: $scope.appointments[i].worker_id,
              //'borderColor': '#8c8c8c',
              'backgroundColor': '#8c8c8c'
            });
          } else {

            // allEvents.push({
            //   'full_data': $scope.appointments[i],
            //   'title': '<p>' + $scope.appointments[i].block_time_description + '</p>',
            //   'start': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].start_time,
            //   'end': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].end_time,
            //   resourceId: $scope.appointments[i].worker_id,
            //   'borderColor': '#8c8c8c',
            //   'backgroundColor': '#8c8c8c'
            // });



            if ($scope.cancel_appointment_show) {

              allEvents.push({
                'full_data': $scope.appointments[i],
                'title': ('<strong id="'+$scope.appointments[i].id+'">Walk In</strong><p>' + $scope.appointments[i].service.name + '</p>'),
                'start': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].start_time,
                'end': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].end_time, resourceId: $scope.appointments[i].worker_id,
                //'borderColor': $scope.appointments[i].service.service_category.color,
                'backgroundColor': ($scope.appointments[i].service.service_category == undefined) ? '' : $scope.appointments[i].service.service_category.color,
              });

            } else {

              if ($scope.appointments[i].appointment_status_id != 5) {

                allEvents.push({
                  'full_data': $scope.appointments[i],
                  'title': ('<strong id="'+$scope.appointments[i].id+'">Walk In</strong><p>' + $scope.appointments[i].service.name + '</p>'),
                  'start': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].start_time,
                  'end': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].end_time, resourceId: $scope.appointments[i].worker_id,
                  //'borderColor': $scope.appointments[i].service.service_category.color,
                  'backgroundColor': ($scope.appointments[i].service.service_category == undefined) ? '' : $scope.appointments[i].service.service_category.color,
                });

              }

            }

          }

        }
      }
      $scope.calendar();
      $('#calendar').fullCalendar('gotoDate', go_date);
      $("#hiddenField").datepicker('setDate', new Date(set_date));
      $("#ui-datepicker-div").hide();

    }).catch(function (request, status, errorThrown) {
    });


  }


  $('.pagemain-content').css("margin-left", "265px");

  $scope.selectWorker = function () {
    $scope.worker_list($scope.worker.id)
  }

  $scope.scroll = 0;
  function loadEventColor(){
    $timeout(function() {
        
      for (var i = 0; i < $scope.appointments.length; i++) {
        $('#'+$scope.appointments[i].id).parent().prev().css('backgroundColor',($scope.appointments[i].appointment_status_color == undefined) ? '#8c8c8c' : $scope.appointments[i].appointment_status_color.status_color);
      }
    },100);
  }
  var promise1;
  $scope.start1 = function () {
    $scope.stop1();
    promise1 = $interval(loadEventColor, (500));
  };

  // stops the interval
  $scope.stop1 = function () {
    $interval.cancel(promise1);
  };

  // starting the interval by default
  $scope.start1();
  $scope.$on('$destroy', function () {
    $scope.stop1();
  });

  $timeout(function() {
      //activate single worker mode if mobile device
      if($(window).width() < 768){
        $('.fc-agendaDay-button').trigger('click') 
      }
    },500);
  $scope.calendar = function () {

    /*
                                    There is no resourceDay in fullcalender we add below line
                                    
                                    "r.defineView("resourceDay",{type:"agenda",duration:{days:1}})" 
                                    
                                    in fullcalendar.min.js to run resourceDay by default
    
    */



    jQuery("#calendar").fullCalendar("destroy");
    if ($scope.default_view == 'agendaWeek') {
      $('body').removeClass('agendaview');
      $('body').addClass('weekview');
    }
    else if ($scope.default_view == 'agendaDay') {
      $('body').removeClass('weekview');
      $('body').addClass('agendaview');
    }
    else {
      $('body').removeClass('agendaview');
      $('body').removeClass('weekview');
    }
    $("#calendar").fullCalendar({


      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'agendaWeek,agendaDay',

      },
      views: {

        week: {
          columnFormat: 'DD-MM'
        }

      },
      titleFormat: 'dddd D MMMM YYYY',
      navLinks: true,
      editable: true,
      defaultView: $scope.default_view,
      eventLimit: true,
      nowIndicator: true,
      selectable: true,
      groupByResource: true,
      allDaySlot: false,
      minTime: $scope.min_Time,
      maxTime: $scope.max_Time,
      slotLabelFormat: ['HH:mm'],
      slotDuration: $scope.time_SlotDuration,
      timeFormat:'H:mm',
     // height: 'auto',


      // slotDuration: '01:00:00',
      slotLabelInterval: ($scope.time_SlotDuration == '01:00:00') ? '' : parseInt(($scope.time_SlotDuration.split(":"))[1]),



      resources: $scope.filteredResources,
      events: allEvents,
      selectHelper: true,
      eventLimit: true,
      eventOverlap: true,
      allDay: false,
      firstDay: $scope.week_Firstday,
      _isUTC: false,
      //selectConstraint:false,
      //   views: {
      //     agendaWeek: {
      //       slotLabelFormat: 'dddd D M',
      //     }
      // },

      resourceRender: function (resourceObj, labelTds, bodyTds) {
        labelTds.on('click', function (event) {
          $scope.default_view = "agendaWeek";
          $scope.worker_list(resourceObj.id)
        });
      },


      eventRender: function (event, element) {
        element.find('.fc-title').html(event.title);
      },



      select: function (start, end, jsEvent, view, vista) {

        // console.log('vista',vista)
        var format = 'hh:mm:ss'
        var is_between = false
        var starttime = start.format("HH:mm:ss");
        var current_day_working_hours = []
        var is_event_service_available = false;


        vista.businessHours.find(function (business_hour) {
          if (business_hour.dow[0] == start._d.getUTCDay()) {
            current_day_working_hours.push(business_hour)
          }
        })


        current_day_working_hours.find(function (business_hour) {

          var time = moment(starttime, format),
            beforeTime = moment(business_hour.start, format),
            afterTime = moment(business_hour.end, format);
          if (time.diff(beforeTime) == 0) {
            is_between = true;
          } else if (time.isBetween(beforeTime, afterTime)) {

            is_between = true;

          }
        })

        // console.log('$scope.rebookAppointment',$scope.rebookAppointment)

        if ($scope.rebookAppointment.full_data != undefined) {

          const service_ids = vista.user_services.map(function (i) { return i.service_id });
          const index = service_ids.findIndex(function (id) { return id == $scope.rebookAppointment.full_data.service_id; })
          is_event_service_available = (index != -1) ? true : false;
          $scope.combineFnFor_eventDrop_rebookAppointment($scope.rebookAppointment, '', start, vista.id, is_between, is_event_service_available, jsEvent)
        } else {

          if (is_between == true) {

            $scope.createAppointmentModalOpen(vista, start, end)

          } else {
          
            if($scope.userdata.role_id == 3) {
              return;
            }
            modalProvider
              .openPopupModal(
                APP.VIEW_PATH + 'calendar/extraWorkingHoursModalContent.html',
                'extraWorkingHoursCtrl',
                'sm',
                $scope.data_inside_modal = {
                  worker_id: vista.id,
                  appointment_date: start.format("YYYY-MM-DD HH:mm"),
                  appointment_date_for_day_index: start.format("YYYY-MM-DD"),
                  start_time: start.format("HH:mm"),
                  end_time: end.format("HH:mm"),
                  duration: block_duration.blockDuration($scope.value_which_pass_in_block_duration),
                  //  dayindex = start._d.getUTCDay()

                },
                {
                  'success': function (state, title, msg) {
                    $scope.clearAllExtraTimeBlock(state, title, msg);
                  }
                },
              )
          }

        }

      },


      viewRender: function (view, element) {
        
        $scope.interval_Start_End = { start: view.intervalStart, end: view.intervalEnd }

        try {
          setTimeline();
        } catch (err) { }
        if (view.name == 'agendaWeek') {
          $scope.default_view = "agendaWeek";
          $timeout(function () {
            $scope.workers_dropdown = true;
            $('.calendar').removeClass('calendar-margin');
            $('.fc-agenda-slots').removeClass('fc-agenda-slots-margin');
            jQuery('.fc-button-customeView').removeClass('fc-state-active');



            setTimeout(function () {
              //   console.log('$scope.filteredResources',$scope.filteredResources);



              var per_width = (100 / 7).toFixed(2);
              var i;
              $('.fc-slats table tr').each(function () {
               
                var tdData = $(this).find("td.fc-widget-content:eq( 1 )");
                var newDiv = '';
                for (i = 1; i <= 7; i++) {
                  //text += cars[i] + "<br>";

                  newDiv += '<div class="test" style="width:14.20%;float:right"></div>';

                  // newDiv += '<div style="width:14.35%;float:right">'+i+'</div>';
                }
                tdData.append(newDiv);

              });
            }, 1000)





          });

          //alert('agendaWeek');

        } else if (view.name == 'agendaDay') {
          $scope.default_view = "agendaDay";
          $timeout(function () {
            $scope.workers_dropdown = true;
            $('.calendar').removeClass('calendar-margin');
            $('.fc-agenda-slots').removeClass('fc-agenda-slots-margin');
            jQuery('.fc-button-customeView').removeClass('fc-state-active');

            // $('.fc-agendaWeek-view .fc-slats table tbody tr').each(function() {  });
          });
        } else {
          $timeout(function () {
            $scope.workers_dropdown = false;
            $scope.default_view = "resourceDay";
            $('.calendar').addClass('calendar-margin');
            $('.fc-agenda-slots').addClass('fc-agenda-slots-margin');
            jQuery(this).addClass('fc-state-active');
            var per_width = (100 / $scope.filteredResources.length);
            var i;
            $('.fc-view-container .fc-slats table tr').each(function () {
              var tdData = $(this).find(".fc-widget-content:eq( 1 )");
              var newDiv = '';
              for (i = 0; i < $scope.filteredResources.length; i++) {
                //text += cars[i] + "<br>";
                newDiv += '<div class="test" style="width:' + per_width + '%"></div>';
              }
              tdData.append(newDiv);
            });

          });
        }
        // makeEventsDraggable();
      },
      eventMouseover: function (event, jsEvent, view) {

        if (event.title != "extra time" && event.full_data.service_id != 0) {
          const START_TIME = event.start.format("HH:mm");
          const END_TIME = event.end.format("HH:mm");
          const FULL_APPOINTMENT_DATA = event.full_data;
          const tooltip_status = FULL_APPOINTMENT_DATA.appointment_status_color.appointment_status.status_name;
          const tooltip_full_name = ((FULL_APPOINTMENT_DATA.customer == undefined) ? 'Walk' : FULL_APPOINTMENT_DATA.customer.firstname) + " " + ((FULL_APPOINTMENT_DATA.customer == undefined) ? 'In' : FULL_APPOINTMENT_DATA.customer.lastname);
          const tooltip_address = (FULL_APPOINTMENT_DATA.customer == undefined) ? null : FULL_APPOINTMENT_DATA.customer.address;
          const tooltip_postal_code = (FULL_APPOINTMENT_DATA.customer == undefined) ? null : FULL_APPOINTMENT_DATA.customer.postal_code;
          const tooltip_customer_comments = (FULL_APPOINTMENT_DATA.customer == undefined) ? null : FULL_APPOINTMENT_DATA.customer.comments;
          const tooltip_service_price = FULL_APPOINTMENT_DATA.service.sales_price;
          const tooltip_service_name = FULL_APPOINTMENT_DATA.service.name;
          const tooltip_mobile = (FULL_APPOINTMENT_DATA.customer == undefined) ? null : FULL_APPOINTMENT_DATA.customer.mobile;
          const tooltip_location = (FULL_APPOINTMENT_DATA.customer == undefined) ? null : FULL_APPOINTMENT_DATA.customer.city;
          const tooltip_booked_by = (FULL_APPOINTMENT_DATA.customer == undefined) ? null : FULL_APPOINTMENT_DATA.customer.comments;
          const tooltip_comments = FULL_APPOINTMENT_DATA.comments;

          if($scope.userdata.role_id != 3) {
            const __TOOLTIP = "<P>[" + tooltip_status + "]<br>" + START_TIME + "-" + END_TIME +

            ((tooltip_full_name == null) ? '' : "<br>" + tooltip_full_name + "<br>")
            + " " +
            (($scope.display_in_appointment.phone == true) ? ((tooltip_mobile == null) ? '' : (tooltip_mobile.toString().match(/.{1,2}/g)).join(' ') + "<br>") : '')
            + ((tooltip_service_name == null) ? '' : tooltip_service_name)
            +
            (($scope.display_in_appointment.price == true) ? ((tooltip_service_price == null) ? '' : "   (<i class='fa fa-inr'></i>" + tooltip_service_price + ")" + "<br>") : '')
            +
            (($scope.display_in_appointment.address == true) ? ((tooltip_address == null) ? '' : tooltip_address + "<br>") : '')
            +
            (($scope.display_in_appointment.postcode == true) ? ((tooltip_postal_code == null) ? '' : tooltip_postal_code) : '')
            + " " +
            (($scope.display_in_appointment.location == true) ? ((tooltip_location == null) ? '' : tooltip_location + "<br>") : '')
            +
            (($scope.display_in_appointment.customer_comments == true) ? ((tooltip_customer_comments == null) ? '' : tooltip_customer_comments + "<br>") : '')
            + ( ($scope.userdata && $scope.userdata.role_id == 1 || $scope.userdata.role_id == 2) ? ((tooltip_comments == null) ? '' : tooltip_comments) : '')
            /* + ((tooltip_comments == null) ? '' : tooltip_comments); */
            /*  (($scope.display_in_appointment.customer_comments == true) ? ((tooltip_customer_comments == null) ? '' : tooltip_customer_comments + "<br>") : '')
              + ((tooltip_comments == null) ? '' : tooltip_comments); */

            //   + ( ($scope.userdata && $scope.userdata.role_id == 1) ? ((tooltip_comments == null) ? '' : tooltip_comments) : '');
            // console

            var tooltip = '<div class="tooltipevent" style="padding:10px;width:190px;height:170px;color:#000;bottom:100%;left:50%;margin-left: -95px;position:absolute;z-index:10001;background-color:rgb(192,192,192);opacity:0.3;">' + __TOOLTIP + '</div>';



            var $tooltip = $(tooltip).appendTo('body');

            $(this).mouseover(function (e) {
              $tooltip.fadeIn('500');
              $tooltip.fadeTo('10', 1.9);
              $tooltip.css('margin-top','-15%');
              $(this).css('z-index', 10000);
              //$tooltip.css('position', 'absolute !important');
              
              
            }).mousemove(function (e) {
              $tooltip.css('top', e.pageY + 10);
              $tooltip.css('left', e.pageX + 20);
            });


            
          } else {
            const __TOOLTIP = "<P>[" + tooltip_status + "]<br>" + START_TIME + "-" + END_TIME +

            ((tooltip_full_name == null) ? '' : "<br>" + tooltip_full_name + "<br>")
            + " " +
            (($scope.display_in_appointment.phone == true) ? ((tooltip_mobile == null) ? '' : (tooltip_mobile.toString().match(/.{1,2}/g)).join(' ') + "<br>") : '')
            + 
            ((tooltip_service_name == null) ? '' : tooltip_service_name)
            /* (($scope.display_in_appointment.phone == true) ? ((tooltip_mobile == null) ? '' : (tooltip_mobile.toString().match(/.{1,2}/g)).join(' ') + "<br>") : '')
            + ((tooltip_service_name == null) ? '' : tooltip_service_name)
            +
            (($scope.display_in_appointment.price == true) ? ((tooltip_service_price == null) ? '' : "   (<i class='fa fa-inr'></i>" + tooltip_service_price + ")" + "<br>") : '')
            +
            (($scope.display_in_appointment.address == true) ? ((tooltip_address == null) ? '' : tooltip_address + "<br>") : '')
            +
            (($scope.display_in_appointment.postcode == true) ? ((tooltip_postal_code == null) ? '' : tooltip_postal_code) : '')
            + " " +
            (($scope.display_in_appointment.location == true) ? ((tooltip_location == null) ? '' : tooltip_location + "<br>") : '')
            +
            (($scope.display_in_appointment.customer_comments == true) ? ((tooltip_customer_comments == null) ? '' : tooltip_customer_comments + "<br>") : '')
            + ( ($scope.userdata && $scope.userdata.role_id == 1 || $scope.userdata.role_id == 2) ? ((tooltip_comments == null) ? '' : tooltip_comments) : '') */
            /* + ((tooltip_comments == null) ? '' : tooltip_comments); */
           /*  (($scope.display_in_appointment.customer_comments == true) ? ((tooltip_customer_comments == null) ? '' : tooltip_customer_comments + "<br>") : '')
            + ((tooltip_comments == null) ? '' : tooltip_comments); */

          //   + ( ($scope.userdata && $scope.userdata.role_id == 1) ? ((tooltip_comments == null) ? '' : tooltip_comments) : '');
          // console

            var tooltip = '<div class="tooltipevent" style="padding:10px;width:190px;height:170px;color:#000;bottom:100%;left:50%;margin-left: -95px;position:absolute;z-index:10001;background-color:rgb(192,192,192);opacity:0.3;">' + __TOOLTIP + '</div>';



            var $tooltip = $(tooltip).appendTo('body');

            $(this).mouseover(function (e) {
              $tooltip.fadeIn('500');
              $tooltip.fadeTo('10', 1.9);
              $tooltip.css('margin-top','-15%');
              $(this).css('z-index', 10000);
              //$tooltip.css('position', 'absolute !important');
              
              
            }).mousemove(function (e) {
              $tooltip.css('top', e.pageY + 10);
              $tooltip.css('left', e.pageX + 20);
            });
          }
          
        }

      },
      eventMouseout: function (calEvent, jsEvent) {
        $(this).css('z-index', 8);
        $('.tooltipevent').remove();
      },
      eventClick: function (event) {
        
        if($scope.userdata.role_id == 3) {
          return;
        } 
        var modal_size = ''
        var data_inside_modal = {};
        if ((event.full_data.block_time_type == "assign_task" || event.full_data.block_time_type == "absent") && (event.full_data.service_id == 0)) {
          modal_html_link = 'calendar/updateBlockTimeModalContent.html';
          modal_controller = 'blocktimeUpdateController';
          modal_size = 'lg';
          data_inside_modal = { full_data: event.full_data }
        } else if (event.full_data.dayindex != undefined) {
          modal_html_link = 'calendar/showExtraTimeModalContent.html';
          modal_controller = 'showExtraTimeCtrl';
          modal_size = 'sm';
          data_inside_modal = { full_data: event.full_data }
        } else {
          
          modal_html_link = 'calendar/showAppointmentModalContent.html';
          modal_controller = 'showAppointmentController';
          modal_size = 'lg';
          data_inside_modal = {
            full_data: event.full_data,
            services: $scope.services,
            service_categories: $scope.service_categories,
          };

        }

        modalProvider
          .openPopupModal(
            APP.VIEW_PATH + modal_html_link,
            modal_controller,
            modal_size,
            $scope.data_inside_modal = data_inside_modal,
            {
              'success': function (state, title, msg) {
                if (state == 'copy_data') {
                  /* In (msg) we will get all data in json */
                  $scope.copyAppointmentData(state, title, msg);
                  
                } else if (state == 'create_appointment') {
                  $scope.createAppointmentModalOpen(event.full_data, 0, 0, event.full_data.date, event.full_data.from_time.substring(0, 5), event.full_data.to_time.substring(0, 5))
                } else if (state == 'rebook_data') {

                  $scope.rebookAppointmentData(state, title, msg)
                } else if (state == 'to_pay') {
                  $scope.afterToPay(event.full_data)
                } else if (state == 'edit_appointment_data') {

                  $scope.editAppointmentData(state, title, msg);

                  //$scope.createAppointmentModalOpen(event.full_data, 0, 0, event.full_data.date, event.full_data.from_time.substring(0, 5), event.full_data.to_time.substring(0, 5))


                } else {
                  $scope.clearAll(state, title, msg);
                }

              }
            },
          )
      },
      eventDrop: function (event, delta, revertFunc, jsEvent, ui, view) {

        const event_service_id = event.full_data.service_id;
        var starttime = event.start.format("HH:mm:ss");

        if (event_service_id == 0) {

          $scope.data_inside_modal = {
            event: event,
          }
          $uibModal.open({
            templateUrl: APP.VIEW_PATH + 'calendar/blockTimeDragConfirmationModal.html',
            controller: 'blockTimeDragCtrl',
            size: '',
            resolve: {
              items: function () {
                if ($scope.data_inside_modal) {
                  return $scope.data_inside_modal;
                }
              },
              cb: {
                'success': function (state, title, msg) {

                  if (state == 'cancel') {
                    revertFunc();
                  } else if (state == 'success') {

                    $scope.clearAll(state, title, msg);
                  }

                }
              },

            }
          }).result.then(function () { }, function () { revertFunc(); });


        } else if (event_service_id == undefined) {

          $scope.data_inside_modal = {
            event: event,

          }

          $uibModal.open({
            templateUrl: APP.VIEW_PATH + 'calendar/extraTimeDragConfirmationModalContent.html',
            controller: 'extraTimeDragCtrl',
            size: '',
            resolve: {
              items: function () {
                if ($scope.data_inside_modal) {
                  return $scope.data_inside_modal;
                }
              },
              cb: {
                'success': function (state, title, msg) {

                  if (state == 'cancel') {


                    revertFunc()

                  } else if (state == 'success') {

                    $scope.clearAll(state, title, msg);
                  }

                }
              },

            }
          }).result.then(function () { }, function () { revertFunc(); });

        } else {

          var check_appointment_status = event.full_data.appointment_status_id;

          if (check_appointment_status == 4 || check_appointment_status == 5 || check_appointment_status == 3) {
            revertFunc();
          } else {

            var is_event_service_available = false;
            var current_day_working_hours = []
            var format = 'hh:mm:ss';
            var is_between = false;

            $http.get(APP.API + 'worker_list_for_calendar/' + event.resourceId
            ).then(function (response) {
              try {
                if (response.data.status == "401") {
                  restSessionOut.getRstOut();
                }
              } catch (err) { }
              const worker_where_we_drop = response.data.data[0];
              const service_ids = worker_where_we_drop.user_services.map(function (i) { return i.service_id });
              const index = service_ids.findIndex(function (id) { return id == event_service_id; })
              is_event_service_available = (index != -1) ? true : false;


              worker_where_we_drop.businessHours.find(function (business_hour) {
                if (business_hour.dow[0] == event.start._d.getUTCDay()) {
                  current_day_working_hours.push(business_hour)
                }
              })

              current_day_working_hours.find(function (business_hour) {
                var time = moment(starttime, format),
                  beforeTime = moment(business_hour.start, format),
                  afterTime = moment(business_hour.end, format);
                if (time.diff(beforeTime) == 0) {
                  is_between = true;
                } else if (time.isBetween(beforeTime, afterTime)) {

                  is_between = true;

                }
              })

              $scope.combineFnFor_eventDrop_rebookAppointment(event, revertFunc, 0, 0, is_between, is_event_service_available, jsEvent)

            })


          }


        }

      },
      eventResize: function (event, delta, revertFunc, jsEvent, ui, view) {

        const event_service_id = event.full_data.service_id;
        if (event_service_id == 0) {

          $scope.data_inside_modal = {
            event: event,
          }
          $uibModal.open({
            templateUrl: APP.VIEW_PATH + 'calendar/blockTimeResizeModalContent.html',
            controller: 'blockTimeDragCtrl',
            size: '',
            resolve: {
              items: function () {
                if ($scope.data_inside_modal) {
                  return $scope.data_inside_modal;
                }
              },
              cb: {
                'success': function (state, title, msg) {

                  if (state == 'cancel') {
                    revertFunc()


                  } else if (state == 'success') {

                    $scope.clearAll(state, title, msg);
                  }

                }
              },

            }
          }).result.then(function () { }, function () { revertFunc(); });


        } else if (event_service_id == undefined) {

          $scope.data_inside_modal = {
            event: event,
          }
          $uibModal.open({
            templateUrl: APP.VIEW_PATH + 'calendar/extraTimeResizeModalContent.html',
            controller: 'extraTimeDragCtrl',
            size: '',
            resolve: {
              items: function () {
                if ($scope.data_inside_modal) {
                  return $scope.data_inside_modal;
                }
              },
              cb: {
                'success': function (state, title, msg) {

                  if (state == 'cancel') {
                    $scope.rebookAppointment = {};
                    revertFunc()

                  } else if (state == 'success') {

                    $scope.clearAll(state, title, msg);
                  }

                }
              },

            }
          }).result.then(function () { }, function () { revertFunc(); });


        } else {

          var check_appointment_status = event.full_data.appointment_status_id;

          if (check_appointment_status == 4 || check_appointment_status == 5 || check_appointment_status == 3) {

            revertFunc();
          } else {

            var service = event.full_data.service;
            var starttime = event.start.format("HH:mm");
            var endtime = event.end.format("HH:mm");
            var date1 = moment(event.start.format('DD-MM-YYYY H:mm:ss'), 'DD-MM-YYYY H:mm:ss'),
              date2 = moment(event.end.format('DD-MM-YYYY H:mm:ss'), 'DD-MM-YYYY H:mm:ss');
            var duration = moment.duration(date2.diff(date1)).asMinutes();
            modal_html_link = 'calendar/appointmentResizeModalContent.html';
            modal_controller = 'appointmentResizeCtrl';
            var appointment_date = event.start.format('YYYY-MM-DD');

            $scope.data_inside_modal = {
              event: event,
              starttime: starttime,
              endtime: endtime,
              service_duration: duration

            }
            if (service.service_category.type == 1) {
              var request_data = { service_cat_id: service.service_category.id, service_id: service.id, appointment_date: appointment_date, starttime: starttime, endtime: endtime, duration: duration, no_of_apointment: service.service_category.no_of_appointment }

              $http.post(APP.API + 'check_same_appointment_for_machine', request_data
              ).then(function (response) {
                try {
                  if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                  }
                } catch (err) { }
                if (response.data.success != false) {
                  if ((response.data.data - 1) >= service.service_category.no_of_appointment) {

                    SweetAlert.swal({
                      title: "No machine available !!",
                      text: "You must need to choose other time slot for this machine service. Are you sure you want to continue ?",
                      // type: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#DD6B55",
                      confirmButtonText: "Yes",
                      closeOnConfirm: true,
                      closeOnCancel: true,
                      cancelButtonText: "No",
                    },

                      function (isConfirm) {
                        if (isConfirm) {
                          $uibModal.open({
                            templateUrl: APP.VIEW_PATH + modal_html_link,
                            controller: modal_controller,
                            size: '',
                            resolve: {
                              items: function () {
                                if ($scope.data_inside_modal) {
                                  return $scope.data_inside_modal;
                                }
                              },
                              cb: {
                                'success': function (state, title, msg) {

                                  if (state == 'cancel') {
                                    revertFunc();
                                  } else if (state == 'success') {
                                    notifications.Message(state, title, msg);
                                  }

                                  // $scope.clearDragController(state, title, msg);
                                }
                              },

                            }
                          }).result.then(function () { }, function () { revertFunc(); });

                        } else {
                          revertFunc();
                        }
                      });
                  } else {

                    $uibModal.open({
                      templateUrl: APP.VIEW_PATH + modal_html_link,
                      controller: modal_controller,
                      size: '',
                      resolve: {
                        items: function () {
                          if ($scope.data_inside_modal) {
                            return $scope.data_inside_modal;
                          }
                        },
                        cb: {
                          'success': function (state, title, msg) {

                            if (state == 'cancel') {
                              revertFunc();
                            } else if (state == 'success') {
                              notifications.Message(state, title, msg);
                            }

                            // $scope.clearDragController(state, title, msg);
                          }
                        },

                      }
                    }).result.then(function () { }, function () { revertFunc(); });

                  }
                }

              }).catch(function (request, status, errorThrown) {
              });
            } else {
              $uibModal.open({
                templateUrl: APP.VIEW_PATH + modal_html_link,
                controller: modal_controller,
                size: '',
                resolve: {
                  items: function () {
                    if ($scope.data_inside_modal) {
                      return $scope.data_inside_modal;
                    }
                  },
                  cb: {
                    'success': function (state, title, msg) {

                      if (state == 'cancel') {
                        revertFunc();
                      } else if (state == 'success') {
                        notifications.Message(state, title, msg);
                      }
                      // $scope.clearDragController(state, title, msg);
                    }
                  },
                }
              }).result.then(function () { }, function () { revertFunc(); });

            }

          }
        }

      },
      eventAfterAllRender: function (view) {
        document.querySelector('.fc-scroller').scrollTop = $scope.scroll
      },
      viewDestroy: function (view) {
        $scope.scroll = document.querySelector('.fc-scroller').scrollTop;
      },
    });
    

    
    jQuery('.fc-center').find("h2").addClass('text-extra-large');
    jQuery('.fc-center').find("h2").addClass('pointer');
    $("div.fc-clear").remove();
    var custom_buttons = '' + '   <input type="input" id="hiddenField" class="datepicker" />' + '';
    jQuery('.fc-center').parent('div').append(custom_buttons);

    $("#hiddenField").datepicker({
      showOn: "button",
      buttonText: '<i class="fa fa-calendar-check-o" ></i>',
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      onSelect: function (dateText, inst) {
        var d = $("#hiddenField").datepicker("getDate");
        //console.log('d',d);
        $scope.dt = d;


        
        $scope.week_no = moment(d, "MMDDYYYY").isoWeek();
        $scope.commonFunction(d)
      }
    });

    $(".fc-center").on("click", function () {
      $(this).siblings("input").datepicker("show");
    });


    // $("#hiddenField").datepicker({
    //   showOn: "button",
    //   buttonText: '<i class="fa fa-calendar-check-o" ng-click="clickOnCalendar()"></i>',
    //   dateFormat: 'dd/mm/yy',
    //   changeMonth: true,
    //   changeYear: true,
    //   onSelect: function (dateText, inst) {
    //     var d = $("#hiddenField").datepicker("getDate");
    //     $scope.dt = d;
    //     $scope.week_no = moment(d, "MMDDYYYY").isoWeek();
    //     $scope.commonFunction(d)
    //   }
    // });


    $('.fc-agenda-slots').addClass('fc-agenda-slots-margin');
    jQuery('.fc-agendaWeek-button').on('click', function () {
      $scope.current_date = { date: $('#calendar').fullCalendar('getDate').format("YYYY-MM-DD"), go_date: $('#calendar').fullCalendar('getDate') }
      $scope.worker_list($scope.worker.id);
      $scope.scroll = 0;
      document.querySelector('.fc-scroller').scrollTop = 0;

    })

    jQuery('.fc-agendaDay-button').on('click', function () {
      
      $scope.current_date = { date: $('#calendar').fullCalendar('getDate').format("YYYY-MM-DD"), go_date: $('#calendar').fullCalendar('getDate') };
      $scope.worker_list($scope.worker.id);
      $scope.scroll = 0;
      document.querySelector('.fc-scroller').scrollTop = 0;
    })


    // jQuery('.fc-button-customeView').on('click', function () {
    //   $scope.current_date = { date: $('#calendar').fullCalendar('getDate').format("YYYY-MM-DD"), go_date: $('#calendar').fullCalendar('getDate') }
    //   $scope.worker_list(0)
    //   alert()

    // })


    jQuery('.fc-left').prepend(
      jQuery('<span class="fc-header-space"></span><button type="button" class="fc-button fc-button-reloadView fc-state-default fc-corner-left fc-corner-left"><i class="fa fa-bars" aria-hidden="true"></i></button>')
        .on('click', function () {

          //console.log("jQuery('.calendarparts-left')",jQuery('.calendarparts-left.hide'));

          (jQuery('.calendarparts-left.hide').length == 1) ? jQuery('.calendarparts-left').removeClass('hide') : jQuery('.calendarparts-left').addClass('hide');

          (jQuery('.calendarparts-right.margin-left-0').length == 1) ? jQuery('.calendarparts-right').removeClass('margin-left-0') : jQuery('.calendarparts-right').addClass('margin-left-0');

          // jQuery('.calendarparts-right').addClass('margin-left-0');

        })
    );


    jQuery('.fc-right').find(".fc-button-group").prepend(
      jQuery('<button type="button" class="fc-button fc-button-customeView fc-state-default fc-state-active fc-corner-left fc-corner-left">Team</button>')
        .on('click', function () {
          
          $scope.default_view = "resourceDay";
          $scope.worker_list(0);
          $scope.scroll = 0;
          document.querySelector('.fc-scroller').scrollTop = 0;
          //$('#calendar').fullCalendar('changeView', 'resourceDay');

        })
    );

    jQuery('.fc-prev-button').on('click', function () {
      $scope.dt = $('#calendar').fullCalendar('getDate');
      $scope.commonFunctionPrevNextTodayRefresh();
    })



    jQuery('.fc-next-button').on('click', function () {
      $scope.dt = $('#calendar').fullCalendar('getDate');
      //console.log('$scope.dt',$scope.dt);
      $scope.commonFunctionPrevNextTodayRefresh();
    })


    jQuery('.fc-today-button').on('click', function () {
      $scope.dt = new Date();
      $scope.commonFunctionPrevNextTodayRefresh();
    })

    jQuery('.fc-left').append(
      jQuery('<span class="fc-header-space"></span><button type="button" class="fc-button fc-button-reloadView fc-state-default fc-corner-left fc-corner-left"><i class="fa fa-refresh" aria-hidden="true"></i></button>')
        .on('click', function () {

          // console.log('fc-button-reloadView',moment($('#calendar').fullCalendar('getDate')._d).format('YYYY-MM-DD')    )
          $scope.dt = new Date($('#calendar').fullCalendar('getDate')._d.getUTCFullYear(), $('#calendar').fullCalendar('getDate')._d.getUTCMonth(), $('#calendar').fullCalendar('getDate')._d.getUTCDate())
          //$('#calendar').fullCalendar('getDate')._d.getUTCDate();
          
          
          
          $scope.commonFunctionPrevNextTodayRefresh();

        })
    );



    $scope.commonFunctionPrevNextTodayRefresh = function () {

      $scope.week_no = moment(new Date($('#calendar').fullCalendar('getDate')), "MMDDYYYY").isoWeek();
      if ($scope.default_view == "resourceDay") {
        $scope.current_date = { date: $('#calendar').fullCalendar('getDate').format("YYYY-MM-DD"), go_date: $('#calendar').fullCalendar('getDate') }
        $scope.worker_list(0)
      } else if ($scope.default_view == "agendaWeek") {
        $scope.current_date = { date: $('#calendar').fullCalendar('getDate') }
        $scope.worker_list($scope.worker.id)
      } else if ($scope.default_view == "agendaDay") {
        $scope.current_date = { date: $('#calendar').fullCalendar('getDate').format("YYYY-MM-DD"), go_date: $('#calendar').fullCalendar('getDate') }
        $scope.worker_list($scope.worker.id)
      }
    }


    //$scope.filteredResources[0].businessHours.push({ dow: [2], start: "09:00:00", end: "10:00:00" })



    // alert($('#calendar').fullCalendar('getDate').format("YYYY-MM-DD"));

    angular.forEach($scope.extra_working_hours, function (single_hours) {

      if (single_hours.date == $('#calendar').fullCalendar('getDate').format("YYYY-MM-DD")) {



        var worker_index = $scope.filteredResources.findIndex(function (single_worker) {
          return single_worker.id == single_hours.user_id;
        });

        $scope.filteredResources[worker_index].businessHours.push({ dow: [single_hours.dayindex], start: single_hours.from_time, end: single_hours.to_time });


      }


    });



  }

  $scope.createAppointmentModalOpen = function (
    
    _worker,
    _start,
    _end,
    _date_from_extra_working_hours,
    _start_time_from_extra_working_hours,
    _end_time_from_extra_working_hours) {

    if($scope.userdata.role_id == 3) {
      return;
    }
    const service_ids = _worker.user_services.map(function (i) { return i.service_id });
    const filter_services = $scope.services.filter(function (services) { return service_ids.includes(services.id) });
    const category_ids = filter_services.map(x => x.category_id);
    category_ids.filter((v, i) => category_ids.indexOf(v) == i);
    const filter_services_categories = $scope.service_categories.filter(function (service_category) {
      return category_ids.includes(service_category.id);
    })

    // console.log('filter_services', filter_services)
    // console.log('filter_services_categories', filter_services_categories)
    // console.log('_worker', _worker)

    modalProvider
      .openPopupModal(
        APP.VIEW_PATH + 'calendar/addAppointmentModalContent.html',
        'appointmentAddController',
        'lg',
        $scope.data_inside_modal = {
          services: filter_services,
          service_categories: filter_services_categories,
          durations: duration.displyaDuration(480),


          worker_id: (_worker.user_id == undefined) ? _worker.id : _worker.user_id,
          appointment_date: (_start != 0) ? _start.format("YYYY-MM-DD HH:mm") : _date_from_extra_working_hours,
          start_time: (_start != 0) ? _start.format("HH:mm") : _start_time_from_extra_working_hours,
          end_time: (_end != 0) ? _end.format("HH:mm") : _end_time_from_extra_working_hours,
          display_date: (_start != 0) ? _start._d : new Date(_date_from_extra_working_hours),

          full_data: ($scope.copyAppointment.id != undefined) ? $scope.copyAppointment : {},
          is_it_copy: ($scope.copyAppointment.id != undefined) ? 'yes' : 'no',



          // worker_id: vista.id,
          // appointment_date: start.format("YYYY-MM-DD HH:mm"),
          // start_time: start.format("HH:mm"),
          // end_time: end.format("HH:mm"),
          // display_date:start._d,
          // full_data:($scope.copyAppointment.id != undefined) ? $scope.copyAppointment : {},
          // is_it_copy:($scope.copyAppointment.id != undefined) ? 'yes':'no',




        },
        {
          'success': function (state, title, msg) {
            $scope.clearAll(state, title, msg);
          }
        },
      )
  }

  $scope.combineFnFor_eventDrop_rebookAppointment = function (event, revertFunc, start, new_worker_id, is_between, is_event_service_available, jsEvent) {

    var service = event.full_data.service;
    var starttime = (start == 0) ? event.start.format("HH:mm") : start.format("HH:mm");    
    var service_duration = event.full_data.service.duration;
    var endtime = (start == 0) ? event.end.format("HH:mm") : (moment(start.format("HH:mm"), "H:mm")).add(service_duration, 'm').format("HH:mm");
    var display_date = (start == 0) ? event.start.format('DD-MM-YYYY H:mm:ss') : start.format('DD-MM-YYYY H:mm:ss');
    var appointment_date = (start == 0) ? event.start.format('YYYY-MM-DD') : start.format('YYYY-MM-DD');
    var worker_id = (start == 0) ? event.resourceId : new_worker_id;
    modal_html_link = 'calendar/appointmentDragConfirmationModalContent.html';
    modal_controller = 'appointmentDragConfirmationCtrl';

    $scope.data_inside_modal = {
      event: event,
      starttime: starttime,
      endtime: endtime,
      display_date: display_date,
      appointment_date: appointment_date,
      worker_id: worker_id,
      is_between: is_between,
      is_event_service_available: is_event_service_available

    }

    if (service.service_category.type == 1) {
      var request_data = { service_cat_id: service.service_category.id, service_id: service.id, appointment_date: appointment_date, starttime: starttime, endtime: endtime, duration: service_duration, no_of_apointment: service.service_category.no_of_appointment }

      $http.post(APP.API + 'check_same_appointment_for_machine', request_data).then(function (response) {

        try {
          if (response.data.status == "401") {
            restSessionOut.getRstOut();
          }
        } catch (err) { }

        if (response.data.success != false) {
          if ((response.data.data - 1) >= service.service_category.no_of_appointment) {

            SweetAlert.swal({
              title: "No machine available !!",
              text: "You must need to choose other time slot for this machine service. Are you sure you want to continue ?",
              // type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes",
              closeOnConfirm: true,
              closeOnCancel: true,
              cancelButtonText: "No",
            },

              function (isConfirm) {
                if (isConfirm) {

                  $uibModal.open({
                    templateUrl: APP.VIEW_PATH + modal_html_link,
                    controller: modal_controller,
                    size: '',
                    resolve: {
                      items: function () {
                        if ($scope.data_inside_modal) {
                          return $scope.data_inside_modal;
                        }
                      },
                      cb: {
                        'success': function (state, title, msg) {

                          if (state == 'cancel') {
                            $scope.rebookAppointment = {};
                            (start == 0) ? revertFunc() : '';

                          } else if (state == 'success') {

                            $scope.clearAll(state, title, msg);
                          }

                        }
                      },

                    }
                  }).result.then(function () { }, function () { revertFunc(); });

                } else {
                  $scope.rebookAppointment = {};
                  (start == 0) ? revertFunc() : '';
                }
              });
          } else {

            $uibModal.open({
              templateUrl: APP.VIEW_PATH + modal_html_link,
              controller: modal_controller,
              size: '',
              resolve: {
                items: function () {
                  if ($scope.data_inside_modal) {
                    return $scope.data_inside_modal;
                  }
                },
                cb: {
                  'success': function (state, title, msg) {

                    if (state == 'cancel') {
                      $scope.rebookAppointment = {};
                      (start == 0) ? revertFunc() : '';

                    } else if (state == 'success') {

                      $scope.clearAll(state, title, msg);
                    }

                  }
                },

              }
            }).result.then(function () { }, function () { revertFunc(); });

          }
        }

      }).catch(function (request, status, errorThrown) {
      });
    } else {
      $uibModal.open({
        templateUrl: APP.VIEW_PATH + modal_html_link,
        controller: modal_controller,
        size: '',
        resolve: {
          items: function () {
            if ($scope.data_inside_modal) {
              return $scope.data_inside_modal;
            }
          },
          cb: {
            'success': function (state, title, msg) {

              if (state == 'cancel') {
                $scope.rebookAppointment = {};
                (start == 0) ? revertFunc() : '';

              } else if (state == 'success') {

                $scope.clearAll(state, title, msg);
              }

            }
          },

        }
      }).result.then(function () { }, function () { revertFunc(); });
    }

  }


  $scope.calendarGoToDateFunc = function (d) {
    $scope.week_no = moment(d, "MMDDYYYY").isoWeek();
    $scope.commonFunction(d);

  }

  $scope.clickToday = function () {
    $scope.dt = new Date();
    var d = new Date();

    $scope.week_no = moment(new Date(), "MMDDYYYY").isoWeek();
    $scope.commonFunction(d);
  }


  $scope.click_week = 0;
  $scope.clickOnWeek = function (week_no) {
    var d = $('#calendar').fullCalendar('getDate');
    d = new Date(d)
    d.setDate(d.getUTCDate() + (7 * week_no));

    // console.log('__clickOnWeek',d)

    $scope.commonFunction(d)
    $scope.dt = d
    $scope.week_no = moment(d, "MMDDYYYY").isoWeek();
    $scope.click_week = ($scope.click_week + week_no);
  }
 

  $scope.commonFunction = function (d) {

    if ($scope.default_view == "resourceDay") {
      $scope.current_date = { date: d, go_date: d }
      $scope.worker_list(0)

    } else if ($scope.default_view == "agendaWeek") {
      $scope.current_date = { date: d }
      //    $scope.calendar();
      $scope.worker_list($scope.worker.id)

    } else if ($scope.default_view == "agendaDay") {
      $scope.current_date = { date: d, go_date: d }
      $scope.worker_list($scope.worker.id)

    }

  }


  $scope.copyAppointmentData = function (state, title, copy_data) {

    angular.copy(copy_data, $scope.copyAppointment);
      
    if($scope.copyAppointment && $scope.copyAppointment.id !== undefined) {
      $scope.customer_notification_show = true;
      $scope.customer_notification_msg = 'Now click on the calendar with the time slot to copy your appointment'
      $("#custom_notification_bar").addClass("show");   
    }
    //console.log('$scope.copyAppointment',$scope.copyAppointment)

  }


  $scope.editAppointmentData = function (state, title, edit_data) {

    const service_ids = edit_data.worker.user_services.map(function (i) { return i.service_id });
    const filter_services = $scope.services.filter(function (services) { return service_ids.includes(services.id) });
    const category_ids = filter_services.map(x => x.category_id);
    category_ids.filter((v, i) => category_ids.indexOf(v) == i);
    const filter_services_categories = $scope.service_categories.filter(function (service_category) {
      return category_ids.includes(service_category.id);
    })

    //console.log('edit_data',"edit appointment");

    //angular.copy(copy_data, $scope.copyAppointment);

    modalProvider
      .openPopupModal(
        APP.VIEW_PATH + 'calendar/addAppointmentModalContent.html',
        'appointmentAddController',
        'lg',
        $scope.data_inside_modal = {
          services: filter_services,
          service_categories: filter_services_categories,
          durations: duration.displyaDuration(480),
          worker_id: edit_data.worker.id,
          appointment_date: edit_data.appointment_date,
          start_time: edit_data.start_time,
          end_time: edit_data.end_time,
          display_date: new Date(edit_data.appointment_date),

          full_data: edit_data,
          is_it_copy: 'yes',
          is_it_for_upate: true

        },
        {
          'success': function (state, title, msg) {
            $scope.clearAll(state, title, msg);
          }
        },
      )


    //console.log('$scope.copyAppointment',$scope.copyAppointment)

  }



  $scope.rebookAppointmentData = function (state, title, rebook_data) {
    $scope.rebookAppointment = rebook_data
    if($scope.rebookAppointment && $scope.rebookAppointment.id !== undefined) {
      $scope.customer_notification_show = true;
      $scope.customer_notification_msg = 'Now click on the calendar with the time slot to rebook your appointment'
      $("#custom_notification_bar").addClass("show");   
    }
  }

  $scope.openAside = function (position) {

    modalProviderLeft.leftsidePopupModal(
      APP.VIEW_PATH + 'calendar/settingAppointmentModalContent.html',
      'appointmentSettingController',
      'sm',
      $scope.data_inside_left_modal = {
        appointment_statuslist: $scope.appointment_status,
        duration: block_duration.blockDuration($scope.value_which_pass_in_block_duration)
      },
      {
        'success': function (state, title, msg) {
          (state != 'on_close') ? notifications.Message(state, title, msg) : '';
          $scope.clearLeftModal(state, title, msg);
        }
      },
      position
    )

  };

  $scope.afterToPay = function (appointment_data) {


    if ($scope.default_view == "resourceDay") {
      $scope.worker_list(0)
    } else if ($scope.default_view == "agendaWeek") {
      $scope.worker_list($scope.worker.id)
    } else if ($scope.default_view == "agendaDay") {
      $scope.worker_list($scope.worker.id)
    }

    storeAppointmentData.set(appointment_data);
    $state.go('app.pages.cashdesk', {});

  }

  $scope.clearLeftModal = function (state, title, msg) {
    if (state == 'on_close') {

      if ($scope.default_view == "resourceDay") {
        $scope.worker_list(0)
      } else if ($scope.default_view == "agendaWeek") {

        $scope.worker_list($scope.worker.id)
      } else if ($scope.default_view == "agendaDay") {

        $scope.worker_list($scope.worker.id)
      }
    } else if (state == 'success') {

      //notifications.Message(state,title,msg)
      $timeout(reloadCurrentPage, 2000);

    }

  }


  function reloadCurrentPage() {
    window.location.reload();
    //$state.go($state.$current, null, { reload: true });
  }





  var promise;
  $scope.start = function () {
    $scope.stop();
    promise = $interval(reloadCalendar, (4*(1000*60)));
  };

  // stops the interval
  $scope.stop = function () {
    $interval.cancel(promise);
  };

  // starting the interval by default
  $scope.start();
  $scope.$on('$destroy', function () {
    $scope.stop();
  });



  // $interval(reloadCalendar, 10000)

  function reloadCalendar() {

    if (($scope.filteredResources).length > 0) {
      //  console.log('$scope.default_view',$scope.default_view);
      if ($scope.default_view == "resourceDay") {
        $scope.worker_list(0)
      } else if ($scope.default_view == "agendaWeek") {
        $scope.worker_list($scope.worker.id)
      } else if ($scope.default_view == "agendaDay") {
        $scope.worker_list($scope.worker.id)
      }

    }

  }


  $scope.cancelAppointment = function () {
    $scope.cancel_appointment_show = ($scope.cancel_appointment_show == false) ? true : false;
    if (($scope.filteredResources).length > 0) {

      //  console.log('$scope.default_view',$scope.default_view);
      if ($scope.default_view == "resourceDay") {
        $scope.worker_list(0)
      } else if ($scope.default_view == "agendaWeek") {
        $scope.worker_list($scope.worker.id)
      } else if ($scope.default_view == "agendaDay") {
        $scope.worker_list($scope.worker.id)
      }

    }


  }




  $scope.list_service_category = function () {
    var service_categories = []
    $http.get(APP.API + 'list_service_category_forselect'
    ).then(function (response) {
      try {
        if (response.data.status == "401") {
          restSessionOut.getRstOut();
        }
      } catch (err) { }
      angular.forEach(response.data.data, function (service_cat) {
        service_categories.push(service_cat)
      });
      $scope.service_categories = service_categories
      //console.log('response.data.data',$scope.service_categories)
    }).catch(function (request, status, errorThrown) {

    });
  }

  $scope.list_service = function () {

    $http.get(APP.API + 'list_service'
    ).then(function (response) {
      try {
        if (response.data.status == "401") {
          restSessionOut.getRstOut();
        }
      } catch (err) { }

      $scope.services = response.data.data;
      // console.log('return_dataservices', $scope.services);
    }).catch(function (request, status, errorThrown) {

    });

  }

  $scope.appointment_status_list = function () {

    $http.get(APP.API + 'list_appointment_status'
    ).then(function (response) {
      try {
        if (response.data.status == "401") {
          restSessionOut.getRstOut();
        }
      } catch (err) { }
      $scope.appointment_status = response.data.data;

    }).catch(function (request, status, errorThrown) {

    });


  }

  $scope.appointment_status_list();
  $scope.list_service_category();
  $scope.list_service();


  $scope.whenWorkerLessThanOne = function () {
    SweetAlert.swal({
      title: "No workers found !!",
      text: "You must need to add worker to create appointment !!",
      type: "warning",
      showCancelButton: false,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "First visit, worker page!",
      closeOnConfirm: true,
      closeOnCancel: false
    }, function (isConfirm) {

      if (isConfirm) {
        $state.go('app.pages.service_provider', {

        });

      } else {

      }
    });
  }


  $(window).on('resize', function () {
    var width = $(window).width();
    var height = $(window).height();
    if (width == 768 && height == 1024) {
      $scope.calendarSidebarFlag = false;
      $('.pagemain-content').css("margin-left", "0px");
    }
  });

  $scope.clearAll = function (state, title, msg) {

    if (state != 'status_update') {
      notifications.Message(state, title, msg);
    }


    $scope.copyAppointment = {}
    $scope.appointments = [];
    $scope.rebookAppointment = {};
    if ($scope.default_view == "resourceDay") {
      $scope.worker_list(0)
    } else if ($scope.default_view == "agendaWeek") {
      $scope.worker_list($scope.worker.id)
    } else if ($scope.default_view == "agendaDay") {

      $scope.worker_list($scope.worker.id)
    }
    // notifications.Message('success', 'Success', 'Service category add successfully !!');
  }

  $scope.clearAllExtraTimeBlock = function (state, title, msg) {
    notifications.Message(state, title, msg);
    $scope.appointments = [];
    if ($scope.default_view == "resourceDay") {
      $scope.worker_list(0)
    } else if ($scope.default_view == "agendaWeek") {

      $scope.worker_list($scope.worker.id)
    } else if ($scope.default_view == "agendaDay") {

      $scope.worker_list($scope.worker.id)
    }
    // notifications.Message('success', 'Success', 'Service category add successfully !!');
  }




  // setTimeout(function(){
  //   console.log('$scope.filteredResources',$scope.filteredResources);

  //   },1000)




  var isiPhone = navigator.userAgent.toLowerCase().indexOf("iphone");
  var isiPad = navigator.userAgent.toLowerCase().indexOf("ipad");
  var isiPod = navigator.userAgent.toLowerCase().indexOf("ipod");
  var android = navigator.userAgent.toLowerCase().indexOf("android");

  if (isiPhone > -1) {
    (jQuery('.calendarparts-left.hide').length == 1) ? jQuery('.calendarparts-left').removeClass('hide') : jQuery('.calendarparts-left').addClass('hide');

    (jQuery('.calendarparts-right.margin-left-0').length == 1) ? jQuery('.calendarparts-right').removeClass('margin-left-0') : jQuery('.calendarparts-right').addClass('margin-left-0');
  }
  if (isiPad > -1) {
    /* (jQuery('.calendarparts-left.hide').length == 1) ? jQuery('.calendarparts-left').removeClass('hide') : jQuery('.calendarparts-left').addClass('hide');

    (jQuery('.calendarparts-right.margin-left-0').length == 1) ? jQuery('.calendarparts-right').removeClass('margin-left-0') : jQuery('.calendarparts-right').addClass('margin-left-0'); */
    jQuery('.calendarparts-left').addClass('hide')
  }
  if (isiPod > -1) {
    (jQuery('.calendarparts-left.hide').length == 1) ? jQuery('.calendarparts-left').removeClass('hide') : jQuery('.calendarparts-left').addClass('hide');

    (jQuery('.calendarparts-right.margin-left-0').length == 1) ? jQuery('.calendarparts-right').removeClass('margin-left-0') : jQuery('.calendarparts-right').addClass('margin-left-0');
  }
  if (android > -1) {

    (jQuery('.calendarparts-left.hide').length == 1) ? jQuery('.calendarparts-left').removeClass('hide') : jQuery('.calendarparts-left').addClass('hide');

    (jQuery('.calendarparts-right.margin-left-0').length == 1) ? jQuery('.calendarparts-right').removeClass('margin-left-0') : jQuery('.calendarparts-right').addClass('margin-left-0');

  }


}]);



























