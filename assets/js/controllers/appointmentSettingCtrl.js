
app.controller('appointmentSettingController', ["$scope", "$uibModalInstance", "$http", "items", "APP",  "cb", "restSessionOut", "modalProviderLeft", "notifications", function ($scope, $uibModalInstance, $http, items, APP, cb, restSessionOut, modalProviderLeft, notifications) {
  $scope.appointment_status = [];
  $scope.data_inside_left_modal = {};
  $scope.calendar_setting = {};
  $scope.duration = [];
  $scope.start_time_duration = items.duration;
  $scope.appointment_status = items.appointment_statuslist;
  var api_link = '';
  $("#ui-datepicker-div").hide();
  $scope.fetch_calendar_setting = function () {
    $http.get(APP.API + 'user_appointment_setting'
    ).then(function (response) {
      try {
        if (response.data.status == "401") {
          restSessionOut.getRstOut();
        }
      } catch (err) { }
      var responce_data = response.data.data;
      $scope.calendar_setting.id = (responce_data.id != undefined) ? responce_data.id : undefined;
      $scope.calendar_setting.first_day = (responce_data.id != undefined) ? responce_data.first_day : 0;
      $scope.calendar_setting.time_slot_duration = (responce_data.id != undefined) ? responce_data.time_slot_duration : "00:10:00";
      $scope.calendar_setting.start_time = (responce_data.id != undefined) ? responce_data.start_time.substring(0, 5) : "07:00";
      var length_of_duration = items.duration.length;
      var single_duration_index = items.duration.findIndex(function (single_duration) { return (single_duration == $scope.calendar_setting.start_time) });
      $scope.end_time_duration = items.duration.slice(single_duration_index, length_of_duration);
      $scope.calendar_setting.end_time = (responce_data.id != undefined) ? responce_data.end_time.substring(0, 5) : "23:00";
      $scope.calendar_setting.display = (responce_data.id != undefined) ? JSON.parse(responce_data.display) : {'name':true}
      $scope.calendar_setting.time_line = (responce_data.id != undefined) ? ((responce_data.time_line == 0) ? false : true) : false ;
      $scope.calendar_setting.display_cancel_appointment = (responce_data.id != undefined) ? ((responce_data.display_cancel_appointment == 0) ? false : true) : false ;
    }).catch(function (request, status, errorThrown) {
    });
  }
  $scope.fetch_calendar_setting();
  $scope.onChangeStartTime = function (){
    var length_of_duration = items.duration.length
    var single_duration_index = items.duration.findIndex(function (single_duration) { return (single_duration == $scope.calendar_setting.start_time) })
    $scope.end_time_duration = items.duration.slice(single_duration_index, length_of_duration);
  }
  $scope.saveCalendarSetting = function () {
    if ($scope.calendar_setting.id == undefined) {
      api_link = 'add_appointment_setting';
    } else {
      api_link = 'update_appointment_setting';
    }
    $http.post(APP.API + api_link, $scope.calendar_setting
    ).then(function (response) {
      try {
        if (response.data.status == "401") {
          restSessionOut.getRstOut();
        }
      } catch (err) { }
      if (response.data.success != false) {
        $uibModalInstance.close();
        cb.success('success', 'Success', response.data.message);
      } else {
        cb.success('warning', 'Error', 'Somthing wrong !!');
      }
    }).catch(function (request, status, errorThrown) {
    });
  }
  $scope.ok = function (e) {
    $uibModalInstance.close();
    e.stopPropagation();
  };
  $scope.cancel = function () {
    $uibModalInstance.close();
    cb.success('on_close', 'on_close', "On modal close communicate to main modal");
  };
  $scope.openColorSidebar = function () {
    modalProviderLeft.leftsidePopupModal(
      APP.VIEW_PATH + 'calendar/changeColorStatusModalContent.html',
      'appointmentColorStatusController',
      'sm',
      $scope.data_inside_left_modal = {
        appointment_status: $scope.appointment_status
      },
      {
        'success': function (state, title, msg) {
          $scope.clearLeftModal(state, title, msg);
        }
      },
      'left',
      'colorModal'
    )
  }
  $scope.clearLeftModal = function (state, title, msg) {
    notifications.Message(state, title, msg);
  }
}])
