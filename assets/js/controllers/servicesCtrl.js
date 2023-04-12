"use strict";
/**
 * controllers for UI Bootstrap components
 */
app.controller("servicesCtrl", [
  "$scope",
  "SweetAlert",
  "modalProvider",
  "APP",
  "notifications",
  "$http",
  "restSessionOut",
  "duration",
  "$filter",
  function (
    $scope,
    SweetAlert,
    modalProvider,
    APP,
    notifications,
    $http,
    restSessionOut,
    duration,
    $filter
  ) {
    var auth_token = localStorage.getItem("auth_token");
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem("auth_token")) {
      restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem("login_time")) {
      restSessionOut.getRstOut();
    }

    $scope.service_category_for_dropdown = function () {
      $http
        .get(APP.API + "list_service_category")
        .then(function (response) {
          try {
            if (response.data.status == "401") {
              restSessionOut.getRstOut();
            }
          } catch (err) {}
          $scope.service_cat_drop_down = response.data.data;
        })
        .catch(function (request, status, errorThrown) {});
    };

    $scope.list_service_category = function () {
      $http
        .get(APP.API + "list_service_category_forselect")
        .then(function (response) {
          try {
            if (response.data.status == "401") {
              restSessionOut.getRstOut();
            }
          } catch (err) {}
          $scope.service_categories = response.data.data;
        })
        .catch(function (request, status, errorThrown) {});
    };

    $scope.list_service = function () {
      $http
        .get(APP.API + "list_service")
        .then(function (response) {
          try {
            if (response.data.status == "401") {
              restSessionOut.getRstOut();
            }
          } catch (err) {}
          // console.log('response.data.data',response.data.data);
          var service_table_header =
            "<table><tr><th>Category</th><th>Service Name</th><th>Duration</th><th>Sale Price</th><th>BTW</th></tr>";
          var service_table_footer = "</table>";
          var service_table_tr = "";

          angular.forEach(response.data.data, function (service, key) {
            var _btw =
              service.service_tax == null ? "---" : service.service_tax.name;
            service_table_tr +=
              "<tr><td>" +
              service.service_category.name +
              "</td><td>" +
              service.name +
              "</td><td>" +
              $filter("rightTime")(service.duration) +
              "</td><td>" +
              service.sales_price +
              "</td><td>" +
              _btw +
              "</td></tr>";
          });

          $scope.html_data =
            service_table_header + service_table_tr + service_table_footer;
          $scope.services = response.data.data;
          $scope.services_length = response.data.data.length;
          $scope.service_categories_array = response.data.data_array;
        })
        .catch(function (request, status, errorThrown) {});
    };

    $scope.service_category_for_dropdown();
    $scope.list_service_category();
    $scope.list_service();
    $scope.search_service_table = true;
    $scope.onKeyUp = function () {
      var serach_value = $scope.search;
      if (serach_value.search_service != undefined) {
        $scope.main_table = true;
        $scope.search_service_table = false;
      } else {
        $scope.main_table = false;
        $scope.search_service_table = true;
      }
      $http
        .post(APP.API + "search_service", $scope.search)
        .then(function (response) {
          try {
            if (response.data.status == "401") {
              restSessionOut.getRstOut();
            }
          } catch (err) {}
          $scope.searched_services = response.data.data;
        })
        .catch(function (request, status, errorThrown) {});
    };
    $http
      .get(APP.API + "list_tax")
      .then(function (response) {
        try {
          if (response.data.status == "401") {
            restSessionOut.getRstOut();
          }
        } catch (err) {}
        $scope.taxes = response.data.data;
      })
      .catch(function (request, status, errorThrown) {});
    $scope.add_editService = function (form_data) {
      if (form_data != 0) {
        if (typeof form_data != "object") {
          $scope.data_inside_modal = {
            button: ["Add", "Save"],
            data: { category_id: form_data },
            buffer_duration: [
              { id: 0 },
              { id: 5 },
              { id: 10 },
              { id: 15 },
              { id: 30 },
              { id: 45 },
              { id: 60 },
              { id: 90 },
              { id: 120 },
            ],
            durations: duration.displyaDuration(480), //$scope.range(480),
            service_categories: $scope.service_cat_drop_down,
            taxes: $scope.taxes,
          };
        } else {
          form_data.buffer_time = form_data.buffer_time == 1 ? true : false;
          $scope.data_inside_modal = {
            button: ["Edit", "Update"],
            data: form_data,
            buffer_duration: [
              { id: 0 },
              { id: 5 },
              { id: 10 },
              { id: 15 },
              { id: 30 },
              { id: 45 },
              { id: 60 },
              { id: 90 },
              { id: 120 },
            ],
            durations: duration.displyaDuration(480),
            service_categories: $scope.service_cat_drop_down,
            taxes: $scope.taxes,
          };
        }
      } else {
        $scope.data_inside_modal = {
          button: ["Add", "Save"],
          data: 0,
          buffer_duration: [
            { id: 0 },
            { id: 5 },
            { id: 10 },
            { id: 15 },
            { id: 30 },
            { id: 45 },
            { id: 60 },
            { id: 90 },
            { id: 120 },
          ],
          durations: duration.displyaDuration(480),
          service_categories: $scope.service_cat_drop_down,
          taxes: $scope.taxes,
        };
      }
      modalProvider.openPopupModal(
        APP.VIEW_PATH + "services/addServiceModalContent.html",
        "addServiceController",
        "",
        $scope.data_inside_modal,
        {
          success: function (state, title, msg) {
            $scope.clearAll(state, title, msg);
          },
        }
      );
    };

    $scope.clearAll = function (state, title, msg) {
      if (state != "close") {
        notifications.Message(state, title, msg);
      }
      $scope.list_service();
      $scope.list_service_category();
      // notifications.Message('success', 'Success', 'Service category add successfully !!');
    };
    $scope.downloadXls = function () {
      // var blob = new Blob([document.getElementById('customerDatatable_wrapper').innerHTML], {
      var blob = new Blob([$scope.html_data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
      });
      saveAs(blob, "serviceDatatable.xls");
    };
    $scope.deleteService = function (service_id) {
      $scope.delete_service_id = { id: service_id };
      SweetAlert.swal(
        {
          title: "Are you sure?",
          text: "You want to delete selected service!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          closeOnConfirm: true,
          closeOnCancel: true,
        },
        function (isConfirm) {
          if (isConfirm) {
            $http
              .post(APP.API + "delete_service", $scope.delete_service_id)
              .then(function (response) {
                try {
                  if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                  }
                } catch (err) {}
                if (response.data.success) {
                  notifications.Message(
                    "success",
                    "Success",
                    response.data.message
                  );
                  $scope.list_service(0);
                } else {
                  notifications.Message(
                    "warning",
                    "Can not deleted !",
                    response.data.message
                  );
                }
              })
              .catch(function (request, status, errorThrown) {});
          } else {
          }
        }
      );
    };
    $scope.hide_show_1 = false;
    $scope.hide_show_2 = false;
    $scope.category1 = function (index) {
      if ($scope["hide_show_" + index] != true) {
        $scope["hide_show_" + index] = true;
      } else {
        $scope["hide_show_" + index] = false;
      }
    };
    $scope.fileUpload = function () {
      $scope.data_inside_modal = {
        button: ["Add", "Save"],
      };
      modalProvider.openPopupModal(
        APP.VIEW_PATH + "services/uploadCsvServiceModalContent.html",
        "uploadServiceController",
        "",
        $scope.data_inside_modal,
        {
          success: function (state, title, msg) {
            $scope.clearAll(state, title, msg);
          },
        }
      );
    };
  },
]);

app.controller("addServiceController", [
  "$scope",
  "$uibModalInstance",
  "$http",
  "items",
  "APP",
  "cb",
  "restSessionOut",
  "notifications",
  function (
    $scope,
    $uibModalInstance,
    $http,
    items,
    APP,
    cb,
    restSessionOut,
    notifications
  ) {
    var auth_token = localStorage.getItem("auth_token");
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem("auth_token")) {
      restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem("login_time")) {
      restSessionOut.getRstOut();
    }
    var php_api_link = "";
    $scope.submitServiceForm = function () {
      if ($("#id_serviceForm").valid()) {
        if (
          !$scope.service.hasOwnProperty("membership_price") ||
          !$scope.service.membership_price
        ) {
          $scope.service.membership_price = 0;
        }
        if (
          !$scope.service.hasOwnProperty("sales_price") ||
          !$scope.service.sales_price
        ) {
          $scope.service.sales_price = 0;
        }
        php_api_link =
          typeof $scope.service.id !== "undefined"
            ? "update_service"
            : "add_service";

        debugger;
        console.log($scope.service);
        $http
          .post(APP.API + php_api_link, $scope.service)
          .then(function (response) {
            try {
              if (response.data.status == "401") {
                restSessionOut.getRstOut();
              }
            } catch (err) {}
            var return_responce = response.data;
            console.log(return_responce);
            if (return_responce.success != false) {
              $uibModalInstance.close();
              cb.success("success", "Success", return_responce.message);
            } else {
              cb.success("warning", "Alredy Exist", return_responce.message);
            }
          })
          .catch(function (request, status, errorThrown) {
            var responce_error = request.data;

            angular.forEach(responce_error.errors, function (error) {
              for (var i = 0; i < error.length; i++) {
                cb.success("error", "Error", error[i]);
                console.log(error[i]);
              }
            });
          });
      } else {
        return false;
      }
    };
    $scope.items = items;
    if (items.data != 0) {
      $scope.service = items.data;
    }
    $scope.isInvalid = function (field) {
      return (
        $scope.serviceCategoryForm[field].$invalid &&
        $scope.serviceCategoryForm[field].$dirty
      );
    };
    $scope.selected = {
      item: $scope.items[0],
    };

    $scope.ok = function () {
      $uibModalInstance.close($scope.selected.item);
    };
    $scope.cancel = function () {
      $uibModalInstance.close();
      cb.success("close", "close", "close");
    };
  },
]);

app.controller("uploadServiceController", [
  "$scope",
  "$uibModalInstance",
  "$http",
  "items",
  "APP",
  "cb",
  "restSessionOut",
  function ($scope, $uibModalInstance, $http, items, APP, cb, restSessionOut) {
    var auth_token = localStorage.getItem("auth_token");
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem("auth_token")) {
      restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem("login_time")) {
      restSessionOut.getRstOut();
    }
    $scope.uploadFile = function (element) {
      $scope.file = element;

      var line = $scope.file.split("\n");
      var x, y;
      var table = "";
      var tr = "";
      var td = "";
      var column = [];
      var final_data = [];

      for (x = 0; x <= line.length; x++) {
        if (line[x] != undefined) {
          final_data[x] = line[x];
          column[x] = line[x].split(",");
          tr += "<tr>";
          for (y = 0; y <= column[x].length; y++) {
            if (column[x][y] != undefined) {
              if (x == 0) {
                td += "<th scope='col'>" + column[x][y] + "</th>";
              } else {
                td += "<td>" + column[x][y] + "</td>";
              }
            }
          }
          tr += td + "</tr>";
          td = "";
        }
      }
      $scope.csvData = final_data;
      // table = "<table class='table table-bordered'>" + tr + "</table>";
    };

    $scope.submitCsvData = function () {
      $http
        .post(APP.API + "upload_csv_services", $scope.csvData)
        .then(function (response) {
          try {
            if (response.data.status == "401") {
              restSessionOut.getRstOut();
            }
          } catch (err) {}
          var return_responce = response.data;
          var return_responce = response.data;
          if (return_responce.success != false) {
            $uibModalInstance.close();
            cb.success("success", "Success", return_responce.message);
          } else {
            cb.success("error", "Error", return_responce.message);
            angular.element("input[type='file']").val(null);
            $scope.csvData = "";
          }
        })
        .catch(function (request, status, errorThrown) {
          var responce_error = request.data;
          angular.forEach(responce_error.errors, function (error) {
            for (var i = 0; i < error.length; i++) {
              notifications.Message("error", "Error", error[i]);
            }
          });
        });
    };

    $scope.items = items;
    if (items.data != 0) {
      $scope.product = items.data;
    }
    $scope.selected = {
      item: ["add", "edit"],
    };

    $scope.ok = function () {
      $uibModalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  },
]);

app.filter("rightTime", function () {
  return function (input) {
    if (input >= 60 && input < 120) {
      var min60 = input - 60 == 0 ? "" : input - 60 + "min";
      return "1h " + min60;
    } else if (input >= 120 && input < 180) {
      var min120 = input - 120 == 0 ? "" : input - 120 + "min";
      return "2h " + min120;
    } else if (input >= 180 && input < 240) {
      var min180 = input - 180 == 0 ? "" : input - 180 + "min";
      return "3h " + min180;
    } else if (input >= 240 && input < 300) {
      var min240 = input - 240 == 0 ? "" : input - 240 + "min";
      return "4h " + min240;
    } else if (input >= 300 && input < 360) {
      var min300 = input - 300 == 0 ? "" : input - 300 + "min";
      return "5h " + min300;
    } else if (input >= 360 && input < 420) {
      var min360 = input - 360 == 0 ? "" : input - 360 + "min";
      return "6h " + min360;
    } else if (input >= 420 && input < 480) {
      var min420 = input - 420 == 0 ? "" : input - 420 + "min";
      return "7h " + min420;
    } else if (input == 480) {
      return "8h";
    } else {
      return input + "min";
    }
  };
});
