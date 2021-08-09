
app.controller('appointmentAddController', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb", "restSessionOut", "SweetAlert", "block_duration","notifications", function ($scope, $uibModalInstance, $http, items, APP, toaster, cb, restSessionOut, SweetAlert, block_duration,notifications) {
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    var month = new Array();
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";
    $("#ui-datepicker-div").hide();
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }
    $http({
        method: "post",
        url: APP.API + 'dt_form_list',
        data: {
            length: 100000000,
            start: 0,
            draw: 1,
            order: 'id',
        }
    }).then(function (response) {
        $scope.consentFormList = []; //type 1
        $scope.treatmentFormList = []; //type 2
        $scope.medicalFormList = []; //type 3
        try {
            if (response.data.status == "401") {
                restSessionOut.getRstOut();
            }
        } catch (err) { }
        if (response.data.success && response.data.data.length > 0) {
            angular.forEach(response.data.data, function (value, key) {
                if (value.type == 1) {
                    $scope.consentFormList.push(value);
                }
                if (value.type == 2) {
                    $scope.treatmentFormList.push(value);
                }
                if (value.type == 3) {
                    $scope.medicalFormList.push(value);
                }
            })
        }
    }, function (error) {
    });
    toaster.options = {
        "positionClass": "toast-top-right",
        "timeOut": 800000
    }
    $scope.person = {};
    $scope.search = {};
    angular.forEach(items.services, function (single_service) {
        single_service.coupon = undefined;
    });
    $scope.services = items.services;
    $scope.service_categories = items.service_categories;
    $scope.durations = items.durations;
    $scope.worker_id = (items.worker_id != undefined) ? items.worker_id : 0;
    $scope.appointment_date = items.appointment_date;
    $scope.starttime = items.start_time;
    $scope.endtime = items.end_time;
    $scope.day_name = weekday[items.display_date.getUTCDay()];
    $scope.display_date = items.display_date.getUTCDate() + " " + month[items.display_date.getUTCMonth()] + " " + items.display_date.getUTCFullYear();
    $scope.customer_address = { 'street': '', 'house_no': '' };
    $scope.ids = {}
    $scope.formData = (items.is_it_copy == 'yes') ? true : false;
    $scope.customerList = (items.is_it_copy == 'yes') ? false : true;
    $scope.closeBtn = (items.is_it_copy == 'yes') ? true : false;
    $scope.is_it_for_upate = (items.is_it_for_upate == undefined) ? false : items.is_it_for_upate;
    var serviceid = (items.is_it_copy == 'yes') ? items.full_data.service_id : 0;
    if (serviceid == 0) {
        $scope.ids = {}
    } else {
        $scope.ids[serviceid] = true;
        var index_of_service_id = items.services.findIndex(function (service) { return service.id == serviceid; })
        if (index_of_service_id != -1) {
            $scope.services[index_of_service_id].duration = items.full_data.service_duration
        }
    }
    $scope.customer = (items.is_it_copy == 'yes') ? items.full_data.customer : {};
    if ($scope.is_it_for_upate) {
        var check_empty = isEmpty($scope.customer);
        if (check_empty) {
            $scope.customerList = true;
            $scope.formData = false;
            $scope.closeBtn = true;
            $scope.person.selected = {
                id: 0,
                full_name: "Walk In",
                mobile: 00000,
                postal_code: 0000,
                birthday: "00-00-0000",
            };
        }
    }
    function isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
    $scope.appointment = (items.is_it_copy == 'yes') ? {
        comment: items.full_data.comments,
        is_email: (items.full_data.is_email == 1) ? true : false,
        is_sms: (items.full_data.is_sms == 1) ? true : false,
        id: items.full_data.id,
        consent_frm_id: items.full_data.consent_frm_id,
        treatment_frm_id: items.full_data.treatment_frm_id,
        medical_frm_id: items.full_data.medical_frm_id
    } : {};
    $scope.tmp = (items.is_it_copy == 'yes') ? { dt_update: new Date(items.full_data.customer.dob) } : {};
 
    if ($scope.is_it_for_upate) {
        $scope.current_service = { service_id: items.full_data.service_id }
    }
    /* Below lines for block time */
    $scope.block_time = {};
    $scope.block_time.block_time_type = "absent";
    $scope.block_duration = block_duration.blockDuration(5);
    var length_of_duration = $scope.block_duration.length;
    var single_duration_index = $scope.block_duration.findIndex(function (single_duration) { return (single_duration == items.start_time) });
    $scope.start_time_duration = $scope.block_duration.slice(single_duration_index, length_of_duration);

    $scope.block_time.start_time = $scope.start_time_duration[0];
    var length_of_duration_e = $scope.start_time_duration.length;
    var single_duration_index_e = $scope.start_time_duration.findIndex(function (single_duration) { return (single_duration == $scope.block_time.start_time) });
    $scope.end_time_duration = $scope.start_time_duration.slice(single_duration_index_e, length_of_duration_e);
    $scope.block_time.end_time = $scope.end_time_duration[0];
    $scope.onChangeStartTime = function () {
        var length_of_duration = $scope.start_time_duration.length;
        var single_duration_index = $scope.start_time_duration.findIndex(function (single_duration) { return (single_duration == $scope.block_time.start_time) });
        $scope.end_time_duration = $scope.start_time_duration.slice(single_duration_index, length_of_duration);
        $scope.block_time.end_time = $scope.end_time_duration[0];
    }
    $scope.hide_show_1 = false;
    $scope.hide_show_2 = false;
    $scope.category1 = function (index) {
        if ($scope['hide_show_' + index] != true) {
            $scope['hide_show_' + index] = true;
        } else {
            $scope['hide_show_' + index] = false;
        }
    }
    $scope.changeCustomer = function (item) {
        if ($scope.person.selected.id != 0) {
            $scope.formData = true;
            $scope.closeBtn = false;
        } else {
            $scope.formData = false;
            $scope.closeBtn = true;
        }
    }
    $scope.newCustomer = function () {
        $scope.customer = {};
        $scope.person.selected = {};
        $scope.tmp = {};
        $scope.formData = true;
        $scope.customerList = false;
        $scope.closeBtn = true;
    }
    $scope.oldCustomer = function () {
        $scope.formData = false;
        $scope.customerList = true;
        $scope.person.selected = '';
    }
    $scope.onSelectCallback = function (item) {
        if (item.id != 0) {
            if (item.coupon.length > 0) {
                angular.forEach($scope.services, function (single_service) {
                    $scope.current_customer_coupon = item.coupon.filter(function (c_service) {
                        if (moment($scope.appointment_date).isBetween(c_service.from_date, c_service.to_date) && c_service.service_id == single_service.id) {
                            return true;
                        }
                    })
                    if ( $scope.current_customer_coupon.length > 0) {
                        var coupon_array = [];
                        coupon_array.push($scope.current_customer_coupon[0])
                        single_service.coupon = coupon_array;
                    } else {
                        single_service.coupon = []
                    }
                });
            } else {
                angular.forEach($scope.services, function (single_service) {
                    single_service.coupon = [];
                });
            }
            $scope.customer = item;
            var street = (item.address != null) ? item.address.replace(/\'/g, '').split(/(\d+)/).filter(Boolean) : '';
            $scope.customer_address.street = street[0]
            $scope.tmp.dt_update = new Date(item.dob);
        } else {
            $scope.customer = item;
        }
    }
    $scope.people = [];
    $scope.yourFunction = function (search) {
        var search_data = { search: search }
        $http.post(APP.API + 'customer_for_appointment', search_data
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            $scope.people = response.data.data;
            if(!$scope.is_it_for_upate){
                // $scope.people.push({
                //     id: 0,
                //     full_name: "Walk In",
                //     mobile: 00000,
                //     postal_code: 0000,
                //     birthday: "00-00-0000",
                // })
            }
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.yourFunction(null)
    $scope.emailValidation = function () {
        var patt = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm);
        var email_check = patt.test($scope.customer.email);
        if (email_check) {
            $scope.email_validation_message_display = false;
        } else {
            $scope.email_validation_message = "Invalid Email !";
            $scope.email_validation_message_display = true;
        }
    }
    $scope.addSpace = function (id) {
        var ele = document.getElementById(id);
        ele = ele.value.split(' ').join(''); // Remove dash (-) if mistakenly entered.
        var finalVal = ele.match(/.{1,2}/g).join(' ');
        var isValid = false;
        var regex = /^[0-9\s]*$/;
        isValid = regex.test(finalVal);
        if (!isValid) {
            if (id == 'landline') {
                $scope.lanline_validation = true;
            } else {
                $scope.mobile_validation = true;
            }
        } else {
            if (id == 'landline') {
                $scope.lanline_validation = false;
            } else {
                $scope.mobile_validation = false;
            }
        }
        if (id == 'landline') {
            $scope.customer.landline = finalVal;
        } else {
            $scope.customer.mobile = finalVal;
        }
        document.getElementById(id).value = finalVal;
    }
    $scope.serviceCheck = function (service) {
        if (service.service_category.type == 1) {
            if ($scope.ids[service.id] == true) {
                $scope.appointment_date
                $scope.starttime
                $scope.endtime
                var request_data = { service_cat_id: service.service_category.id, service_id: service.id, appointment_date: $scope.appointment_date, starttime: $scope.starttime, endtime: $scope.endtime, duration: service.duration, no_of_apointment: service.service_category.no_of_appointment }
                $http.post(APP.API + 'check_same_appointment_for_machine', request_data
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    if (response.data.success != false) {
                        if (response.data.data >= service.service_category.no_of_appointment) {
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
                                        $scope.ids[service.id] = true;
                                    } else {
                                        $scope.ids[service.id] = false;
                                        service.duration = 5;
                                    }
                                });
                        }
                    }
                }).catch(function (request, status, errorThrown) {
                });
            }
        }
    }
    $scope.serviceCheckRadio = function (service) {
        $scope.save_service = service
        $scope.ids[service.id] = true;
        angular.forEach($scope.ids, function (single_id, key) { if (key != service.id) { $scope.ids[key] = false; } });
        if (service.service_category.type == 1) {
            if ($scope.current_service.service_id == service.id) {
                var request_data = {
                    service_cat_id: service.service_category.id,
                    service_id: service.id,
                    appointment_date: items.full_data.appointment_date,
                    starttime: items.full_data.start_time,
                    endtime: items.full_data.end_time,
                    duration: service.duration,
                    no_of_apointment: service.service_category.no_of_appointment
                }
                $http.post(APP.API + 'check_same_appointment_for_machine', request_data
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    if (response.data.success != false) {
                        if (response.data.data >= service.service_category.no_of_appointment) {
                            SweetAlert.swal({
                                title: "No machine available !!",
                                text: "You must need to choose other time slot for this machine service. Are you sure you want to continue ?",
                                showCancelButton: true,
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "Yes",
                                closeOnConfirm: true,
                                closeOnCancel: true,
                                cancelButtonText: "No",
                            },
                                function (isConfirm) {
                                    if (isConfirm) {
                                        $scope.ids[service.id] = true;
                                    } else {
                                        $scope.ids[service.id] = false;
                                        service.duration = 5
                                    }
                                });
                        }
                    }

                }).catch(function (request, status, errorThrown) {
                });
            }
        }
    }
    $scope.changeConsent = function (val) {
        $scope.consentFormSelected = val;
    }
    $scope.changeTreatment = function (val) {
        $scope.treatmentFormSelected = val;
    }
    $scope.changeMedical = function (val) {
        $scope.medicalFormSelected = val;
    }
    $scope.submitAppointmentForm = function (frm_id) {
        var php_api_link = '';
        var services_array = [];
        var service_time = [];
        var checkArr = [];
        if ($scope.is_it_for_upate) {
            php_api_link = 'update_appointment';
            $scope.services.find(function (single_service) {
                if (single_service.id == $scope.current_service.service_id) {
                    services_array.push(single_service)
                    service_time.push(single_service.duration);
                }
                if (!isEmpty($scope.person.selected)) {
                    $scope.customer = $scope.person.selected;
                }
            });
        } else {
            php_api_link = 'add_appointment';
            $.each($("input[name='check_service']:checked"), function () {
                checkArr.push($(this).val());
            });
            angular.forEach(checkArr, function (service_id) {
                $scope.services.find(function (single_service) {
                    if (single_service.id == service_id) {
                        services_array.push(single_service)
                        service_time.push(single_service.duration);
                    }
                });
            });
        }
        if ($scope.customer.gender == undefined) {
            $scope.gender_validation_message_display = true;
            $scope.gender_validation_message = "This field is required."
        } else {
            $scope.gender_validation_message_display = false;
            $scope.gender_validation_message = "";
        }
        if ($("#" + frm_id).valid()) {
            if (isEmpty($scope.customer) || (services_array.length == 0)) {
                toaster.pop('error', 'Error', 'Please Choose services and customer to create appointment !!')
            } else {
                
                $scope.appointment.customer = $scope.customer;
                $scope.appointment.customer.dob = $scope.tmp.dt_update;
                $scope.appointment.worker_id = $scope.worker_id;
                $scope.appointment.appointment_date = $scope.appointment_date;
                $scope.appointment.start_time = $scope.starttime;
                $scope.appointment.end_time = $scope.endtime;
                $scope.appointment.end_time = $scope.endtime;
                $scope.appointment.accesstoken = $scope.userdata.accesstoken;
                $scope.appointment.is_sync_google = $scope.userdata.is_sync_google;
                $scope.appointment.services = ($scope.is_it_for_upate == true) ? services_array[0] : services_array;
                $scope.appointment.is_consentFormChk = $('#consentFormChk').is(":checked");
                $scope.appointment.is_treatmentFormChk = $('#treatmentFormChk').is(":checked");
                $scope.appointment.is_medicalFormChk = $('#medicalFormChk').is(":checked");
                if ($('#id_appointmentForm').valid()) {
                    $http.post(APP.API + php_api_link, $scope.appointment
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
                            cb.success('warning', 'Alredy Exist', response.data.message);
                        }
                        $("#custom_notification_bar").removeClass("show");
                    }).catch(function (request, status, errorThrown) {
                        var responce_error = request.data;
                        angular.forEach(responce_error.errors, function (error) {

                            for (var i = 0; i < error.length; i++) {
                                toaster.pop('error', 'Error', error[i]);
                            }
                        });
                    });
                }
            }
        }
    }
    function isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
    $scope.createBirthdate12 = function (e) {

        if (((e.keyCode >= 48 && e.keyCode <= 57) || e.keyCode == 8 || e.keyCode <= 37 || e.keyCode <= 39 || (e.keyCode >= 96 && e.keyCode <= 105))) {
        var birtdate = $('#birthdate_display').val();
        var ele = $('#birthdate_display').val();
        var dashCount = (ele.match(/-/g) || []).length;

        if(ele.length == 2){
            if(ele > 31){
                //alert(ele)
                $('#birthdate_display').val('');
                return false;
            }
        }else if(ele.length == 5){
            var last2 = ele.slice(-2)
            if(parseInt(last2) > 12){
                //alert(ele)
                $('#birthdate_display').val('');
                return false;
            }

        }
       
       
        if(e.keyCode !=8){
            if (dashCount < 2) {
                if(ele.length == 2){
                    ele = ele+'-';
                }else if(ele.length == 5){
                    ele = ele+'-';
                }
                var finalVal = ele;
            } else {
                var finalVal = ele;
            }
        }else{
            var finalVal = ele;
        }



        $('#birthdate_display').val(finalVal);
        }else{
            $('#birthdate_display').val('');
        }
        
    }

   

    $scope.fillAddress = function () {
        $scope.customer.address = '';
        $scope.customer.address = (($scope.customer_address.street != undefined) ? $scope.customer_address.street : '') + " " + (($scope.customer.house_no != undefined) ? $scope.customer.house_no : '') + " " + (($scope.customer.house_letter != undefined) ? $scope.customer.house_letter : '');
    }

    $scope.postalCodeValidation = function (e){
        //alert($scope.customer.postal_code.length);
        if($scope.customer.postal_code.length <= 4){
            if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode == 8) { 
            }else{
                $scope.customer.postal_code = '';

            }
        }else if($scope.customer.postal_code.length == 5 || $scope.customer.postal_code.length == 6){
            if ((e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode == 20 || e.keyCode == 8 || e.keyCode == 16) { 
            }else{
                $scope.customer.postal_code = '';
            }
        }
    }
    
    $scope.findAddress = function () {
       
        //console.log('event',event);
    
        if (($scope.customer.postal_code != undefined)) {
            if (($scope.customer.postal_code != '')) {
                var postal_code_houseno = { 'postal_code': $scope.customer.postal_code, 'house_no': $scope.customer.house_no }
                $http.post(APP.API + 'get_customer_address', postal_code_houseno
                ).then(function (response) {
                    if (response.data.success != false) {
                        if (response.data.data != '' && typeof (response.data.data) != undefined) {
                            $scope.customer_address = response.data.data
                            $scope.customer.address = (($scope.customer_address.street != undefined) ? $scope.customer_address.street : '') + " " + (($scope.customer.house_no != undefined) ? $scope.customer.house_no : '');
                            $scope.customer.city = ($scope.customer_address.city != undefined) ? $scope.customer_address.city : ''
                        } else {
                            $scope.customer_address = [];
                            $scope.customer.address = '';
                        }
                    } else {
                        toaster.pop('error', 'Error', response.data.message);
                        $scope.customer.address = '';
                    }
                }).catch(function (request, status, errorThrown) {
                    var responce_error = request.data;
                    angular.forEach(responce_error.errors, function (error) {
                        for (var i = 0; i < error.length; i++) {
                            toaster.pop('error', 'Error', error[i]);
                        }
                    });
                });
            } else {
                toaster.pop('error', 'Faild', 'Please fill postal code and house no.  !!');
            }
        } else {
            toaster.pop('error', 'Faild', 'Please fill postal code and house no.  !!');
        }
        //&number=30
    }

    $scope.onSearch = function () {
        const filter_services = items.services.filter(function (service) {
            const index_name = (service.name.toLowerCase()).indexOf($scope.search.search_service.toLowerCase());
            const index_price = (service.sales_price.toString()).indexOf($scope.search.search_service);
            if (index_name != -1 || index_price != -1) {
                return service;
            }
        })
        const category_ids = filter_services.map(x => x.category_id);
        category_ids.filter((v, i) => category_ids.indexOf(v) == i);
        filter_service_categories = items.service_categories.filter(function (service_category) {
            return category_ids.includes(service_category.id);
        })
        $scope.service_categories = ($scope.search.search_service != '') ? filter_service_categories : items.service_categories;
        $scope.services = ($scope.search.search_service != '') ? filter_services : items.services;
    }

    $scope.checkWholeday = function () {
        if ($scope.block_time.whole_day) {
            $scope.block_time.start_time = "00:00";
            $scope.block_time.end_time = "23:00";
        } else {
            $scope.block_time.start_time = "";
            $scope.block_time.end_time = "";
        }
    }

    $scope.onChangeStartEndTime = function () {
        if (($scope.block_time.start_time == "00:00") && ($scope.block_time.end_time == "23:00")) {
            $scope.block_time.whole_day = true;
        } else {
            $scope.block_time.whole_day = false;
        }
    }
    $scope.submitBlockTime = function () {
        if ($scope.block_time.start_time != $scope.block_time.end_time) {
            $scope.block_time.worker_id = $scope.worker_id;
            $scope.block_time.block_date = $scope.appointment_date;
            if($scope.block_time.block_time_description != undefined && $scope.block_time.block_time_description != ''){
            $http.post(APP.API + 'add_block_time', $scope.block_time
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
                    cb.success('warning', 'Alredy Exist', response.data.message);
                }
            }).catch(function (request, status, errorThrown) {
                var responce_error = request.data;
                angular.forEach(responce_error.errors, function (error) {
                    for (var i = 0; i < error.length; i++) {
                        toaster.pop('error', 'Error', error[i]);
                    }
                });
            });
            }else{
                notifications.Message('error','Description Required !!','Description field can not be empty !!');
            }
            
        } else {
            $uibModalInstance.close();
        }
    }
    $scope.dropDownFlag = function (strng) {
        if (strng == 'Medical') {
            $scope.dropDownShowMedicalFlag = true;
            $scope.dropDownShowConsentFlag = false;
            $scope.dropDownShowTreatmentFlag = false;
        } else if (strng == 'Consent') {
            $scope.dropDownShowMedicalFlag = false;
            $scope.dropDownShowConsentFlag = true;
            $scope.dropDownShowTreatmentFlag = false;
        } else {
            $scope.dropDownShowMedicalFlag = false;
            $scope.dropDownShowConsentFlag = false;
            $scope.dropDownShowTreatmentFlag = true;
        }
    }
    $scope.ok = function () {
        $uibModalInstance.close($scope.selected.item);
    };
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.today = function () {
        $scope.dt_update = new Date();
    };
    //  $scope.today();
    $scope.start = $scope.minDate;
    $scope.end = $scope.maxDate;

    $scope.clear = function () {
        $scope.dt_update = null;
    };
    $scope.datepickerOptions = {
        showWeeks: false,
        startingDay: 1,
        datepickerMode: 'year'
    };
    $scope.dateDisabledOptions = {
        dateDisabled: disabled,
        showWeeks: false,
        startingDay: 1
    };
    $scope.startOptions = {
        showWeeks: false,
        startingDay: 1,
        minDate: $scope.minDate,
        maxDate: $scope.maxDate
    };
    $scope.endOptions = {
        showWeeks: false,
        startingDay: 1,
        minDate: $scope.minDate,
        maxDate: $scope.maxDate
    };
    // Disable weekend selection
    function disabled(data) {
        var date = data.date, mode = data.mode;
        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }
    $scope.setDate = function (year, month, day) {
        $scope.dt_update = new Date(year, month, day);
    };
    $scope.toggleMin = function () {
        $scope.datepickerOptions.minDate = $scope.datepickerOptions.minDate ? null : new Date();
        $scope.dateDisabledOptions.minDate = $scope.dateDisabledOptions.minDate ? null : new Date();
    };
    $scope.maxDate = new Date(2020, 5, 22);
    $scope.minDate = new Date(1970, 12, 31);
    $scope.open_update = function () {
        if (typeof ($scope.mydp) === 'undefined') {
            $scope.mydp = {};
        }
        // $scope.mydp.opened = true;
        $scope.mydp.opened_date = !$scope.mydp.opened_date;
        $scope.clear();
    };
    $scope.endOpen = function () {
        $scope.endOptions.minDate = $scope.start;
        $scope.startOpened = false;
        $scope.endOpened = !$scope.endOpened;
    };
    $scope.startOpen = function () {
        $scope.startOptions.maxDate = $scope.end;
        $scope.endOpened = false;
        $scope.startOpened = !$scope.startOpened;
    };
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    $scope.formats = ['dd-MM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.hstep = 1;
    $scope.mstep = 15;
    // Time Picker
    $scope.options = {
        hstep: [1, 2, 3],
        mstep: [1, 5, 10, 15, 25, 30]
    };
    $scope.ismeridian = true;
    $scope.toggleMode = function () {
        $scope.ismeridian = !$scope.ismeridian;
    };
    $scope.update = function () {
        var d = new Date();
        d.setHours(14);
        d.setMinutes(0);
        $scope.dt_update = d;
    };
    $scope.changed = function () {
        $log.log('Time changed to: ' + $scope.dt_update);
    };
    $scope.clear = function () {
        $scope.dt_update = null;
    };
    $scope.mytime = new Date();
    $scope.mytime1 = new Date();
    $scope.hstep = 1;
    $scope.mstep = 15;
    $scope.options = {
        hstep: [1, 2, 3],
        mstep: [1, 5, 10, 15, 25, 30]
    };
    $scope.ismeridian = true;
    $scope.toggleMode = function () {
        $scope.ismeridian = !$scope.ismeridian;
    };
    $scope.update = function () {
        var d = new Date();
        d.setHours(14);
        d.setMinutes(0);
        $scope.mytime = d;
    };
    $scope.changed = function () {
        // $log.log('Time changed to: ' + $scope.mytime);
    };

    $scope.changed1 = function () {
        // $log.log('Time changed to: ' + $scope.mytime);
    };
    $scope.clear = function () {
        $scope.mytime = null;
    };
    $scope.dropDownShowMedicalFlag = false;
    $scope.dropDownShowConsentFlag = false;
    $scope.dropDownShowTreatmentFlag = false;
}])
app.controller('blocktimeUpdateController', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb", "restSessionOut", "SweetAlert", "block_duration","notifications", function ($scope, $uibModalInstance, $http, items, APP, toaster, cb, restSessionOut, SweetAlert, block_duration,notifications) {
    
    $scope.block_time = {};
    $scope.block_time = items.full_data
    $scope.block_duration = block_duration.blockDuration(5);
    var length_of_duration = $scope.block_duration.length;
    var single_duration_index = $scope.block_duration.findIndex(function (single_duration) { return (single_duration == items.full_data.start_time.substring(0, 5)) });
    $scope.start_time_duration = $scope.block_duration.slice(single_duration_index, length_of_duration);
    $scope.block_time.start_time = items.full_data.start_time.substring(0, 5);
    var length_of_duration_end = $scope.start_time_duration.length;
    var single_duration_index_end = $scope.start_time_duration.findIndex(function (single_duration) { return (single_duration == $scope.block_time.start_time) });
    $scope.end_time_duration = $scope.start_time_duration.slice(single_duration_index_end, length_of_duration_end);
    $scope.block_time.end_time = items.full_data.end_time.substring(0, 5);
    $scope.onChangeStartTime = function () {
        var length_of_duration = $scope.start_time_duration.length;
        var single_duration_index = $scope.start_time_duration.findIndex(function (single_duration) { return (single_duration == $scope.block_time.start_time) });
        $scope.end_time_duration = $scope.start_time_duration.slice(single_duration_index, length_of_duration);
    }

    $scope.checkWholeday = function () {
        if ($scope.block_time.whole_day) {
            $scope.block_time.start_time = "00:00";
            $scope.block_time.end_time = "23:00";
        } else {
            $scope.block_time.start_time = "";
            $scope.block_time.end_time = "";
        }
    }
    $scope.onChangeStartEndTime = function () {
        if (($scope.block_time.start_time == "00:00") && ($scope.block_time.end_time == "23:00")) {
            $scope.block_time.whole_day = true;
        } else {
            $scope.block_time.whole_day = false;
        }
    }
    $scope.submitBlockTime = function () {
        if ($scope.block_time.start_time != $scope.block_time.end_time) {
            if($scope.block_time.block_time_description != undefined && $scope.block_time.block_time_description != ''){
            $http.post(APP.API + 'update_block_time', $scope.block_time
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
                    cb.success('warning', 'Alredy Exist', response.data.message);
                }
            }).catch(function (request, status, errorThrown) {
                var responce_error = request.data;
                angular.forEach(responce_error.errors, function (error) {
                    for (var i = 0; i < error.length; i++) {
                        toaster.pop('error', 'Error', error[i]);
                    }
                });
            });
        }else{
            notifications.Message('error','Description Required !!','Description field can not be empty !!');
        }
        } else {
            $uibModalInstance.close();
        }
    }
    $scope.deleteBlockTime = function () {
        var delete_blocktime = { id: $scope.block_time.id }
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to delete this block time!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                $http.post(APP.API + 'delete_appointment', delete_blocktime
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    $uibModalInstance.close();
                    cb.success('success', 'Success', 'Block time delete successfully.');
                }).catch(function (request, status, errorThrown) {
                });
            } else {
            }
        });
    }
    $scope.ok = function () {
        $uibModalInstance.close($scope.selected.item);
    };
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
}])
app.controller('showAppointmentController', ['$rootScope',"$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb", "restSessionOut", "SweetAlert", "modalProvider", "$state", "storeAppointmentData", "modalProvider_compare","notifications", function ($rootScope,$scope, $uibModalInstance, $http, items, APP, toaster, cb, restSessionOut, SweetAlert, modalProvider, $state, storeAppointmentData,modalProvider_compare,notifications) {

    storeAppointmentData.set({});
    $("#ui-datepicker-div").hide();
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    var month = new Array();
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";
    var appointment_status = new Array();
    appointment_status[0] = "";
    appointment_status[1] = "Scheduled";
    appointment_status[2] = "Confirmed";
    appointment_status[3] = "Checked";
    appointment_status[4] = "Closed";
    appointment_status[5] = "Canceled";
    appointment_status[6] = "Not available";
    $scope.comment_button = false;
    $scope.current_customer_coupon = function () {
        $http.post(APP.API + 'current_customer_coupon',  {customer_id:items.full_data.customer_id,service_id:items.full_data.service_id}
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            if(response.data.data.length > 0){
              var coupon_for_this_appointment_date =   response.data.data.filter(function (ccc) { 
                    if(moment(items.full_data.appointment_date).isSame(ccc.from_date) || moment(items.full_data.appointment_date).isBetween(ccc.from_date, ccc.to_date)){
                        return true;
                    }
                });
                if(coupon_for_this_appointment_date.length > 0){
                    items.full_data.customer.coupon = coupon_for_this_appointment_date;
                }else{
                    items.full_data.customer.coupon = [];
                }
            }else{
                items.full_data.customer.coupon = [];
            }
        }).catch(function (request, status, errorThrown) {
        });
    }

    $http.get(APP.API + 'customer_medical_report/' + items.full_data.customer_id
    ).then(function (response) {
      $scope.customer_medical_report = response.data.data
      /* console.log("$scope.calendar -> $scope.customer_medical_report", $scope.customer_medical_report) */
    }).catch(function (request, status, errorThrown) {
    });

   

    $scope.openCreateMedialCanvas = function(){

        $scope.data_inside_modal = {
            data: items.full_data.customer,
            type:'create'
        }
        modalProvider_compare
            .openPopupModal(
                APP.VIEW_PATH + 'customers/medicalCanvasModal.html',
                'medicalCanvasModalCtrl',
                'lg',
                $scope.data_inside_modal,
                {
                    'success': function (state, title, msg) {
                        $scope.getAllCanvas();
                        $scope.clearAll(state, title, msg);
                    }
                },
                'largeWidth-modal'
            )
}

    $scope.sendConfirmationMail = function(){
       
        $http.post(APP.API + 'sendConfirmationEmail',  {id:items.full_data.id}
       
        ).then(function (response) {
        
            if (response.data.success) {
                cb.success('success', 'Success', response.data.message);
                $uibModalInstance.close();
            } else {
                cb.success('success', 'Success', response.data.message);
            }
        }).catch(function (request, status, errorThrown) {
        });
    }


    if(items.full_data.appointment_status_id != 4){
        $scope.current_customer_coupon()
    }
    $scope.appointment_log = function () {
        $http.get(APP.API + 'list_appointment_log/' + items.full_data.id
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            $scope.list_appointment_log = response.data.data;
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.appointment_log()
    switch (items.full_data.appointment_status_id) {
        case 1:
            $scope.button_display_according_to_status = true;
            break;
        case 2:
            $scope.button_display_according_to_status = true;
            break;
        case 3:
            $scope.button_display_according_to_status = false;
            break;
        case 4:
            break;
        case 5:
            $scope.button_display_according_to_status = false;
            break;
        case 6:
            break;
        case 7:
            $scope.button_display_according_to_status = true;
            break;

    }

    console.log("items", items);
    $rootScope.clickedAppointmentId = items.full_data.id;
    $scope.walk_in_customer_id = items.full_data.walk_in_customer_id;
    $scope.appointments_details = {
        appointment_id: items.full_data.id,
        customer: items.full_data.customer,
        customer_name: ((items.full_data.customer == undefined) ? 'Walk' : items.full_data.customer.firstname) + ' ' + ((items.full_data.customer == undefined) ? 'In' : items.full_data.customer.lastname),
        customer_mobile: (items.full_data.customer == undefined) ? '----------' : items.full_data.customer.mobile,
        customer_email: (items.full_data.customer == undefined) ? 'No email known' :
            items.full_data.customer.email,
        customer_gender: (items.full_data.customer == undefined) ? 'unknown' :
            items.full_data.customer.gender,
        day: weekday[(new Date(items.full_data.appointment_date)).getDay()],
        month_name: month[(new Date(items.full_data.appointment_date)).getMonth()],
        date: (new Date(items.full_data.appointment_date)).getDate(),
        year: (new Date(items.full_data.appointment_date)).getFullYear(),
        start_time: items.full_data.start_time.substring(0, 5),
        end_time: items.full_data.end_time.substring(0, 5),
        collaborator: items.full_data.worker.first_name + ' ' + items.full_data.worker.last_name,
        service_name: items.full_data.service.name,
        status: appointment_status[items.full_data.appointment_status_id],
        appointment_status_id: items.full_data.appointment_status_id,
        comments: items.full_data.comments,
        invoice_id: (items.full_data.invoice == null) ? 0 : items.full_data.invoice.id

    }

        console.log("$scope.appointments_details", $scope.appointments_details);
    $scope.getInvoicePassword = function () {
        $http.get(APP.API + 'get_invoice_password')
          .then(function (response) {
            if(response.data.data){
                $scope.invoice_password = response.data.data;
            }else{
                $scope.invoice_password = {};
            }
      }).catch(function (request, status, errorThrown) {}); 
    }
    $scope.getInvoicePassword();

    

    $scope.diff_hours = function (dt2, dt1) {
        var diff =(dt2.getTime() - dt1.getTime()) / 1000;
        diff /= (60 * 60);
        return Math.abs(Math.round(diff));
    }

    $scope.appointmentDelete = function () {
        var todayDate = new Date();
        var createdDate = new Date(items.full_data.created_at);
        var hourDiff = $scope.diff_hours(todayDate, createdDate);
        console.log("hourDiff", hourDiff);
        if(hourDiff > 24){//ask for password to delete
            if($scope.invoice_password.invoice_password == undefined){
            notifications.Message('warning','Warning','Create your  password protected !!');
            $timeout(function(){
              $state.go('app.pages.cashdesk-settings', {});
            }, 2000);
          }else{
            SweetAlert.swal({
              title: "Are you sure?",
              text: "Enter password to delete",
              type: "input",
              inputType: "password",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes, continue it!",
              closeOnConfirm: true,
              closeOnCancel: true,
            
          }, function (typePassword) {
              if (typePassword) {
                if($scope.invoice_password.invoice_password != undefined){
                if(typePassword == $scope.invoice_password.invoice_password){
                    var delete_appointment = { id: $scope.appointments_details.appointment_id }
                    $http.post(APP.API + 'delete_appointment', delete_appointment
                    ).then(function (response) {
                        try {
                            if (response.data.status == "401") {
                                restSessionOut.getRstOut();
                            }
                        } catch (err) { }
                        $uibModalInstance.close();
                        cb.success('success', 'Success', response.data.message);
                    }).catch(function (request, status, errorThrown) {

                    });

                }else{
                  notifications.Message('error','Error','Wrong password entered !!');
                }
               }
              }
          });
          }
        }else{//allow delete
            var delete_appointment = { id: $scope.appointments_details.appointment_id }
            SweetAlert.swal({
                title: "Are you sure?",
                text: "You want to delete this appointment!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: true,
                closeOnCancel: true
            }, function (isConfirm) {
                if (isConfirm) {
                    $http.post(APP.API + 'delete_appointment', delete_appointment
                    ).then(function (response) {
                        try {
                            if (response.data.status == "401") {
                                restSessionOut.getRstOut();
                            }
                        } catch (err) { }
                        $uibModalInstance.close();
                        cb.success('success', 'Success', response.data.message);
                    }).catch(function (request, status, errorThrown) {

                    });
                } else {

                }
            });
        }
        
        

    }
    // $scope.appointmentDelete = function () {
    //     var delete_appointment = { id: $scope.appointments_details.appointment_id }
    //     console.log("delete_appointment", delete_appointment);return
    //     SweetAlert.swal({
    //         title: "Are you sure?",
    //         text: "You want to delete this appointment!",
    //         type: "warning",
    //         showCancelButton: true,
    //         confirmButtonColor: "#DD6B55",
    //         confirmButtonText: "Yes, delete it!",
    //         closeOnConfirm: true,
    //         closeOnCancel: true
    //     }, function (isConfirm) {
    //         if (isConfirm) {
    //             $http.post(APP.API + 'delete_appointment', delete_appointment
    //             ).then(function (response) {
    //                 try {
    //                     if (response.data.status == "401") {
    //                         restSessionOut.getRstOut();
    //                     }
    //                 } catch (err) { }
    //                 $uibModalInstance.close();
    //                 cb.success('success', 'Success', response.data.message);
    //             }).catch(function (request, status, errorThrown) {

    //             });
    //         } else {

    //         }
    //     });
    // }
    $scope.changeTextarea = function () {
        $scope.comment_button = true;
    }
    $scope.saveComments = function () {
        $http.post(APP.API + 'save_appointment_comment', $scope.appointments_details
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            $scope.comment_button = false;
            cb.success('success', 'Success', response.data.message);
        }).catch(function (request, status, errorThrown) {

        });

    }
    $scope.clearComments = function () {
        $scope.appointments_details.comments = '';
    }
    $scope.copyAppointment = function () {
        
        /* $("#snackbar").addClass("show")
        $("#snackbar").text("You select appointment to copy, You can copy or if you want to cancel, you can cancel this action.") */
        SweetAlert.swal({
            title: "Copy Appointment",
            text: "Are you sure want to copy appointment?",
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
                    if (items.full_data.customer_id == 0) {
                        items.full_data.customer = {}
                        cb.success('copy_data', 'Copy', items.full_data);
                        $uibModalInstance.close();
                        //$("#snackbar").removeClass("show")
                    } else {
                        cb.success('copy_data', 'Copy', items.full_data);
                        $uibModalInstance.close();
                        //$("#snackbar").removeClass("show")
                    }
                    /* localStorage.setItem('notification_msg',  "Click in the calendar on date and time to copy the appointment"); */;
                    $("#custom_notification_bar").addClass('show'); 
                    $("#custom_notification_bar .text").html('Now click on the calendar with the time slot to copy your appointment')
                } /* else {
                    /* localStorage.setItem('notification_msg',  "You select appointment to copy of slot "+items.full_data.start_time+"-"+items.full_data.end_time+"");
                    //Click in the calendar and time to copy the appointment
                    localStorage.setItem('notification_msg',  "Click in the calendar on date and time to copy the appointment"); 
                    $("#custom_notification_bar").addClass('show');
                    $("#custom_notification_bar .text").html('Now click on the calendar with the time slot to copy your appointment');
                    /* $cookies.put('notification_msg', "You select appointment to copy, You can copy or if you want to cancel, you can cancel this action.");
                    $("#snackbar").removeClass("show") 
                } */
            }
        );
        
    }
    $scope.editAppointment = function () {
        if (items.full_data.customer_id == 0) {
            items.full_data.customer = {}
            cb.success('edit_appointment_data', 'Edit', items.full_data);
            $uibModalInstance.close();
        } else {
            cb.success('edit_appointment_data', 'Edit', items.full_data);
            $uibModalInstance.close();
        }
    }


    $scope.rebookAppointment = function () {
       /*  $("#snackbar").addClass("show");
        $("#snackbar").text("You select appointment to rebook, You can rebook or if you want to cancel, you can cancel this action."); */
        SweetAlert.swal({
            title: "Rebook Appointment",
            text: "Are you sure want to rebook appointment?",
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
                    cb.success('rebook_data', 'Copy', items);
                    $uibModalInstance.close();
                     /* localStorage.setItem('notification_msg',  "Click in the calendar on date and time to rebook the appointment"); */
                    $("#custom_notification_bar").addClass('show');
                    $("#custom_notification_bar .text").html('Now click on the calendar with the time slot to rebook your appointment');
                    //$("#snackbar").removeClass("show");
                } /* else {
                    /* localStorage.setItem('notification_msg',  "You select appointment to rebook of slot "+items.full_data.start_time+"-"+items.full_data.end_time+"");
                    localStorage.setItem('notification_msg',  "Click in the calendar on date and time to rebook the appointment");
                    $("#custom_notification_bar").addClass('show');
                    $("#custom_notification_bar .text").html('Now click on the calendar with the time slot to rebook your appointment');
                    //$("#snackbar").removeClass("show");
                } */
            }
        );
       /*  cb.success('rebook_data', 'Copy', items);
        $uibModalInstance.close(); */
    }
    $scope.people = [];
    $scope.yourFunction = function (search) {
        var search_data = { search: search }
        $http.post(APP.API + 'customer_for_appointment', search_data
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            $scope.people = response.data.data;
            $scope.people.push({
                id: 0,
                full_name: "Walk In",
                mobile: 00000,
                postal_code: 0000,
                birthday: "00-00-0000",
            })
            $scope.change_customer.customer = items.full_data.customer;
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.yourFunction(null)
    $scope.change_customer = {};
    $scope.onSelectCallback = function (item) {
        $scope.change_customer.customer = item;
    };
    $scope.saveChangeCustomer = function () {
        var save_change_customer_data = {
            appointment_id: items.full_data.id,
            worker_id: items.full_data.worker.id,
            customer_id: $scope.change_customer.customer.id,
        }
        $http.post(APP.API + 'save_change_customer', save_change_customer_data
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            if (response.data.success != false) {
                $uibModalInstance.close();
                cb.success('success', 'Success', response.data.message);
            }
        }).catch(function (request, status, errorThrown) {
            var responce_error = request.data;
            angular.forEach(responce_error.errors, function (error) {
                for (var i = 0; i < error.length; i++) {
                    toaster.pop('error', 'Error', error[i]);
                }
            });
        });
    }
    $scope.uncheckAppointment = function () {
        var uncheck_appointment_data = {
            appointment_id: items.full_data.id,
            appointment_status_id: 1,
        }
        $http.post(APP.API + 'uncheck_appointment', uncheck_appointment_data
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            if (response.data.success != false) {
                $uibModalInstance.close();
                cb.success('success', 'Success', response.data.message);
            }
        }).catch(function (request, status, errorThrown) {
            var responce_error = request.data;
            angular.forEach(responce_error.errors, function (error) {
                for (var i = 0; i < error.length; i++) {
                    toaster.pop('error', 'Error', error[i]);
                }
            });
        });

    }
    $scope.cashdesk_data = {};
    var invoice_data_array = [];
    $scope.openRecipt = function (_check_status) {
        const CUSTOMER = items.full_data.customer;
        const APPOINTMENT_DATE = items.full_data.appointment_date;
        const APPOINTMENT_STATUS_ID = items.full_data.appointment_status_id;
        if (items.full_data.customer_id == 0 && items.full_data.service_id != 0) {
            var api_link = 'list_appointments_by_walking';
            var send_data = { walk_in_customer_id: items.full_data.walk_in_customer_id, appointment_date: APPOINTMENT_DATE, appointment_id: items.full_data.id, appointment_status_id: APPOINTMENT_STATUS_ID }
        } else {
            var api_link = 'list_appointments_by_customer';
            var send_data = { customer_id: CUSTOMER.id, appointment_date: APPOINTMENT_DATE, appointment_id: items.full_data.id, appointment_status_id: APPOINTMENT_STATUS_ID }
        }
        $http.post(APP.API + api_link, send_data
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            $scope.cashdesk_data.customer = CUSTOMER;
            var invoice_id_from_customer = 0;
            angular.forEach(response.data.data, function (single_data) {
                if (single_data.invoice_data != null) {
                    invoice_id_from_customer = single_data.invoice_data.invoice_id;
                }
            })
            $scope.cashdesk_data.id = (invoice_id_from_customer != 0) ? invoice_id_from_customer : undefined;
            $scope.appointments_by_date = response.data.data;
            if ($scope.cashdesk_data.id == undefined) {
                angular.forEach(response.data.data, function (single_display_data, key) {
                    //2 4 5
                    //&& single_display_data.appointment_status_id != 4
                    if (single_display_data.appointment_status_id != 4 && single_display_data.appointment_status_id != 2 && single_display_data.appointment_status_id != 5) {
                        invoice_data_array.push({
                            which_one: 'service',
                            data_id: single_display_data.service.id,
                            is_check: true,
                            worker_id: single_display_data.worker_id,
                            coupon_id: single_display_data.coupon_id,
                            appointment_id: single_display_data.id,
                            description: single_display_data.service.name,
                            display_sale_price: single_display_data.service.sales_price,
                            calculation_sale_price: single_display_data.service.sales_price,
                            tax_id: single_display_data.service.tax_id,
                            quantity: 1,
                            discount_amount: 0,
                            discount_percentage: 0,
                            data_before_discount: {},
                            discount_apply: 0,
                            single_row_total: single_display_data.service.sales_price,
                            single_row_comment: ''
                        });
                    }
                })
                if (_check_status == 'to_pay') {
                    $scope.cashdesk_data.to_pay_id = response.data.data[0].worker_id;
                    $scope.cashdesk_data.invoice_data = invoice_data_array;
                    storeAppointmentData.set($scope.cashdesk_data);
                    $state.go('app.pages.cashdesk', {});
                    $uibModalInstance.close();
                }
            } else {
                if (_check_status == 'to_pay') {
                    $scope.openUnpaidInvoice($scope.cashdesk_data.id, APPOINTMENT_STATUS_ID);
                }
            }
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.openUnpaidInvoice = function (invoice_id, appointment_status_id) {
        $http.get(APP.API + 'invoice_by_id/' + invoice_id
        ).then(function (response) {
            $scope.invoice_data_by_date = response.data.data;
            if (appointment_status_id == 4) {
                $uibModalInstance.close();
                //$state.go('app.pages.invoice/:id/:data_id', { id: invoice_id, data_id: items.full_data.id });
                $state.go('app.pages.invoice/:id/:data_id', { id: invoice_id, data_id: 0 });
            } else {
                angular.forEach($scope.appointments_by_date, function (single_display_data) {
                    if (single_display_data.appointment_status_id != 4) {
                        var index = response.data.data.invoice_data.findIndex(function (single_invoice) {
                            return (single_display_data.id == single_invoice.appointment_id)
                        })
                        if (index == -1) {
                            $scope.invoice_data_by_date.invoice_data.push({
                                which_one: 'service',
                                data_id: single_display_data.service.id,
                                is_check: true,
                                worker_id: single_display_data.worker_id,
                                coupon_id: single_display_data.coupon_id,
                                appointment_id: single_display_data.id,
                                description: single_display_data.service.name,
                                display_sale_price: single_display_data.service.sales_price,
                                calculation_sale_price: single_display_data.service.sales_price,
                                tax_id: single_display_data.service.tax_id,
                                quantity: 1,
                                discount_amount: 0,
                                discount_percentage: 0,
                                data_before_discount: {},
                                discount_apply: 0,
                                single_row_total: single_display_data.service.sales_price,
                                single_row_comment: ''
                            })
                        }
                    }
                })
                storeAppointmentData.set($scope.invoice_data_by_date);
                $uibModalInstance.close();
                $state.go('app.pages.cashdesk', {});
            }

        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.toPay = function () {
        const CUSTOMER_ID = items.full_data.customer_id;
        const APPOINTMENT_DATE = items.full_data.appointment_date;
        var send_data = { customer_id: CUSTOMER_ID, appointment_date: APPOINTMENT_DATE }
        $http.post(APP.API + 'list_appointments_by_customer', send_data
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.appointment_log = {};
    $scope.changeAppointmentService = function () {
        modalProvider
            .openPopupModal(
                APP.VIEW_PATH + 'calendar/changeAppointmentServiceModalContent.html',
                'changeAppointmentServiceCtrl',
                '',
                $scope.data_inside_modal = {
                    full_data: items
                },
                {
                    'success': function (state, title, msg) {
                        $scope.clearchangeAppointmentService(state, title, msg);
                    }
                },
                'compare-modal'
            )
    }
    $scope.clearchangeAppointmentService = function (state, title, msg) {
        cb.success(state, title, msg);
        $uibModalInstance.close();
    }
    $scope.change_customer_info = false;
    $scope.changeCustomerInfo = function () {
        $scope.change_customer_info = true;
    }
    $scope.closeChangeCustomer = function () {
        $scope.change_customer_info = false;
    }
    $scope.openLogList = function () {
        modalProvider
            .openPopupModal(
                APP.VIEW_PATH + 'calendar/appointmentLogListModalContent.html',
                'appointmentLogListCtrl',
                '',
                $scope.data_inside_modal = {
                    list_log: $scope.list_appointment_log
                },
                {
                    'success': function (state, title, msg) {
                    }
                },
                'compare-modal'
            )
    }
    $scope.appointmentCancelConfirmCheckin = function (status, appointmentid) {
        if (status == 'to_pay' || status == 'check_in') {
            $scope.appointment_log = { appointment_id: appointmentid, appointment_status: 3 }
            $http.post(APP.API + 'add_appointment_log', $scope.appointment_log
            ).then(function (response) {
                try {
                    if (response.data.status == "401") {
                        restSessionOut.getRstOut();
                    }
                } catch (err) { }
                if (response.data.success != false) {
                    if (status == 'to_pay') {
                        $scope.clearCancelConfirmCheckin('to_pay', 'to_pay', 'to_pay');
                    } else if (status == 'check_in') {
                        $scope.clearCancelConfirmCheckin('check_in', 'check_in', 'check_in');
                    }
                }
            }).catch(function (request, status, errorThrown) {
                var responce_error = request.data;
                angular.forEach(responce_error.errors, function (error) {
                    for (var i = 0; i < error.length; i++) {
                        toaster.pop('error', 'Error', error[i]);
                    }
                });
            });
        } else {
            modalProvider
                .openPopupModal(
                    APP.VIEW_PATH + 'calendar/appointmentCancelConfirmCheckinModalContent.html',
                    'cancelConfirmCheckinCtrl',
                    '',
                    $scope.data_inside_modal = {
                        status: status,
                        appointment_id: appointmentid,
                    },
                    {
                        'success': function (state, title, msg) {
                            $scope.clearCancelConfirmCheckin(state, title, msg);
                        }
                    },
                    'compare-modal'
                )
        }
    }
    $scope.clearCancelConfirmCheckin = function (state, title, msg) {
        if (state == 'success') {
            $uibModalInstance.close();
            cb.success('status_update', 'Copy', '');
        } else if (state == 'to_pay') {
            $scope.openRecipt('to_pay');
            $uibModalInstance.close();
        } else if (state == 'check_in') {
            $scope.openRecipt('check_in');
            $uibModalInstance.close();
            cb.success('success', 'Success', 'Status updated successfully.');
        }
    }
    $scope.openUpdateCustomerModal = function (form_data) {
        if (form_data != null) {
            $scope.data_inside_modal = {
                button: ['Edit', 'Update'],
                data: form_data,
                parentController: 'showAppointmentController'
            }
            modalProvider_compare
                .openPopupModal(
                    APP.VIEW_PATH + 'customers/updateCustomerModalContent.html',
                    'updateCustomerController',
                    'lg',
                    $scope.data_inside_modal,
                    {
                        'success': function (state, title, msg) {
                            $scope.clearAll(state, title, msg);
                        }
                    },
                    'compare-modal'
                )
        }
    }
    $scope.ok = function () {
        $uibModalInstance.close($scope.selected.item);
    };
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
}])
app.controller('appointmentResizeCtrl', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb", "restSessionOut", function ($scope, $uibModalInstance, $http, items, APP, toaster, cb, restSessionOut) {

    $scope.date = items.display_date
    $scope.appointment = items.event.full_data;
    $scope.appointment.is_email = (items.event.full_data.is_email == 1) ? true : false;
    $scope.appointment.start_time = items.starttime;
    $scope.appointment.end_time = items.endtime;
    $scope.appointment.service_duration = items.service_duration;
    $scope.ok = function () {
        $http.post(APP.API + 'adjust_appointment_duration', $scope.appointment
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            if (response.data.success != false) {
                $uibModalInstance.close();
                cb.success('success', 'Success', response.data.message);
            }
        }).catch(function (request, status, errorThrown) {
            var responce_error = request.data;
            angular.forEach(responce_error.errors, function (error) {
                for (var i = 0; i < error.length; i++) {
                    toaster.pop('error', 'Error', error[i]);
                }
            });
        });

    }
    $scope.cancel = function () {
        $uibModalInstance.close();
        cb.success('cancel', 'Cancel', 'Need to run revertFunc when click on cancel !!');
    };
}])
app.controller('appointmentDragConfirmationCtrl', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb", "restSessionOut",  function ($scope, $uibModalInstance, $http, items, APP, toaster, cb, restSessionOut) {
    $scope.date = items.display_date
    $scope.appointment = items.event.full_data;
    
   // $scope.appointment.service_duration = items.event.full_data.service.duration;
    $scope.appointment.service_duration = items.event.full_data.service_duration;
    $scope.display_warning = false;
    $scope.appointment.is_email = (items.event.full_data.is_email == 1) ? true : false;
    $scope.appointment.start_time = items.starttime;
    $scope.appointment.end_time = items.endtime;
    $scope.appointment.appointment_date = items.appointment_date;
    $scope.appointment.worker_id = items.worker_id;
    if (items.is_between == false || items.is_event_service_available == false) {
        $scope.display_warning = true;
    }
    $scope.warning_1 = (items.is_between == false) ? "Appointment falls outside the employee's working hours." : "";
    $scope.warning_2 = (items.is_event_service_available == false) ? "Employee does not perform " + items.event.full_data.service.name + " service." : "";
    $scope.ok = function () {
        $http.post(APP.API + 'drag_appointment', $scope.appointment
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            if (response.data.success != false) {
                $uibModalInstance.close();
                cb.success('success', 'Success', response.data.message);
            }
            $("#custom_notification_bar").removeClass("show");
        }).catch(function (request, status, errorThrown) {
            var responce_error = request.data;
            angular.forEach(responce_error.errors, function (error) {
                for (var i = 0; i < error.length; i++) {
                    toaster.pop('error', 'Error', error[i]);
                }
            });
        });
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
        cb.success('cancel', 'Cancel', 'Need to run revertFunc when click on cancel !!');
    };
}])


app.controller('extraWorkingHoursCtrl', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb", "restSessionOut", function ($scope, $uibModalInstance, $http, items, APP, toaster, cb, restSessionOut) {

    $scope.extra_working_hours = {}
    var length_of_duration = items.duration.length
    var single_duration_index = items.duration.findIndex(function (single_duration) { return (single_duration == items.start_time) })
    $scope.end_time_duration = items.duration.slice(single_duration_index, length_of_duration);
    $scope.extra_working_hours.start_time = items.start_time;
    $scope.extra_working_hours.end_time = items.end_time;
    $scope.extra_working_hours.date = items.appointment_date;
    $scope.extra_working_hours.worker_id = items.worker_id; //dayindex
    $scope.extra_working_hours.dayindex = (new Date(items.appointment_date_for_day_index)).getUTCDay();
    $scope.ok = function () {
        if ($scope.extra_working_hours.start_time == $scope.extra_working_hours.end_time) {
            $uibModalInstance.close();
        }
        $http.post(APP.API + 'add_users_extra_working_hour', $scope.extra_working_hours
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            if (response.data.success != false) {
                $uibModalInstance.close();
                cb.success('success', 'Success', response.data.message);
            }
        }).catch(function (request, status, errorThrown) {
            var responce_error = request.data;
            angular.forEach(responce_error.errors, function (error) {
                for (var i = 0; i < error.length; i++) {
                    toaster.pop('error', 'Error', error[i]);
                }
            });
        });
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };

}])

app.controller('showExtraTimeCtrl', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb", "restSessionOut",  function ($scope, $uibModalInstance, $http, items, APP, toaster, cb, restSessionOut) {

    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    var month = new Array();
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";

    $scope.day_name = weekday[items.full_data.dayindex];
    $scope.month_name = month[(new Date(items.full_data.date)).getMonth()];
    $scope.year = (new Date(items.full_data.date)).getFullYear();
    $scope.date = (new Date(items.full_data.date)).getDate();
    $scope.from_time = items.full_data.from_time.substring(0, 5);
    $scope.to_time = items.full_data.to_time.substring(0, 5);

    $scope.deleteExtraTime = function () {
        $http.post(APP.API + 'delete_users_extra_working_hour', { extra_working_hour_id: items.full_data.id }
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            if (response.data.success != false) {
                $uibModalInstance.close();
                cb.success('success', 'Success', response.data.message);
            }
        }).catch(function (request, status, errorThrown) {
            var responce_error = request.data;
            angular.forEach(responce_error.errors, function (error) {
                for (var i = 0; i < error.length; i++) {
                    toaster.pop('error', 'Error', error[i]);
                }
            });
        });
    }
    $scope.createAppointment = function () {
        $uibModalInstance.close();
        cb.success('create_appointment', 'Cancel', 'Need to run revertFunc when click on cancel !!');
    };
    $scope.cancel = function () {
        $uibModalInstance.close();
    };

}])

app.controller('cancelConfirmCheckinCtrl', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb", "restSessionOut",  function ($scope, $uibModalInstance, $http, items, APP, toaster, cb, restSessionOut) {

    $scope.status = items.status;
    $scope.appointment_id = items.appointment_id;
    $scope.appointment_log = {};
    $scope.appointment_log.cancel_reason = 1;
    switch ($scope.status) {
        case 'cancel':
            $scope.message1 = 'Mark appointments as canceled?';
            $scope.message2 = '';
            $scope.fa_icon = 'fa-thumbs-down';
            $scope.button1 = 'Cancel';
            $scope.button2 = 'Yes, cancel appointment';
            break;
        case 'confirm':
            $scope.message1 = 'Mark appointment as confirmed? ';
            $scope.message2 = 'Customer has confirmed the agreement. Send an appointment confirmation here?';
            $scope.fa_icon = 'fa-thumbs-up';
            $scope.button1 = 'No';
            $scope.button2 = 'Yes, confirm appointment';
            break;
        case 'check_in':
            $scope.message1 = 'Mark appointment as checked in? ';
            $scope.message2 = 'customer has arrived, create an open receipt';
            $scope.fa_icon = 'fa-inr';
            $scope.button1 = 'No';
            $scope.button2 = 'Yes, check in appointment';
            break;
        case 'to_pay':
            $scope.message1 = 'Mark appointment as complete in? ';
            $scope.message2 = 'customer has arrived, create an open receipt';
            $scope.fa_icon = 'fa-inr';
            $scope.button1 = 'No';
            $scope.button2 = 'Yes, appointment complete';
            break;
    }

    $scope.submitButtonCancelConfirmCheckin = function (coming_status) {
        $scope.appointment_log.appointment_id = $scope.appointment_id
        switch (coming_status) {
            case 'cancel':
                $scope.appointment_log.appointment_status = 5;
                break;
            case 'confirm':
                $scope.appointment_log.appointment_status = 2
                break;
            case 'check_in':
                $scope.appointment_log.appointment_status = 3
                break;
            case 'to_pay':
                $scope.appointment_log.appointment_status = 3
                break;
        }
        $http.post(APP.API + 'add_appointment_log', $scope.appointment_log
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            if (response.data.success != false) {
                $uibModalInstance.close();
                if (coming_status != 'to_pay') {
                    cb.success('success', 'Success', response.data.message);
                } else {
                    cb.success('to_pay', 'Success', response.data.message);
                }
            }

        }).catch(function (request, status, errorThrown) {
            var responce_error = request.data;
            angular.forEach(responce_error.errors, function (error) {
                for (var i = 0; i < error.length; i++) {
                    toaster.pop('error', 'Error', error[i]);
                }
            });

        });
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };

}])
app.controller('appointmentLogListCtrl', ["$scope", "$uibModalInstance", "items", function ($scope, $uibModalInstance, items) {
    $scope.appointment_log_list = items.list_log;
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
}])

app.controller('changeAppointmentServiceCtrl', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb", "restSessionOut", "SweetAlert", "duration", function ($scope, $uibModalInstance, $http, items, APP, toaster, cb, restSessionOut, SweetAlert,duration) {

   
    $scope.ids = {};
    $scope.save_service = {};
    $scope.durations = duration.displyaDuration(480);
    const appointment_full_data = items.full_data.full_data;
    const SERVICES = items.full_data.services;
    const SERVICE_CATEGORIES = items.full_data.service_categories;
    const service_ids = appointment_full_data.worker.user_services.map(function (i) { return i.service_id });
    const worker_services = SERVICES.filter(function (services) { return service_ids.includes(services.id) });
    const category_ids = worker_services.map(x => x.category_id);
    category_ids.filter((v, i) => category_ids.indexOf(v) == i);
    const worker_services_categories = SERVICE_CATEGORIES.filter(function (service_category) {
        return category_ids.includes(service_category.id);
    })

    $scope.current_service = { service_id: appointment_full_data.service_id }
    $scope.service_categories = worker_services_categories;
    $scope.services = worker_services;
    $scope.ids[appointment_full_data.service_id] = true;
    var index_of_service_id = worker_services.findIndex(function (service) { return service.id == appointment_full_data.service_id; })
    if (index_of_service_id != -1) {
        $scope.services[index_of_service_id].duration = appointment_full_data.service_duration;
    }
    $scope.used_service_name = appointment_full_data.service.name;
    $scope.onSearch = function () {
        const filter_services = worker_services.filter(function (service) {
            const index_name = (service.name.toLowerCase()).indexOf($scope.search.search_service.toLowerCase());
            const index_price = (service.sales_price.toString()).indexOf($scope.search.search_service);
            if (index_name != -1 || index_price != -1) {
                return service;
            }
        })
        const category_ids = filter_services.map(x => x.category_id);
        category_ids.filter((v, i) => category_ids.indexOf(v) == i);
        filter_service_categories = worker_services_categories.filter(function (service_category) {
            return category_ids.includes(service_category.id);
        })
        $scope.service_categories = ($scope.search.search_service != '') ? filter_service_categories : worker_services_categories;
        $scope.services = ($scope.search.search_service != '') ? filter_services : worker_services;
    }

    $scope.serviceCheck = function (service) {
        $scope.save_service = service
        $scope.ids[service.id] = true;
        angular.forEach($scope.ids, function (single_id, key) { if (key != service.id) { $scope.ids[key] = false; } });
        if (service.service_category.type == 1) {
            if ($scope.current_service.service_id == service.id) {
                var request_data = {
                    service_cat_id: service.service_category.id,
                    service_id: service.id,
                    appointment_date: appointment_full_data.appointment_date,
                    starttime: appointment_full_data.start_time,
                    endtime: appointment_full_data.end_time,
                    duration: service.duration,
                    no_of_apointment: service.service_category.no_of_appointment
                }
                $http.post(APP.API + 'check_same_appointment_for_machine', request_data
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    if (response.data.success != false) {
                        if (response.data.data >= service.service_category.no_of_appointment) {

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
                                        $scope.ids[service.id] = true;
                                    } else {
                                        $scope.ids[service.id] = false;
                                        service.duration = 5
                                    }
                                });
                        }
                    }
                }).catch(function (request, status, errorThrown) {
                });
            }
        }
    }
    $scope.saveChangeService = function () {
        var save_change_service_data = { appointment_id: appointment_full_data.id, service: $scope.save_service, worker_id: appointment_full_data.worker.id, start_time: appointment_full_data.start_time }
        $http.post(APP.API + 'save_change_service', save_change_service_data
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            if (response.data.success != false) {
                $uibModalInstance.close();
                cb.success('success', 'Success', response.data.message);
            }
        }).catch(function (request, status, errorThrown) {
            var responce_error = request.data;
            angular.forEach(responce_error.errors, function (error) {
                for (var i = 0; i < error.length; i++) {
                    toaster.pop('error', 'Error', error[i]);
                }
            });
        });
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
}])

app.controller('blockTimeDragCtrl', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb", "restSessionOut", function ($scope, $uibModalInstance, $http, items, APP, toaster, cb, restSessionOut) {
    const EVENT = items.event;
    $scope.block_time = {}
    $scope.date = EVENT.start.format('DD-MM-YYYY H:mm:ss');
    $scope.block_time.id = EVENT.full_data.id;
    $scope.display_warning = false;
    $scope.block_time.is_email = (items.event.full_data.is_email == 1) ? true : false;
    $scope.block_time.start_time = EVENT.start.format("HH:mm");
    $scope.block_time.end_time = EVENT.end.format("HH:mm");
    $scope.block_time.appointment_date = EVENT.start.format('YYYY-MM-DD')
    $scope.block_time.worker_id = EVENT.resourceId;
    $scope.ok = function () {
        $http.post(APP.API + 'drag_blocktime', $scope.block_time
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            if (response.data.success != false) {
                $uibModalInstance.close();
                cb.success('success', 'Success', response.data.message);
            }

        }).catch(function (request, status, errorThrown) {
            var responce_error = request.data;
            angular.forEach(responce_error.errors, function (error) {
                for (var i = 0; i < error.length; i++) {
                    toaster.pop('error', 'Error', error[i]);
                }
            });

        });
    }
    $scope.cancel = function () {
        cb.success('cancel', 'Cancel', 'Need to run revertFunc when click on cancel !!');
        $uibModalInstance.close();
    };
}])
app.controller('extraTimeDragCtrl', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb", "restSessionOut", function ($scope, $uibModalInstance, $http, items, APP, toaster, cb, restSessionOut) {

    const EVENT = items.event;
    $scope.extra_time = {}
    $scope.date = EVENT.start.format('DD-MM-YYYY H:mm:ss');
    $scope.extra_time.id = EVENT.full_data.id;
    $scope.extra_time.start_time = EVENT.start.format("HH:mm");
    $scope.extra_time.end_time = EVENT.end.format("HH:mm");
    $scope.extra_time.date = EVENT.start.format('YYYY-MM-DD');
    $scope.extra_time.worker_id = EVENT.resourceId;
    $scope.extra_time.dayindex = EVENT.start._d.getUTCDay()
    $scope.ok = function () {
        $http.post(APP.API + 'drag_extra_time', $scope.extra_time
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            if (response.data.success != false) {
                $uibModalInstance.close();
                cb.success('success', 'Success', response.data.message);
            }
        }).catch(function (request, status, errorThrown) {
            var responce_error = request.data;
            angular.forEach(responce_error.errors, function (error) {
                for (var i = 0; i < error.length; i++) {
                    toaster.pop('error', 'Error', error[i]);
                }
            });
        });
    }
    $scope.cancel = function () {
        cb.success('cancel', 'Cancel', 'Need to run revertFunc when click on cancel !!');
        $uibModalInstance.close();
    };

}])
app.filter('space', function () {
    return function (column) {
        column = column.toString();
        column = column.split(' ').join('');
        column = column.match(/.{1,2}/g).join(' ');
        return column;
    };
});
