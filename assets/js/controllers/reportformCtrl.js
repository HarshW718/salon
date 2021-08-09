'use strict';
/** 
  * controller for angular-ckeditor
*/
app.controller('reportformCtrl', ['$scope', '$window', '$http','APP','$stateParams','toaster' ,function ( $scope, $window,$http,APP,$stateParams,toaster) {
    
    $scope.check_admin = window.location.href.split('?')[1];
    if($scope.fromDate==undefined){
        $scope.fromDate={};
    }
    
    if($stateParams.company_id){
        
        $http({
            url:APP.API + 'get_form_html?company_id='+$stateParams.company_id+'&form_id='+$stateParams.form_id+'&customer_id='+$stateParams.customer_id+'&app_id='+$stateParams.app_id,
            method: "get",
        }).then(function (response) {

            if (response.data.error == false) {
                    $scope.fromData=response.data.data[0];
                    console.log('$scope.fromData',$scope.fromData);
                    if($scope.fromData.sign != ''){
                        $scope.display_signature_box = false;
                    }else{
                        $scope.display_signature_box = true;
                    }
                    
                    if ($scope.check_admin != undefined) {
                        $scope.disable = false;
                    }else {
                        if($scope.fromData.ans_by_customer != 0){
                            $scope.disable = true;
                            
                        }else{
                            $scope.disable = false;
                        }
                    }
                    $scope.update_form = {date:new Date($scope.fromData.form_ans_date)}
                    $scope.fromData.fileds=JSON.parse($scope.fromData.fileds);
                    if($scope.fromData.description){
                        $('#displayDesc').html($scope.fromData.description);
                    }
            
            } else {

                toaster.pop('error', 'Error',response.data.message);
            }
        })
    }

    $scope.changeSign = function(){
        if($scope.display_signature_box){
            $scope.display_signature_box = false;
        }else{
            $scope.display_signature_box = true;
        }
        


    }
    $scope.saveFormAns = function (frm_id) {

        //if($scope.fromData.type==1){
            
            var signature = $scope.accept();
            if (signature.isEmpty) {
                toaster.pop('error', 'Error','Please sign your signature'); 
                return false;
            }else {
                
                $scope.fromData.sign=$scope.accept().dataUrl;
            }
        //}
        
        if ($("#" + frm_id).valid()) 
        {
            
            if($stateParams.company_id != 0){
                $scope.fromData.user_company_id=$stateParams.company_id;
            }
            if($stateParams.customer_id != 0){
                $scope.fromData.customer_id=$stateParams.customer_id;
            }
            if($stateParams.company_id != 0 && $stateParams.customer_id != 0){
                $scope.fromData.app_id=$stateParams.app_id;
            }

            $scope.fromData.fileds=JSON.stringify($scope.fromData.fileds);
            
            $scope.fromData.form_id=$stateParams.form_id;


            var year = $scope.update_form.date.getFullYear();
            var month = (($scope.update_form.date.getMonth() + 1).length < 2) ? '0' + ($scope.update_form.date.getMonth() + 1) : ($scope.update_form.date.getMonth() + 1);
            var day = (($scope.update_form.date.getDate()).length < 2) ? '0' + $scope.update_form.date.getDate() : $scope.update_form.date.getDate();
            var final_date = year+'-'+month+'-'+day;

            $scope.fromData.form_ans_date = final_date;

            
            
            $http({
                url:APP.API + 'save_form_ans',
                method: "post",
                data: $scope.fromData
            }).then(function (response) {
                
                
                if (response.data.error == false) {

                    toaster.pop('success', 'Success',response.data.message);
                    setTimeout(function(){
                        var win = $window.open("about:blank", "_self");
                        win.close();
                    },1000);

                } else {

                    toaster.pop('error', 'Error',response.data.message);
                }
            });
        }
    }
    $scope.checkboxChange = function (index) {
        var checkedVal = $('#optChk'+index).is(":checked");
        angular.forEach($scope.fromData.fileds,function(v,i){
            if(v.type === "checkboxes"){
                $scope.fromData.fileds[i].options[index].selected = checkedVal;
            }
        })
    }
    
    $scope.updateFormAns = function (frm_id) {
        
        if ($("#" + frm_id).valid()) 
        {

            if($scope.display_signature_box){
                var canvas = document.getElementById('canvas');
                var dataURL = canvas.toDataURL();
                $scope.fromData.sign=dataURL;
            } 
            
            $scope.fromData.fileds=JSON.stringify($scope.fromData.fileds);
            $scope.fromData.form_id=$stateParams.form_id;
            if($stateParams.company_id != 0){
                $scope.fromData.user_company_id=$stateParams.company_id;
            }
            if($stateParams.customer_id != 0){
                $scope.fromData.customer_id=$stateParams.customer_id;
            }
            if($stateParams.company_id != 0 && $stateParams.customer_id != 0){
                $scope.fromData.app_id=$stateParams.app_id;
            }
            var year = $scope.update_form.date.getFullYear();
            var month = (($scope.update_form.date.getMonth() + 1).length < 2) ? '0' + ($scope.update_form.date.getMonth() + 1) : ($scope.update_form.date.getMonth() + 1);
            var day = (($scope.update_form.date.getDate()).length < 2) ? '0' + $scope.update_form.date.getDate() : $scope.update_form.date.getDate();
            var final_date = year+'-'+month+'-'+day;
            $scope.fromData.form_ans_date = final_date;
            $scope.fromData.ans_given_by = ($scope.check_admin == undefined) ? 'customer':'admin';
            
            $http({
                url:APP.API + 'update_form_ans',
                method: "post",
                data: $scope.fromData
            }).then(function (response) {
                
            
                if (response.data.error == false) {
                    
                    toaster.pop('success', 'Success',response.data.message);
                    setTimeout(function(){
                        var win = $window.open("about:blank", "_self");
                        win.close();
                    },1000);

                } else {

                    toaster.pop('error', 'Error',response.data.message);
                }
            });
        }
    }
    
    $scope.closeWindow=function(){
        var win = $window.open("about:blank", "_self");
        win.close();
    }
    

    $scope.start = $scope.minDate;
    $scope.end = $scope.maxDate;
    $scope.datepickerOptions = {
        showWeeks: false,
        startingDay: 1,
        datepickerMode: 'day',
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
    $scope.toggleMin = function () {
        $scope.datepickerOptions.minDate = $scope.datepickerOptions.minDate ? null : new Date();
        $scope.dateDisabledOptions.minDate = $scope.dateDisabledOptions.minDate ? null : new Date();
    };
    $scope.maxDate = new Date(2020, 5, 22);
    $scope.minDate = new Date(1970, 12, 31);
    $scope.open = function (type) {
    
            if (type == 'consent') {
                $scope.consent_opened = !$scope.consent_opened;
            }else if(type == 'medical') {
                $scope.medical_opened = !$scope.medical_opened;
            }
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
    $scope.formats = ['dd-MM-yyyy'];
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
        $scope.dt = d;
    };
    $scope.changed = function () {
        $log.log('Time changed to: ' + $scope.dt);
    };
    $scope.clear = function () {
        $scope.dt = null;
    };


}]);
