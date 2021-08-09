app.controller('cashdeskSettingCtrl', ["$scope", "$http", "SweetAlert", "modalProvider", "APP", "notifications", "restSessionOut", "DTOptionsBuilder", "DTColumnBuilder",  "$compile", "toaster","$timeout", function ($scope, $http, SweetAlert, modalProvider, APP, notifications, restSessionOut, DTOptionsBuilder, DTColumnBuilder, $compile, toaster,$timeout) {

    //location.reload();
  //  $timeout(reloadCurrentPage, 2000);
    //function reloadCurrentPage() {
       // window.location.reload();
        //$state.go($state.$current, null, { reload: true });
    //  }
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token'))
    {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }
    $scope.options = {
        language: 'en',
        allowedContent: true,
        entities: false,
        wysiwyg: 1, source: 1
    };
    $scope.PaymentMethod = function () {
        
        $http.get(APP.API + 'payment_method/0'
                ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) {
            }
            $scope.payment_methods = response.data.data; 
            angular.forEach($scope.payment_methods,function(single_p){
                single_p.is_check = (single_p.is_check == 1) ? true : false;
            })
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.PaymentMethod();
   
    $scope.addPlaceHolder = function (da) {
        CKEDITOR.instances['invoice_temp'].insertText(da);
        
    }
    $scope.saveInvoiceTemplate = function () {
        var emailtext = CKEDITOR.instances['invoice_temp'].getData();
        $scope.invoiceTemplate.tempate_description = emailtext;
        $scope.invoiceTemplate.template_type = 1;
        $http.post(APP.API + 'preview_invoice_template', $scope.invoiceTemplate
                ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) {
            }
            if (response.data.success == false) {
                toaster.pop('success', 'Success', response.data.message);
            } else {
                toaster.pop('error', 'Faild', response.data.message);
            }
        }).catch(function (request, status, errorThrown) {
        });
    }
    if ($scope.invoiceTemplate == undefined) {
        $scope.invoiceTemplate = {};
    }
    $scope.updateInvoiceTemplate = function () {
        var emailtext = CKEDITOR.instances['invoice_temp'].getData();
        $scope.invoiceTemplate.tempate_description = emailtext;
        $http.post(APP.API + 'preview_invoice_template', $scope.invoiceTemplate
                ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) {
            }
            if (response.data.success == false) {
                toaster.pop('success', 'Success', response.data.message);
            } else {
                toaster.pop('error', 'Faild', response.data.message);
            }
        }).catch(function (request, status, errorThrown) {
        });
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
    // Called when the editor is completely ready.
    $scope.onReady = function () {
        $http.get(APP.API + 'invoice_template_master'
                ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) {
            }
            $scope.saveData = true;
            if (response.data.success == false) {
                $scope.saveData = false;
                $scope.invoiceTemplate = response.data.data[0];
                var invoice_description = response.data.data[0]['tempate_description'];
                
              
                //CKEDITOR.instances.editor1.setMode( 'source' );
                CKEDITOR.instances['invoice_temp'].setData(invoice_description,function()
                {
                    this.checkDirty();  // true
                });
            }
        }).catch(function (request, status, errorThrown) {

        });
    };
    $scope.onReady();
    $scope.paymentCheck = function(single_payment){
        $http.post(APP.API + 'payment_method_check',single_payment
                ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) {
            }
            if(response.data.success == false){
                notifications.Message('error','Unauthorized',response.data.message);
            }else{
                notifications.Message('success','Success',response.data.message)
            }
            $scope.PaymentMethod();
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.showTaxForm = function () {
        $scope.tax = {}
        $scope.tax_form = false;
        $scope.tax_list = true;
    }
    $scope.hideTaxForm = function () {
        $scope.dtInstanceInvoiceRequest.rerender();
        $scope.tax_form = true;
        $scope.tax_list = false;
    }
    $scope.declare_tax = function () {
        $scope.tax = {}
        $scope.tax_form = true;
        $scope.tax_list = false;
    }
    $scope.tabselected = function (index) {
        switch (index) {
            case 0:
                // $scope.tax;
                break;
            case 1:
                $scope.declare_tax()
                break;
            case 2:
                // $scope.tax;
            break;
        }
    };
    $scope.previewInvoiceTemplate = function () {
        var emailtext = CKEDITOR.instances['invoice_temp'].getData();
        $scope.invoiceTemplate.tempate_description = emailtext;
        $scope.invoiceTemplate.template_type = 1;
        $http.post(APP.API + 'preview_invoice_template', $scope.invoiceTemplate
                ).then(function (response) {
            if (response.data.success == false) {
                $http.get(APP.API + 'invoice_template_master'
                        ).then(function (response) {
                    if (response.data.success == false) {
                        if ($scope.invoiceTemplate == undefined) {
                            $scope.invoiceTemplate = {};
                        }
                        $scope.invoiceTemplate = response.data.data[0];
                        var invoice_description = response.data.data[0]['newtempate_description'];
                        modalProvider
                                .openPopupModal(
                                        APP.VIEW_PATH + 'cashdesk/edit-companyModalContent.html',
                                        'editCompanyCtrl',
                                        'lg',
                                        $scope.data_inside_modal = {
                                            invoiceSetting: invoice_description
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
                toaster.pop('error', 'Faild', response.data.message);
            }
        }).catch(function (request, status, errorThrown) {
        });
    }
    //For Data Table Start
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
            url: APP.API + 'dt_tax_list',
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
            } catch (err) {
            }
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
    $scope.dtColumnInvoiceRequest = [
        DTColumnBuilder.newColumn('name').withTitle('Tax name').withOption('sName', 'name'),
        DTColumnBuilder.newColumn('tax_value').withTitle('Tax value').withOption('sName', 'tax_value'),
        DTColumnBuilder.newColumn('id').withTitle("Action").withOption('sName', 'id').renderWith(actionList)
    ];
    $scope.dtColumnInvoiceRequestDefs = [
    ];
    function createdRow(row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    }
    function actionList(data, type, full, meta) {
        var full_string = JSON.stringify(full);
        return "<a ng-click='editTax(" + full_string + ")'><i class='fa fa-edit text-large'></i></a><a class='margin-left-10'><i ng-click='deleteTax(" + full.id + ")' class='fa fa-remove text-large'></i></a>";
    }
    $scope.editTax = function (edit_data) {
        $scope.tax_form = false;
        $scope.tax_list = true;
        $scope.tax = edit_data;
    }
    if($scope.tax==undefined){
        $scope.tax={};
    }
    

$scope.submitTaxForm = function () {

    if($scope.tax.tax_value > 100){
        notifications.Message('error','Tax Value','Tax value should less than 100% !!');
        return false;
    }
        var php_api_link = '';
        if ($('#id_taxForm').valid()) {
            if (typeof ($scope.tax.id) !== 'undefined') {
                php_api_link = 'update_tax';
            } else {
                php_api_link = 'add_tax';
            }
            $http.post(APP.API + php_api_link, $scope.tax
            ).then(function (response) {
        try {
            if (response.data.status == "401") {
                restSessionOut.getRstOut();
            }
        } catch (err) {
        }
        var return_responce = response.data;
        if (return_responce.success != false) {
            $scope.dtInstanceInvoiceRequest.rerender();
            $scope.tax_form = true;
            $scope.tax_list = false;
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

    $scope.deleteTax = function (tax_id) {
        $scope.delete_tax_id = {id: tax_id};
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to delete selected tax value!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {

            if (isConfirm) {
                $http.post(APP.API + 'delete_tax', $scope.delete_tax_id
                        ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) {
                    }
                    if (response.data.success != true) {
                        notifications.Message('warning', 'Warning', response.data.message);
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
    $scope.displayForm = true;
    $scope.prefix = {}
    $scope.savePreifix = function (frmId) {
       if ($('#'+frmId).valid()) {
            $http.post(APP.API + 'save_prefix', $scope.prefix)
            .then(function (response) {
                if(response.data.success){
                    notifications.Message('success', 'Success', response.data.message);
                    $scope.tableDisplay = true;
                    $scope.getPrefix();
                }
            }).catch(function (request, status, errorThrown) {});
       } 
    }
    $scope.getPrefix = function () {
        $http.post(APP.API + 'get_prefix', $scope.prefix)
            .then(function (response) {
                if(response.data.data){
                    $scope.prefix = response.data.data;
                    $scope.displayForm = false;
                    $scope.tableDisplay = true;
                }else{
                    $scope.prefix = {};
                    $scope.displayForm = true;
                    $scope.tableDisplay = false;
                }
            }).catch(function (request, status, errorThrown) {}); 
    }
    $scope.getPrefix();
    $scope.editPrefix = function () {
        $scope.displayForm = true;
    }
    $scope.updatePrefix = function (frmId) {
        if ($('#'+frmId).valid()) {

            var prefix =  ($scope.prefix.prefix_title.split('').reverse()).indexOf( (($scope.prefix.prefix_title.split('').reverse().join('')).match(/[a-zA-Z]/) || []).pop());
            var digit_index = prefix-1;
            if(digit_index != -1){
                if(isNaN(($scope.prefix.prefix_title.split('').reverse()).indexOf(digit_index))){
                    notifications.Message('error', 'Error', 'Last of the string should be in numeric or digit !!');
                $scope.prefix.prefix_title = '';
                return false;
                }else{
                    $http.post(APP.API + 'update_prefix', $scope.prefix)
                    .then(function (response) {
                        if(response.data.success){
                            notifications.Message('success', 'Success', response.data.message);
                            $scope.displayForm = false;
                            $scope.tableDisplay = true;
                            $scope.getPrefix();
                        }
                    }).catch(function (request, status, errorThrown) {});
                }
            }else{
                notifications.Message('error', 'Error', 'Last of the string should be in numeric or digit !!');
                $scope.prefix.prefix_title = '';
                return false;
            }
            
        


        }
    }
    $scope.deletePrefix = function (id) {
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
                $scope.delete={
                    'id':id
                }
                $http.post(APP.API + 'delete_prefix', $scope.delete
                        ).then(function (response) {
                    if (response.data.success){
                        notifications.Message('success', 'Success', response.data.message);
                        $scope.displayForm = true;
                        $scope.prefix = {};
                        $scope.tableDisplay = false;
                    }
                }).catch(function (request, status, errorThrown) {
                });
            } else {
            }
        });
    }
    $scope.passord_text = 'password';
    $scope.textOrPassword = function (){
        $scope.passord_text = ($scope.passord_text == 'password') ? 'text' : 'password';
    }
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
    $scope.saveInvoicePassword = function (frmId) {
        if ($('#invoicePasswordForm').valid()) {
             $http.post(APP.API + 'save_invoice_password', $scope.invoice_password)
             .then(function (response) {
                 if(response.data.success){
                     notifications.Message('success', 'Success', response.data.message);
                     $scope.getInvoicePassword();
                 }
             }).catch(function (request, status, errorThrown) {});
        } 
     }
}]);
