app.controller('sms_templateCtrl', ["$scope",  "restSessionOut", "$http", "APP", "notifications",'DTOptionsBuilder', 'DTColumnBuilder', '$compile','SweetAlert', function ($scope, restSessionOut, $http, APP, notifications,DTOptionsBuilder, DTColumnBuilder, $compile,SweetAlert) {

    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }
    $scope.dtIntanceInvoiceRequestCallback = function (instance) {
        $scope.dtInstanceInvoiceRequest = instance;
    }
    $scope.dtInstanceInvoiceRequest = {};
    $scope.flag_request = 0;

    $scope.dtOptionInvoiceRequest = DTOptionsBuilder.newOptions().withOption('ajax', function (data, callback, settings) {
        
        var sque = data.order[0].dir;
        var columnmna = data.columns[data.order[0].column].name;

        $http({
            method: "post",
            url: APP.API + 'sms_list',
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
        DTColumnBuilder.newColumn('typename').withTitle('Message type').withOption('sName', 'typename'),
        DTColumnBuilder.newColumn('name').withTitle('Description').withOption('sName', 'name'),
        DTColumnBuilder.newColumn('id').withTitle("Action").withOption('sName', 'id').renderWith(actionList)
      
    ];
    $scope.dtColumnInvoiceRequestDefs = [

    ];
    function createdRow(row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    }
    function actionList(data, type, full, meta) {
        
        // return "<a href='#!/app/pages/edit_sms_template/"+full.id+"' title='Edit sms template'   ><i class='fa fa-edit text-large'></i></a><a class='margin-left-10' title='Delete sms template' ><i ng-click='deleteTemplate(" + full.id + ")' class='fa fa-remove text-large'></i></a>";

        return "<a href='#!/app/pages/edit_sms_template/"+full.id+"' title='Edit sms template'   ><i class='fa fa-edit text-large'></i></a>";

    }
    
    $scope.deleteTemplate = function (id) {
        $scope.template_id = { id: id };
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to delete template!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                $http.post(APP.API + 'delete_sms_template', $scope.template_id
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    console.log('return_data', response.data);
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
    };

}])
app.controller('add_email_templateCtrl', ["$scope", "restSessionOut", "$http", "APP", "$stateParams", "notifications",'$state', function ($scope, restSessionOut, $http, APP, $stateParams, notifications,$state) {
    
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }
    if($scope.template == undefined){
       $scope.template={}; 
    }
    
    if($scope.type==undefined){
        $scope.type={};
    }
    if($stateParams.id){
       
        $http.get(APP.API + 'get_sms_template?id='+$stateParams.id
            ).then(function (response) {
        try {
            if (response.data.status == "401") {
                restSessionOut.getRstOut();
            }
        } catch (err) {
        }
        
        if (response.data.success == false) {
            
            $scope.template=response.data.data[0];
            
        } else {
            
            notifications.Message('error', 'Error', response.data.message);
        }


    }).catch(function (request, status, errorThrown) {

    });
    }
   // $scope.type[1]={'value':1,'name':'Reminder'};
    $scope.type[1]={'value':1,'name':'Offer'};    
    //$scope.type[3]={'value':3,'name':'Change'};    
    
    
    
    
    if($scope.placeHolders==undefined){
        $scope.placeHolders={};
    }
    $scope.placeHolders[0]={'name':'[[company-logo]]','description':'Company logo (see management-> company settings)'};
    $scope.placeHolders[1]={'name':'[[company-name]]','description':'Company name (see management-> company settings)'};
    $scope.placeHolders[2]={'name':'[[company-number]]','description':'Company number (see management-> company settings)'};
    $scope.placeHolders[3]={'name':'[[company-email]]','description':'Company email (see management-> company settings)'};
    $scope.placeHolders[4]={'name':'[[company-address]]','description':'Reminder'};
    $scope.placeHolders[5]={'name':'[[certificate-number]]','description':'Worker certificate-number (see management-> Staff)'};
    $scope.placeHolders[6]={'name':'[[customer-firstname]]','description':"client's first name"};
    $scope.placeHolders[7]={'name':'[[customer-lastname]]','description':"client's last name"};
    $scope.placeHolders[8]={'name':'[[customer-address]]','description':"client's address"};
    $scope.placeHolders[10]={'name':'[[customer-number]]','description':"client's number"};
    $scope.placeHolders[11]={'name':'[[gender]]','description':"Salutation can be Mr or Mrs if empty Mr / Mrs"};
    $scope.placeHolders[12]={'name':'[[staff-name]]','description':"name of service provider"};
    $scope.placeHolders[13]={'name':'[[services]]','description':"all scheduled services from customer"};
    $scope.placeHolders[14]={'name':'[[time]]','description':"time of the appointment"};
    $scope.placeHolders[15]={'name':'[[date]]','description':"date of the appointment"};
    
    $scope.addTextAtCaret = function (textAreaId,text) {
        
        var textArea = document.getElementById(textAreaId);
        var cursorPosition = textArea.selectionStart;
        $scope.addTextAtCursorPosition(textArea, cursorPosition, text);
        $scope.updateCursorPosition(cursorPosition, text, textArea);
        
    }
    
    $scope.addTextAtCursorPosition= function (textArea, cursorPosition, text)   {
        
        var front = (textArea.value).substring(0, cursorPosition);
        var back = (textArea.value).substring(cursorPosition, textArea.value.length);
        textArea.value = front + text + back;
        $scope.template.sms_content=front + text + back;
        
    }
    
    $scope. updateCursorPosition = function(cursorPosition, text, textArea)     {
        
        cursorPosition = cursorPosition + text.length;
        textArea.selectionStart = cursorPosition;
        textArea.selectionEnd = cursorPosition;
        textArea.focus();  
        
    }
    
    $scope.saveTemplate = function (frm_id) {
        if ($('#'+frm_id).valid()) {
            
            $http.post(APP.API + 'save_sms_template', $scope.template
                    ).then(function (response) {
                try {
                    if (response.data.status == "401") {
                        restSessionOut.getRstOut();
                    }
                } catch (err) {
                }
                
                if (response.data.success == false) {
                    $state.go('app.pages.sms_template');
                    notifications.Message('success', 'Success', response.data.message);
                } else {
                    
                    notifications.Message('error', 'Error', response.data.message);
                }


            }).catch(function (request, status, errorThrown) {

            });
        }

    }
   
}]);
