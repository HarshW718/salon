

app.service('modalBox', function ($rootScope, APP, $ngBootbox, notifications, $http) {
    this.confirmModal = function (data, callbackAjax) {
        tmp = 0;
        if (data == undefined) {
            notifications.Message($rootScope.translation({ "code": 133 }), 'error');
            return true;
        }
        if (data.msg == undefined) {
            msg = "dissmiss";
        } else {
            msg = data.msg;
        }
        if (data.postData == undefined) {
            data.postData = {};
        }
        bootbox.confirm({
            title: "Are you sure?",
            message: "You want to " + msg + " this?",
            buttons: {
                cancel: {
                    label: "Cancel",
                    className: "btn-primary"
                },
                confirm: {
                    label: "Confirm",
                    className: "btn-danger"
                }
            },
            callback: function (res) {
                if (res) {
                    $http.post(APP.API + data.url, data.postData)
                        .then(function success(response) {
                            if (response.data.error == true) {
                                notifications.Message($rootScope.translation(response.data.message), 'error');
                            } else {
                                if (data.postData.is_active == undefined) {
                                    notifications.Message($rootScope.translation(response.data.message), 'success');
                                } else {
                                    if (data.postData.is_active) {
                                        tmpResponse = { "code": 135 };
                                    } else {
                                        tmpResponse = { "code": 134 };
                                    }
                                    notifications.Message($rootScope.translation(tmpResponse), 'success');
                                }
                                return callbackAjax(data.funName);
                            }
                        })
                }
            }
        })
        // alert(tmp)
    };

    this.promptModal = function (data, callbackAjax) {
        tmp = 0;
        if (data == undefined) {
            notifications.Message($rootScope.translation({ "code": 133 }), 'error');
            return true;
        }
        if (data.msg == undefined) {
            msg = "dissmiss";
        } else {
            msg = data.msg;
        }
        if (data.postData == undefined) {
            data.postData = {};
        }
        if (msg = "dispute") {
            msg = "Are you sure you want to " + msg + " this audit ?";
        } else {
            msg = "Are you sure you want to " + msg + " this?";
        }
        if (data.note != undefined) {
            msg += "<br/><b>Note : " + data.note + "</b>";
        }
        bootbox.prompt({
            placeholder: "Enter reason here",
            title: msg,
            buttons: {
                cancel: {
                    label: "Cancel",
                    className: "btn-primary"
                },
                confirm: {
                    label: "Confirm",
                    className: "btn-danger"
                }
            },
            callback: function (note) {
                if (note == null) { return true; }
                if (note) {
                    data.postData.note = note;
                    $http.post(APP.API + data.url, data.postData)
                        .then(function success(response) {
                            if (data.postData.changeStatusAudit == 1) {
                                if (data.postData.is_active) {
                                    notifications.Message($rootScope.translation({ "code": 122 }), 'success');
                                } else {
                                    notifications.Message($rootScope.translation({ "code": 123 }), 'success');
                                }
                                return callbackAjax(1);
                            } else if (data.postData.changeStatusCarrierContact == 1) {
                                if (data.postData.is_active) {
                                    notifications.Message($rootScope.translation({ "code": 120 }), 'success');
                                } else {
                                    notifications.Message($rootScope.translation({ "code": 121 }), 'success');
                                }
                                return callbackAjax(1);
                            } else if (data.postData.changeStatusCarrierSubsidiary == 1) {
                                if (data.postData.subsidiary_status) {
                                    notifications.Message($rootScope.translation({ "code": 91 }), 'success');
                                } else {
                                    notifications.Message($rootScope.translation({ "code": 92 }), 'success');
                                }
                                return callbackAjax(1);
                            } else {
                                if (response.data.error == true) {
                                    notifications.Message($rootScope.translation(response.data.message), 'error');
                                    return callbackAjax(0);
                                } else {
                                    notifications.Message($rootScope.translation(response.data.message), 'success');
                                    return callbackAjax(1);
                                }
                            }
                        })
                } else { return false; }
            }
        })
        // alert(tmp)
    };

});

app.service('restSessionOut', function ($window, $cookies, $state, notifications, $rootScope, $timeout) {
    this.getRstOut = function () {
        notifications.Message('error', 'Error', 'Your session is expired, please try again login');
        $timeout(_logout, 1000);
    }

    function _logout() {

        localStorage.clear();
        $cookies.remove("userdata");
        var type = 'error';
        var options = { title: 'Error', size: 'large', message: 'Your session is expired, please try again login', duration: 1000 };
        $state.go('login.signin');
    }

})


/**
    * Description : 
    * Note : 
    * @uses 
    * @param 
    * @return  
*/

app.service('modalProvider1', ["$uibModal", function ($uibModal) {
    this.openPopupModal1 = function (template, controller, data, cb, model_size) {
        alert('open');
        if (cb === undefined) { cb = {}; }
        if (model_size === undefined) { model_size = 'lg'; }
        $uibModal.open({
            keyboard: true,
            backdrop: false,
            windowClass: 'modal-center show',
            templateUrl: template,
            controller: controller,
            controllerAs: '$ctrl',
            size: model_size,
            resolve: {
                related_data: function () {
                    if (data) {
                        return data;
                    }
                },
                cb: cb,
                open: function () {
                    // $(".modal-dialog").addClass(model_size);
                    // setTimeout(function() {
                    // $(".modal").addClass('show');
                    // $(".modal-dialog").addClass(model_size);
                    // }, 300);
                }
            },
            closing: function () {
                // console.log("modal closed...");
            }

        });

    };
}]);
app.service('modalProviderLeft', ["$aside", function ($aside) {

    this.leftsidePopupModal = function (template, controller, modal_size, data, cb, position, styleClass) {
        modal_size = (modal_size === undefined) ? 'lg' : modal_size;
        cb = (cb === undefined) ? {} : cb;
        styleClass = (styleClass === undefined) ? '' : styleClass;
        $aside.open({
            templateUrl: template,
            placement: position,
            size: modal_size,
            backdrop: 'static',
            // scope: $scope,
            controller: controller,
            resolve: {
                items: function () {
                    if (data) {
                        return data;
                    }
                },
                cb: cb,
                open: function () {

                }
            },
            windowClass: styleClass
        });
    }

}]);

app.service('modalProvider26_06_2019', ["$uibModal", function ($uibModal) {
    this.openPopupModal = function (template, controller, modal_size, data, cb, modalclass) {
        if (modal_size === undefined) { modal_size = 'lg'; }
        if (cb === undefined) { cb = {}; }
        if (modalclass === undefined) { modalclass = ''; }
        var modalInstance = $uibModal.open({
            templateUrl: template,
            controller: controller,
            size: modal_size,
            keyboard: true,
            backdrop: 'static',
            resolve: {
                items: function () {
                    if (data) {
                        return data;
                    }
                },
                cb: cb,
                open: function () {

                }
            },
            windowClass: modalclass
        });
        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {

        });

    }
}]);


app.service('modalProvider', ["$uibModal", function ($uibModal) {
    this.openPopupModal = function (template, controller, modal_size, data, cb, modalclass) {
        if (modal_size === undefined) { modal_size = 'lg'; }
        if (cb === undefined) { cb = {}; }
        if (modalclass === undefined) { modalclass = ''; }
        $uibModal.open({
            templateUrl: template,
            controller: controller,
            size: modal_size,
            keyboard: true,
            backdrop: 'static',
            resolve: {
                items: function () {
                    if (data) {
                        return data;
                    }
                },
                cb: cb,
                open: function () {

                }
            },
            windowClass: modalclass
        });
       

    }
}]);


app.service('modalProvider_compare', ["$uibModal", function ($uibModal) {
    this.openPopupModal = function (template, controller, modal_size, data, cb, modalClass) {
        if (modal_size === undefined) { modal_size = 'lg'; }
        if (cb === undefined) { cb = {}; }
        if (modalClass === undefined) { modalClass = ''; }
        var modalInstance = $uibModal.open({
            templateUrl: template,
            controller: controller,
            size: modal_size,
            keyboard: true,
            backdrop: 'static',
            resolve: {
                items: function () {
                    if (data) {
                        return data;
                    }
                },
                cb: cb,
                open: function () {

                }
            },
            windowClass: modalClass
        });
        modalInstance.result.then(function (selectedItem) {
            //$scope.selected = selectedItem;
        }, function () {

        });

    }
}]);

/**
    * Description : 
    * Note : 
    * @uses 
    * @param 
    * @return  
*/
app.factory('notifications', ["toaster", "$state", function (toaster, $state) {

    return {
        Message: function (type, title, msg, page = '') {
            toaster.options = {
                "positionClass": "toast-top-right",
                "timeOut": 800000
            }
            if (type == "warning") {
                toaster.pop(type, title, msg);
            } else if (type == "error") {
                toaster.pop(type, title, msg);
            } else {

                if (page != '') {
                    $state.go(page);
                }

                toaster.pop(type, title, msg);
            }
        }
    };

}]);

app.factory('duration', ["$state", function ($state) {

    return {
        displyaDuration: function (value) {

            var i;
            var array = []
            var end = (value / 5);
            var min = 5
            for (i = 0; i < end; i++) {

                if (min >= 60 && min < 120) {
                    var min60 = (min - 60) == 0 ? '' : (min - 60) + 'min';
                    array[i] = { id: min, name: '1h ' + min60 };
                } else if (min >= 120 && min < 180) {
                    var min120 = (min - 120) == 0 ? '' : (min - 120) + 'min';
                    array[i] = { id: min, name: '2h ' + min120 };
                } else if (min >= 180 && min < 240) {
                    var min180 = (min - 180) == 0 ? '' : (min - 180) + 'min';

                    array[i] = { id: min, name: '3h ' + min180 };
                } else if (min >= 240 && min < 300) {
                    var min240 = (min - 240) == 0 ? '' : (min - 240) + 'min';

                    array[i] = { id: min, name: '4h ' + min240 };
                } else if (min >= 300 && min < 360) {
                    var min300 = (min - 300) == 0 ? '' : (min - 300) + 'min';
                    array[i] = { id: min, name: '5h ' + min300 };
                } else if (min >= 360 && min < 420) {
                    var min360 = (min - 360) == 0 ? '' : (min - 360) + 'min';
                    array[i] = { id: min, name: '6h ' + min360 };
                } else if (min >= 420 && min < 480) {
                    var min420 = (min - 420) == 0 ? '' : (min - 420) + 'min';
                    array[i] = { id: min, name: '7h ' + min420 };
                } else if (min == 480) {
                    array[i] = { id: min, name: '8h' };
                } else {
                    array[i] = { id: min, name: min + 'min' };
                }

                min = min + 5;
            }

            return array;
        }
    }






}]);

app.factory('block_duration', ["$state", function ($state) {

    return {
        blockDuration: function (gap_minute) {

            var i;
            var x = 0;
            var y = 0;
            var z = 1;
            var minute = '';
            var hour = '00';
            var array = ["00:00"]
            for (i = 1; i < Math.ceil(277/(gap_minute/5)); i++) {
                if (i == (60/gap_minute) * z) {
                    x = 0;
                    y = y + 1;
                    minute = ((x.toString()).length < 2) ? "0" + x : x;
                    hour = ((y.toString()).length < 2) ? "0" + y : y;
                    z = z + 1;
                } else {
                    x = x + gap_minute;
                    minute = ((x.toString()).length < 2) ? "0" + x : x;

                }
                text = hour + ":" + minute;
                array.push(text);
                text = '';

            }
            return array;
        }
    }

}])


app.factory("storeAppointmentData",function(){

    var storeService = {};
    function set(data){
        storeService = data;
    }
    function get(){

        return storeService;
    }

    return{

        set:set,
        get:get

    }
})

app.factory("_storeUnpaidInvoiceData",function(){

    var __unpaidInvoice = {};
    function set(data){
        __unpaidInvoice = data;
    }
    function get(){

        return __unpaidInvoice;
    }

    return{

        set:set,
        get:get

    }
})


app.factory("displayInvoiceModal", function () {

    var invoiceModal = false;
    function set(conditiion) {
        invoiceModal = conditiion;
    }
    function get() {

        return invoiceModal;
    }

    return{

        set: set,
        get: get

    }
})



