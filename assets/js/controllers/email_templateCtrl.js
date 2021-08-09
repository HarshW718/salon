app.controller('email_templateCtrl', ["$scope", "restSessionOut", "$http", "APP", "notifications",'DTOptionsBuilder', 'DTColumnBuilder', '$compile','SweetAlert', function ($scope, restSessionOut, $http, APP,  notifications,DTOptionsBuilder, DTColumnBuilder, $compile,SweetAlert) {

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
            url: APP.API + 'email_list',
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
        
        // return "<a href='#!/app/pages/edit_email_template/"+full.id+"' title='Edit email template'   ><i class='fa fa-edit text-large'></i></a><a class='margin-left-10' title='Delete email template' ><i ng-click='deleteTemplate(" + full.id + ")' class='fa fa-remove text-large'></i></a>";

          return "<a href='#!/app/pages/edit_email_template/"+full.id+"' title='Edit email template'   ><i class='fa fa-edit text-large'></i></a>";

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
                $http.post(APP.API + 'delete_email_template', $scope.template_id
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
app.controller('add_email_templateCtrl', ["$scope", "restSessionOut", "$http", "APP", "$stateParams", "notifications",'$state',"modalProvider", function ($scope, restSessionOut, $http, APP, $stateParams, notifications,$state,modalProvider) {
    
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    if($scope.placeHolders==undefined){
        $scope.placeHolders={};
    }
    $http.get(APP.API + 'placeholder_list'
            ).then(function (response) {
        try {
            if (response.data.status == "401") {
                restSessionOut.getRstOut();
            }
        } catch (err) {
        }
        
        $scope.placeHolders=response.data.data;
        
    }).catch(function (request, status, errorThrown) {

    });
        
    if($scope.template == undefined){
       $scope.template={}; 
    }
    
    if($scope.type==undefined){
        $scope.type={};
    }
    if($stateParams.id){
       
        $http.get(APP.API + 'get_email_template?id='+$stateParams.id
            ).then(function (response) {
        try {
            if (response.data.status == "401") {
                restSessionOut.getRstOut();
            }
        } catch (err) {
        }
       
        if (response.data.success == false) {
           
            $scope.template=response.data.data[0];
            if(response.data.data[0].id == 8){
                $scope.template.send_time =  parseInt($scope.template.send_time, 10);
            }
        } else {
            notifications.Message('error', 'Error', response.data.message);
        }
        }).catch(function (request, status, errorThrown) {

        });
    }
    //$scope.type[1]={'value':1,'name':'Reminder'};
    $scope.type[1]={'value':1,'name':'Offer'};    
    //$scope.type[3]={'value':3,'name':'Change'};    
    //$scope.type[4]={'value':4,'name':'Cancellation'};    
    //$scope.type[5]={'value':5,'name':'No-Show cancellation'};    
    //$scope.type[6]={'value':6,'name':'Cancellation not on time'};    
    //$scope.type[7]={'value':7,'name':'Invoice Reminder'};      
    //$scope.type[8]={'value':8,'name':'Intake form'};  
    //$scope.type[9]={'value':9,'name':'Invitation for staff'};
    
    $scope.days=[{'value':1,'name':'Before one day'},{'value':2,'name':'Before two days'},{'value':3,'name':'Before three days'},{'value':4,'name':'Before four days'},{'value':5,'name':'Before five days'}]
    
    
    
    
    $scope.addPlaceHolder = function (da) {
      
        CKEDITOR.instances['ck_mail_content'].insertText(da);
    }
    
    $scope.saveTemplate = function (frm_id) {
       
        
        if($scope.template.is_active==undefined){
            $scope.template.is_active=0;
        }
        
        if ($('#'+frm_id).valid()) {
            
            $http.post(APP.API + 'save_email_template', $scope.template
                    ).then(function (response) {
                try {
                    if (response.data.status == "401") {
                        restSessionOut.getRstOut();
                    }
                } catch (err) {
                }
                
                if (response.data.success == false) {
                    $state.go('app.pages.email_template');
                    notifications.Message('success', 'Success', response.data.message);
                } else {
                    
                    notifications.Message('error', 'Error', response.data.message);
                }


            }).catch(function (request, status, errorThrown) {

            });
        }

    }
   

    $scope.previewEmailTemplate = function (frm_id) {
        if($scope.template.is_active==undefined){
            $scope.template.is_active=0;
        }
        if ($('#'+frm_id).valid()) {
            
            $http.post(APP.API + 'save_email_template', $scope.template
                    ).then(function (response) {
                try {
                    if (response.data.status == "401") {
                        restSessionOut.getRstOut();
                    }
                } catch (err) {
                }
                if (response.data.success == false) {
                    $http.get(APP.API + 'get_email_template?id='+$stateParams.id
                    ).then(function (response) {
                if (response.data.success == false) {
                    if ($scope.template == undefined) {
                        $scope.template = {};
                    }
                    //$scope.template = response.data.data[0];
                    //console.log('$scope.template',$scope.template);
                    var email_description = response.data.data[0]['newtempate_description'];
                    modalProvider
                            .openPopupModal(
                                    APP.VIEW_PATH + 'template/email_preview.html',
                                    'previewEmailTemplateCtrl',
                                    'lg',
                                    $scope.data_inside_modal = {
                                        emailTemplatePreview: email_description
                                    },
                                    {
                                        'success': function (state, title, msg) {
                                        }
                                    },
                                    )
                }
            }).catch(function (request, status, errorThrown) {
            });
                } else {
                    notifications.Message('error', 'Error', response.data.message);
                }
            }).catch(function (request, status, errorThrown) {
            });
        }
    }

}]);


app.controller('previewEmailTemplateCtrl', ["$scope", "$uibModalInstance", "items", function ($scope, $uibModalInstance,  items) {


    $scope.cancel = function () {
        $uibModalInstance.close();
        $scope.myHTML = '';
    };

    $scope.myHTML = items.emailTemplatePreview;
}])
app.filter('trusted', function ($sce) {
return function (html) {
    return $sce.trustAsHtml(html)
}
});



