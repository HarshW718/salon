app.controller('appointmentColorStatusController', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb", "restSessionOut", function ($scope, $uibModalInstance, $http, items, APP, toaster, cb, restSessionOut) {

  if (!sessionStorage.getItem('login_time')){restSessionOut.getRstOut();}
  $("#ui-datepicker-div").hide();
  $scope.appointment_status = []; $scope.data_inside_left_modal = {}; $scope.status = {};
  $scope.appointment_status = items.appointment_status; $scope.ok = function (e) { $uibModalInstance.close(); e.stopPropagation(); };
  $scope.cancel = function () { $uibModalInstance.dismiss(); }; $scope.saveColor = function () {
    $http.post(APP.API + 'update_appointment_status', $scope.appointment_status).then(function (response) {
      try { if (response.data.status == "401") { restSessionOut.getRstOut(); } } catch (err) { } if (response.data.success != false) { $uibModalInstance.close(); cb.success('success', 'Success', response.data.message); } else { cb.success('warning', 'Alredy Exist', response.data.message); }
    }).catch(function (request, status, errorThrown) {
      var responce_error = request.data;
      angular.forEach(responce_error.errors, function (error) {
        for (var i = 0; i < error.length; i++) {
          toaster.pop('error', 'Error', error[i]);
        }
      });
    });
  }
  $scope.resetColor = function () {
    $scope.appointment_status = items.appointment_status;
  }

}])
