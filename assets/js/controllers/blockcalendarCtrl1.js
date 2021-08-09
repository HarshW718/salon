

'use strict';
/**
 * Controller of the angularBootstrapCalendarApp
*/
app.controller('blockcalendarCtrl', ["$scope", "$compile", "$uibModal", "$http", "$timeout", "restSessionOut", "modalProvider", "modalProviderLeft", "APP", "duration", "notifications", "SweetAlert", "$state", function ($scope, $compile, $uibModal, $http, $timeout, restSessionOut, modalProvider, modalProviderLeft, APP, duration, notifications, SweetAlert, $state) {


  var auth_token = localStorage.getItem('auth_token');
  $http.defaults.headers.common.authtoken = auth_token;
  if (!localStorage.getItem('auth_token')) {
    restSessionOut.getRstOut();
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
  $scope.timeSlotDuration = "00:10:00";
  $scope.appointment_setting = {}
  $scope.week_no = moment(new Date(), "MMDDYYYY").isoWeek();

    /* Pre define varibles */

    $scope.worker_list = function () {

      $http.get(APP.API + 'worker_list_for_calendar'
      ).then(function (response) {
        try {
          if (response.data.status == "401") {
            restSessionOut.getRstOut();
          }
        } catch (err) { }
        $scope.filteredResources = response.data.data;
        console.log('$scope.filteredResources',$scope.filteredResources)
        if (($scope.filteredResources).length > 0) {
  
          $scope.appointments_list();
          $scope.worker.id = $scope.filteredResources[0].id;
        } else {
          $scope.whenWorkerLessThanOne();
        }
        console.log('$scope.filteredResources', $scope.filteredResources);
      }).catch(function (request, status, errorThrown) {
      });
    }
  
  
  
    $scope.worker_list();
    
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
  
  
    $scope.appointments_list = function () {
      //  var cdate = ($scope.current_date.date == undefined) ? 0: $scope.current_date.date;
  
      //console.log('Date', typeof ($scope.current_date.date))
      if ($scope.current_date.date == undefined) {
        var cdate = 0
      } else {
        if (typeof ($scope.current_date.date) == 'string') {
          var cdate = $scope.current_date.date
        } else {
          var year = $scope.current_date.date.getFullYear();
          var month = (($scope.current_date.date.getMonth() + 1).length < 2) ? '0' + ($scope.current_date.date.getMonth() + 1) : ($scope.current_date.date.getMonth() + 1);
          var day = (($scope.current_date.date.getDate()).length < 2) ? '0' + $scope.current_date.date.getDate() : $scope.current_date.date.getDate();
          var cdate = year + "-" + month + "-" + day
  
        }
  
      }
     
      var form_date = { date: cdate }
      $http.post(APP.API + 'list_appointment', form_date
      ).then(function (response) {
        try {
          if (response.data.status == "401") {
            restSessionOut.getRstOut();
          }
        } catch (err) { }
        $scope.appointments = response.data.data
        console.log('$scope.appointments', $scope.appointments);
        allEvents = [];
       
        for (var i = 0; i < $scope.appointments.length; i++) {
  
          if ($scope.appointments[i].customer != undefined) {
            if ($scope.appointments[i].customer.id != 0) {
  
              allEvents.push({
                'full_data': $scope.appointments[i],
                'title': ($scope.appointments[i].service_duration > 40) ? ("<strong>" + $scope.appointments[i].customer.firstname + "</strong><p>" + $scope.appointments[i].customer.address + " " + $scope.appointments[i].customer.house_no + "<br> Mob. " + $scope.appointments[i].customer.mobile + "</p>") : $scope.appointments[i].customer.firstname,
  
                'start': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].start_time,
                'end': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].end_time, resourceId: $scope.appointments[i].worker_id,
                'borderColor': $scope.appointments[i].service.service_category.color,
                'backgroundColor': ($scope.appointments[i].appointment_status == undefined) ? '' : $scope.appointments[i].appointment_status.status_color,
               
              });
            }
          } else {
  
            allEvents.push({
              'full_data': $scope.appointments[i],
              'title': "<p>" + $scope.appointments[i].block_time_description + "</p>",
              'start': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].start_time,
              'end': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].end_time, 
              resourceId: $scope.appointments[i].worker_id,
              'borderColor': '#8c8c8c',
              'backgroundColor': '#8c8c8c'
            });
  
          }
  
  
        }
      
        $scope.calendar();
        $('#js-calendar').fullCalendar('gotoDate', $scope.current_date.go_date);
  
    setTimeout(function(){
      $("#hiddenField").datepicker('setDate', new Date($scope.current_date.go_date));
      $("#ui-datepicker-div").hide();
    },1000);
  
       
  
      }).catch(function (request, status, errorThrown) {
      });
    }
  
    $scope.list_service_category = function () {
  
      $http.get(APP.API + 'list_service_category_forselect'
      ).then(function (response) {
        try {
          if (response.data.status == "401") {
            restSessionOut.getRstOut();
          }
        } catch (err) { }
        $scope.service_categories = response.data.data;
        console.log('return_dataservice_categories', $scope.service_categories);
  
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
        console.log('return_dataservices', $scope.services);
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
        console.log('$scope.appointment_status', $scope.appointment_status);
  
      }).catch(function (request, status, errorThrown) {
  
      });
  
  
    }
  
    $scope.appointment_status_list();
    $scope.list_service_category();
    $scope.list_service();
  
    $('.pagemain-content').css("margin-left", "265px");
  
  
    $scope.appointments_by_worker = function () {


    
  
      switch ($scope.default_view) {
  
        case "agendaWeek":
          var firstday = $scope.interval_Start_End.start.format("YYYY-MM-DD");
          var lastday = $scope.interval_Start_End.end.format("YYYY-MM-DD");
          var form_data = { worker_id: $scope.worker.id, firstday_of_week: firstday, lastday_of_week: lastday }
  
          $http.post(APP.API + 'list_appointment_by_worker', form_data
          ).then(function (response) {
            console.log('response', response)
            try {
              if (response.data.status == "401") {
                restSessionOut.getRstOut();
              }
            } catch (err) { }
            $scope.appointments = response.data.data
            console.log('$scope.appointments', $scope.appointments)
            allEvents = [];
            for (var i = 0; i < $scope.appointments.length; i++) {
  
              if ($scope.appointments[i].customer != undefined) {
                if ($scope.appointments[i].customer.id != 0) {
  
                  allEvents.push({
                    'full_data': $scope.appointments[i],
                    'title': ($scope.appointments[i].service_duration > 40) ? ("<strong>" + $scope.appointments[i].customer.firstname + "</strong><p>" + $scope.appointments[i].customer.address + " " + $scope.appointments[i].customer.house_no + "<br> Mob. " + $scope.appointments[i].customer.mobile + "</p>") : $scope.appointments[i].customer.firstname,
                    'start': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].start_time,
                    'end': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].end_time, resourceId: $scope.appointments[i].worker_id,
                    'borderColor': $scope.appointments[i].service.service_category.color,
                    'backgroundColor': ($scope.appointments[i].appointment_status == undefined) ? '' : $scope.appointments[i].appointment_status.status_color
                  });
                }
              } else {
  
                allEvents.push({
                  'full_data': $scope.appointments[i],
                  'title': "<p>" + $scope.appointments[i].block_time_description + "</p>",
                  'start': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].start_time,
                  'end': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].end_time, resourceId: $scope.appointments[i].worker_id,
                  'borderColor': '#8c8c8c',
                  'backgroundColor': '#8c8c8c'
                });
  
              }
            }
            $scope.calendar();
            $('#js-calendar').fullCalendar('gotoDate', $scope.current_date.date);
  
           $("#hiddenField").datepicker('setDate', new Date($scope.current_date.date));
           $("#ui-datepicker-div").hide();
          }).catch(function (request, status, errorThrown) {
          });
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
  
          $http.post(APP.API + 'list_appointment_by_worker', form_data
          ).then(function (response) {
            try {
              if (response.data.status == "401") {
                restSessionOut.getRstOut();
              }
            } catch (err) { }
            $scope.appointments = response.data.data
            allEvents = [];
            for (var i = 0; i < $scope.appointments.length; i++) {
  
              if ($scope.appointments[i].customer != undefined) {
                if ($scope.appointments[i].customer.id != 0) {
                  allEvents.push({
  
  
                    'title': ($scope.appointments[i].service_duration > 40) ? ("<strong>" + $scope.appointments[i].customer.firstname + "</strong><p>" + $scope.appointments[i].customer.address + " " + $scope.appointments[i].customer.house_no + "<br> Mob. " + $scope.appointments[i].customer.mobile + "</p>") : $scope.appointments[i].customer.firstname,
                    'start': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].start_time,
                    'end': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].end_time, resourceId: $scope.appointments[i].worker_id,
                    'borderColor': $scope.appointments[i].service.service_category.color,
                    'backgroundColor': ($scope.appointments[i].appointment_status == undefined) ? '' : $scope.appointments[i].appointment_status.status_color,
                   
                  });
                }
              } else {
  
                allEvents.push({
                  'full_data': $scope.appointments[i],
                  'title': "<p>" + $scope.appointments[i].block_time_description + "</p>",
                  'start': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].start_time,
                  'end': $scope.appointments[i].appointment_date + ' ' + $scope.appointments[i].end_time, resourceId: $scope.appointments[i].worker_id,
                  'borderColor': '#8c8c8c',
                  'backgroundColor': '#8c8c8c'
                });
  
              }
            }
            $scope.calendar();
            $('#js-calendar').fullCalendar('gotoDate', $scope.current_date.go_date);
            $("#hiddenField").datepicker('setDate', new Date($scope.current_date.go_date));
            $("#ui-datepicker-div").hide();
          }).catch(function (request, status, errorThrown) {
          });
  
  
          break;
  
      }
  
    }
  
    $scope.selectWorker = function () {
      $scope.appointments_by_worker();
    }
  



$scope.calendar = function (){

/*
There is no resourceDay in fullcalender we add below line

r.defineView("resourceDay",{type:"agenda",duration:{days:1}}) 

in fullcalendar.min.js to run resourceDay by default

*/

console.log('allEvents')

  jQuery("#calendar").fullCalendar("destroy");
    $("#calendar").fullCalendar({


      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'agendaWeek,agendaDay'
      },
      navLinks: true,
      editable: true,
      defaultView: 'resourceDay',
      eventLimit: true,
      nowIndicator: true,
      selectable: true,
      groupByResource: true,
      allDaySlot: false,
      minTime: "07:00:00",
      maxTime: "24:00:00",
      slotLabelFormat: ['HH:mm'],   
      slotDuration:"00:10:00",
      resources:$scope.filteredResources,
      events:allEvents,

      selectable: true,
      selectHelper: true,
      eventLimit: true,
      eventOverlap: false,
      allDay: false,

      
      eventRender: function (event, element) {
        //element.find('.fc-event-title').html(event.title);
      },
     
  
      select: function (start, end, jsEvent, view, vista) {
        // var business_hour = vista.businessHours;
        // console.log('business_hour', business_hour)
        // var start_hour = (start._i[3].toString().length < 2) ? "0" + start._i[3] : start._i[3];
        // var start_minute = (start._i[4].toString().length < 2) ? "0" + start._i[4] : start._i[4];
        // var start_time = start_hour + ":" + start_minute;
        // var start_time1 = new Date(start._i[0], start._i[1], start._i[2], start._i[3], start._i[4], start._i[5], start._i[6], start._i[7])
        // alert(start_time1);
        // console.log('start', start._i);
        // console.log('end', end._i);



        

        console.log('vista', vista);


        console.log('jsEvent', jsEvent);

        var appointmentdate = start.format("YYYY-MM-DD HH:mm");
       
       // var starttime = parseInt(start.format("HH:mm"));
       // var endtime = parseInt(end.format("HH:mm"));

         var starttime = start.format("HH:mm");
        var endtime = end.format("HH:mm");

      
       
       
       
       
       
        var workerid = vista.id

        alert(workerid)

        // if (event.data === undefined) {
        //   if ($scope.worker.id === undefined) {
        //     notifications.Message('error', 'Error', 'Please choose worker !!');

        //   } else {
        //     workerid = $scope.worker.id;
        //   }
        // } else {
        //   workerid = event.data.id;
        // }

       // workerid =






        modalProvider
          .openPopupModal(
            APP.VIEW_PATH + 'calendar/addAppointmentModalContent.html',
            'appointmentAddController',
            'lg',
            $scope.data_inside_modal = {
              services: $scope.services,
              service_categories: $scope.service_categories,
              durations: duration.displyaDuration(480),
              worker_id: workerid,
              appointment_date: appointmentdate,
              start_time: starttime,
              end_time: endtime,
            },
            {
              'success': function (state, title, msg) {
                $scope.clearAll(state, title, msg);
              }
            },
          )


      },
      viewRender: function (view, element) {
console.log('view',view)

        $scope.interval_Start_End = { start: view.intervalStart, end: view.intervalEnd }

        // console.log('view.name',view)
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
          });
        } else if (view.name == 'agendaDay') {
          $scope.default_view = "agendaDay";
          $timeout(function () {
            $scope.workers_dropdown = true;
            $('.calendar').removeClass('calendar-margin');
            $('.fc-agenda-slots').removeClass('fc-agenda-slots-margin');
            jQuery('.fc-button-customeView').removeClass('fc-state-active');
          });
        } else {
          $timeout(function () {
            $scope.workers_dropdown = false;
            $scope.default_view = "resourceDay";
            $('.calendar').addClass('calendar-margin');
            $('.fc-agenda-slots').addClass('fc-agenda-slots-margin');
            jQuery(this).addClass('fc-state-active');
          });
        }
        // makeEventsDraggable();
      },
  
    
    });



    $("div.fc-clear").remove();
    var custom_buttons = '' + '   <input type="input" id="hiddenField" class="datepicker" />' + '';
    jQuery('.fc-center').parent('div').append(custom_buttons);
    $("#hiddenField").datepicker({
      showOn: "button",
      buttonText: '<i class="fa fa-calendar-check-o" ng-click="clickOnCalendar()"></i>',
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      onSelect: function (dateText, inst) {
        var d = $("#hiddenField").datepicker("getDate");
         $scope.dt = d;
         $scope.week_no = moment(d, "MMDDYYYY").isoWeek();
        // console.log('date', d.format("YYYY-MM-DD"));
        // $scope.current_date  = {date:d}
        if ($scope.default_view == "resourceDay") {
          $scope.current_date = { date: d, go_date: d }
          $scope.appointments_list();
        } else if ($scope.default_view == "agendaWeek") {
          $scope.current_date = { date: d }
          $scope.appointments_by_worker();
        } else if ($scope.default_view == "agendaDay") {
          $scope.current_date = { date: d, go_date: d }
          $scope.appointments_by_worker();
        }
      }
    });
    
    
    // fc-button fc-state-default fc-corner-left fc-state-hover fc-state-down

    $('.fc-agenda-slots').addClass('fc-agenda-slots-margin');
    jQuery('.fc-agendaWeek-button').on('click', function () {


//alert()
      // $scope.current_date  = {date:$('#js-calendar').fullCalendar('getDate')}
      $scope.appointments_by_worker();
    })

    jQuery('.fc-right').find(".fc-button-group").prepend(
      jQuery('<button type="button" class="fc-button fc-button-customeView fc-state-default fc-state-active fc-corner-left fc-corner-left">Team</button>')
        .on('click', function () {
          $scope.worker_list();
          $('#js-calendar').fullCalendar('changeView', 'resourceDay');

        })
    );


    jQuery('.fc-left').append(
      jQuery('<span class="fc-header-space"></span><button type="button" class="fc-button fc-button-reloadView fc-state-default fc-corner-left fc-corner-left"><i class="fa fa-refresh" aria-hidden="true"></i></button>')
      .on('click', function () {

      $scope.dt = $('#js-calendar').fullCalendar('getDate');

      $scope.week_no = moment(new Date($('#js-calendar').fullCalendar('getDate')), "MMDDYYYY").isoWeek();

      if ($scope.default_view == "resourceDay") {

      $scope.current_date = { date: $('#js-calendar').fullCalendar('getDate').format("YYYY-MM-DD"), go_date: $('#js-calendar').fullCalendar('getDate') }
      $scope.appointments_list();
      } else if ($scope.default_view == "agendaWeek") {
      $scope.current_date = { date: $('#js-calendar').fullCalendar('getDate') }
      $scope.appointments_by_worker();
      } else if ($scope.default_view == "agendaDay") {
      $scope.current_date = { date: $('#js-calendar').fullCalendar('getDate').format("YYYY-MM-DD"), go_date: $('#js-calendar').fullCalendar('getDate') }
      $scope.appointments_by_worker();
      }


      })
      );


  }
  

 

  $scope.openAside = function (position) {

    modalProviderLeft.leftsidePopupModal(
      APP.VIEW_PATH + 'calendar/settingAppointmentModalContent.html',
      'appointmentSettingController',
      'sm',
      $scope.data_inside_left_modal = {
        appointment_statuslist: $scope.appointment_status
      },
      {
        'success': function (state, title, msg) {
          $scope.clearLeftModal(state, title, msg);
        }
      },
      position
    )

  };

  $scope.clearLeftModal = function (state, title, msg) {
    if (state == 'on_close') {
        $scope.worker_list();
        $scope.appointment_status_list();
    }
  }

  $scope.calendarGoToDateFunc = function (d) {
    // jQuery('#js-calendar').fullCalendar('gotoDate', e);


    console.log('formate_',d);

    if ($scope.default_view == "resourceDay") {
      $scope.current_date = { date: d, go_date: d }
      $scope.appointments_list();
    } else if ($scope.default_view == "agendaWeek") {
      $scope.current_date = { date: d }
      $scope.appointments_by_worker();
    } else if ($scope.default_view == "agendaDay") {
      $scope.current_date = { date: d, go_date: d }
      $scope.appointments_by_worker();
    }



  }



  $scope.clickToday = function(){



    $scope.dt = new Date();
    var d = new Date();
    $scope.week_no = moment(new Date(), "MMDDYYYY").isoWeek();
  
   if ($scope.default_view == "resourceDay") {
     $scope.current_date = { date: d, go_date: d }
     $scope.appointments_list();
   } else if ($scope.default_view == "agendaWeek") {
     $scope.current_date = { date: d }
     $scope.appointments_by_worker();
   } else if ($scope.default_view == "agendaDay") {
     $scope.current_date = { date: d, go_date: d }
     $scope.appointments_by_worker();
   }

  
 }

$scope.clickOnWeek = function (week_no){


var calendar_current_date = $('#js-calendar').fullCalendar('getDate') ;
calendar_current_date = new Date(calendar_current_date)
calendar_current_date.setDate(calendar_current_date.getDate()+ (7*week_no));
  if ($scope.default_view == "resourceDay") {
    $scope.current_date = { date:  calendar_current_date, go_date:  calendar_current_date }
    $scope.appointments_list();
  } else if ($scope.default_view == "agendaWeek") {
    $scope.current_date = { date:  calendar_current_date }
    $scope.appointments_by_worker();
  } else if ($scope.default_view == "agendaDay") {
    $scope.current_date = { date:  calendar_current_date, go_date:  calendar_current_date }
    $scope.appointments_by_worker();
  }

  $scope.dt = calendar_current_date
  $scope.week_no = moment(calendar_current_date, "MMDDYYYY").isoWeek();

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
    notifications.Message(state, title, msg);
    $scope.appointments = [];
    $scope.appointments_list();
    // notifications.Message('success', 'Success', 'Service category add successfully !!');
  }

}]);

















