app.controller('form_builderCtrl', ["$scope", "restSessionOut", "$http", "APP", "$stateParams", "notifications", '$state', function ($scope, restSessionOut, $http, APP, $stateParams, notifications, $state) {

        var auth_token = localStorage.getItem('auth_token');
        $http.defaults.headers.common.authtoken = auth_token;
        if (!localStorage.getItem('auth_token')) {
            restSessionOut.getRstOut();
        }
        if (!sessionStorage.getItem('login_time')) {
            restSessionOut.getRstOut();
        }
        
        $scope.newField = {type:'text'};
        if($scope.reportForm==undefined){
            $scope.reportForm={};
        }
        
        if($scope.type==undefined){
            $scope.type={};
        }
        $scope.type[1]={'value':1,'name':'Consent Form'};
        //$scope.type[2]={'value':2,'name':'Treatment Form'};    
        $scope.type[3]={'value':3,'name':'Medical Form'};
        
	$scope.fields = [];
	$scope.editing = false;
	$scope.tokenize = function(slug1, slug2) {
		var result = slug1;
		result = result.replace(/[^-a-zA-Z0-9,&\s]+/ig, '');
		result = result.replace(/-/gi, "_");
		result = result.replace(/\s/gi, "-");
		if (slug2) {
			result += '-' + $scope.token(slug2);
		}
		return result;
	};
	$scope.saveField = function(frm_id) {
		
        if ($("#" + frm_id).valid()) {
		if ($scope.newField.type == 'checkboxes') {
			$scope.newField.value = {};
		}
		if ($scope.editing !== false) {
			$scope.fields[$scope.editing] = $scope.newField;
			$scope.editing = false;
		} else {
			$scope.fields.push($scope.newField);
		}
		$scope.newField = {
			order : 0
		};
            }
	};
	$scope.editField = function(field) {
		$scope.editing = $scope.fields.indexOf(field);
		$scope.newField = field;
	};
	$scope.splice = function(field, fields) {
		fields.splice(fields.indexOf(field), 1);
	};
	$scope.addOption = function() {
		if ($scope.newField.options === undefined) {
			$scope.newField.options = [];
		}
		$scope.newField.options.push({
			order : 0
		});
	};
	$scope.typeSwitch = function(type) {
		/*if (angular.Array.indexOf(['checkboxes','select','radio'], type) === -1)
			return type;*/
		if (type == 'checkboxes')
			return 'multiple';
		if (type == 'select')
			return 'multiple';
		if (type == 'radio')
			return 'multiple';

		return type;
	}
        
        $scope.saveFormFiled= function(frm_id){
            
            if ($("#" + frm_id).valid()) {
                
                $scope.reportForm.fileds=$scope.fields;
                
                $scope.description = '';
                if($scope.formContent){
                    $scope.reportForm.description = $scope.formContent;
                }
                
                
                    
                $http({
                    url:APP.API + 'save_report_form',
                    method: "post",
                    data: $scope.reportForm
                }).then(function (response) {
                    
                    var return_responce = response.data;
                    if (response.data.error == false) {
                        
                        $state.go('app.pages.form_list');
                        notifications.Message('success', 'Success', response.data.message);
                        
                    } else {
                        
                        notifications.Message('error', 'Error', response.data.message);
                        
                    }
                });
            }
            
        }
        if($stateParams.id){
            $http.get(APP.API + 'get_report_form?id='+$stateParams.id
                ).then(function (response) {
                try {
                    if (response.data.status == "401") {
                        restSessionOut.getRstOut();
                    }
                } catch (err) {
                }
                if (response.data.success == false) {

                    $scope.reportForm=response.data.data[0];
                    $scope.fields = JSON.parse($scope.reportForm.fileds);
                    $('#displayFormContent').html($scope.reportForm.description);
                    $scope.formContent=$scope.reportForm.description;
                    CKEDITOR.instances.editor1.setData($scope.reportForm.description,function()
                {
                   
                    this.checkDirty();  // true
                   
                });
                    $scope.fields=JSON.parse(response.data.data[0].fileds);
                    $scope.apply();
                   

                } else {

                    notifications.Message('error', 'Error', response.data.message);
                }
                
            }).catch(function (request, status, errorThrown) {

            });
        }
        
        
    

}]);
app.controller('formlistCtrl', ["$scope", "SweetAlert", 'DTOptionsBuilder', 'DTColumnBuilder',  '$compile', '$http',  'APP', 'notifications', 'restSessionOut', function ($scope, SweetAlert, DTOptionsBuilder, DTColumnBuilder,  $compile, $http, APP, notifications, restSessionOut) {
    
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
        
    $scope.dtIntanceInvoiceRequestCallback = function (instance) {
        $scope.dtInstanceInvoiceRequest = instance;
    }
    
    $scope.dtInstanceInvoiceRequest = {};
    $scope.flag_request = 0;
    
    $scope.dtOptionInvoiceRequest = DTOptionsBuilder.newOptions().withOption('ajax', function (data, callback, settings) {
        if (data.order[0].column == 0) {
            var sque = 'desc';
            var columnmna = 'id';
        } else {
            var sque = data.order[0].dir;
            var columnmna = data.columns[data.order[0].column].name;
        }

        $http({
            method: "post",
            url: APP.API + 'dt_form_list',
            data: {

                length: data.length,
                start: data.start,
                draw: data.draw,
                column_name: columnmna,
                order: sque,
                search: data.search.value,


            }
        }).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }

            if (response.data.success) {
                callback({
                    draw: response.data.draw,
                    recordsTotal: response.data.recordsTotal,
                    recordsFiltered: response.data.recordsFiltered,
                    data: response.data.data
                });
            } else {

            }
        }, function (error) {
        });
    })
        .withDataProp('data')
        .withOption('processing', false)
        .withOption('serverSide', true)
        .withOption('createdRow', createdRow)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('destroy', true)
        .withDisplayLength(10)
        .withBootstrap()
        .withPaginationType('simple')




    $scope.dtColumnInvoiceRequest = [
        DTColumnBuilder.newColumn('title').withTitle('Name').withOption('sName','title'),
        DTColumnBuilder.newColumn('type').withTitle('type').withOption('sName','type').renderWith(typeName),
        DTColumnBuilder.newColumn('id').withTitle("Action").withOption('sName', 'id').renderWith(actionList)
    ];
    $scope.dtColumnInvoiceRequestDefs = [

    ];
    function createdRow(row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    }


    function actionList(data, type, full, meta) {

        var full_string = JSON.stringify(full);
        return "<a href='#!/app/pages/form_builder/"+full.id+"' title='Edit form'   ><i class='fa fa-edit text-large'></i></a><a class='margin-left-10' title='Delete form' ><i ng-click='deleteform(" + full.id + ")' class='fa fa-remove text-large'></i></a>";

    }

    function typeName(data, type, full, meta) {
        if(full.type == 1){
            return "Consent Form";
        }else if(full.type == 2){
            return "Treatment Form";
        }else if(full.type == 3){
            return "Medical Form";    
        }else{
            return 'NUll'
        }

    }
    
    $scope.deleteform = function (id) {
        
        $scope.template_id = { id: id };
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to delete form!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            
            if (isConfirm) {
                
                $http.post(APP.API + 'delete_form', $scope.template_id
                ).then(function (response) {
                    
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    
                    if (response.data.success != true) {
                        
                        notifications.Message('error', 'Error', response.data.message);
                    } else {
                        
                        notifications.Message('success', 'Success', response.data.message);
                        $scope.dtInstanceInvoiceRequest.rerender();
                    }

                
                }).catch(function (request, status, errorThrown) {

                });
            } else {

            }
            
        });
    }

    //For Data Table Start

    $scope.dtIntanceReportRequestCallback = function (instance) {
        $scope.dtInstanceReportRequest = instance;
    }
    $scope.dtInstanceReportRequest = {};
    $scope.flag_request = 0;
    //  var titleHtml = '<div class="checkbox clip-check check-primary ng-scope"><input type="checkbox" id="0_ischeck_0" class="select_all" ng-click="clickme()"><label for="0_ischeck_0"></label></div>';
    $scope.dtOptionReportRequest = DTOptionsBuilder.newOptions().withOption('ajax', function (data, callback, settings) {
        if (data.order[0].column == 0) {
            var sque = 'desc';
            var columnmna = 'id';
        } else {
            var sque = data.order[0].dir;
            var columnmna = data.columns[data.order[0].column].name;
        }

        $http({
            method: "post",
            url: APP.API + 'dt_form_sub_list',
            data: {

                length: data.length,
                start: data.start,
                draw: data.draw,
                column_name: columnmna,
                order: sque,
                search: data.search.value,
            }
        }).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }

            if (response.data.success) {
                callback({
                    draw: response.data.draw,
                    recordsTotal: response.data.recordsTotal,
                    recordsFiltered: response.data.recordsFiltered,
                    data: response.data.data
                });
            } else {

            }
        }, function (error) {
        });
    })
        .withDataProp('data')
        .withOption('processing', false)
        .withOption('serverSide', true)
        .withOption('createdRow', createdRow)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('destroy', true)
        .withDisplayLength(10)
        .withBootstrap()
        .withPaginationType('simple')

    $scope.dtColumnReportRequest = [
        DTColumnBuilder.newColumn('title').withTitle('Title').withOption('sName', 'title'),
        DTColumnBuilder.newColumn('title_value').withTitle('Description').withOption('sName', 'title_value'),
        DTColumnBuilder.newColumn('id').withTitle("Action").withOption('sName', 'id').renderWith(actionSubFormList)
    ];
    $scope.dtColumnReportRequestDefs = [

    ];
    function createdRow(row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    }


    function actionSubFormList(data, type, full, meta) {

        var full_string = JSON.stringify(full);
        return "<a ng-click='editFormSub(" + full_string + ")'><i class='fa fa-edit text-large'></i></a><a class='margin-left-10'><i ng-click='deleteFormSub(" + full.id + ")' class='fa fa-remove text-large'></i></a>";

    }
    
    $scope.report_sub_form = true;
    $scope.report_sub_list = false;
    $scope.showReportSubForm = function (){
        $scope.report_sub_form = false;
        $scope.report_sub_list = true;
    }
    $scope.hideCategoryForm = function (){
        $scope.report_sub_form = true;
        $scope.report_sub_list = false;
    }

    if($scope.form_sub==undefined){
        $scope.form_sub={};
    }

    var php_api_link = '';
    $scope.submitSubForm = function () {

        if ($('#id_subForm').valid()) {

                php_api_link =  (typeof($scope.form_sub.id) !== 'undefined') ? 'update_form_sub' : 'save_form_sub';
                
                var description = CKEDITOR.instances['description_vlaue'].getData();
                $scope.form_sub.title_value = description;
                $http.post(APP.API + php_api_link, $scope.form_sub
                ).then(function (response) {
                    var return_responce = response.data;
                    var return_responce = response.data;
                    if (return_responce.success != false) {
                        $scope.dtInstanceReportRequest.rerender();
                        $scope.report_sub_form = true;
                        $scope.report_sub_list = false;
                        notifications.Message('success', 'Success', return_responce.message);
                    } else {
                        notifications.Message('error', 'Error', return_responce.message);
                    }
                }).catch(function (request, status, errorThrown) {
                    var responce_error = request.data;
                    angular.forEach(responce_error.errors, function (error) {
                        for (var i = 0; i < error.length; i++) {
                            notifications.Message('error', 'Error', error[i]);
                        }
                    });
                });
           
        } else {
            return false;
        }
    }
    $scope.editFormSub = function (edit_data) {

        $scope.report_sub_form = false;
        $scope.report_sub_list = true;
        $scope.form_sub = edit_data;

    }

    $scope.deleteFormSub = function (id) {
        $scope.delete_id = { id: id };
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to delete!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {

            if (isConfirm) {
                $http.post(APP.API + 'delete_form_sub', $scope.delete_id
                ).then(function (response) {
                   
                    if (response.data.success != true) {
                        notifications.Message('warning', 'Warning', response.data.message);
                    } else {
                        notifications.Message('success', 'Success', response.data.message);
                        $scope.dtInstanceReportRequest.rerender();
                    }
                }).catch(function (request, status, errorThrown) {

                })
            } else {

            }
        })
    }
}]);
