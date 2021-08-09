'use strict';
/**
 * controllers for UI Bootstrap components
 */

 app.controller('couponUsedCtrl', ["$scope", "$http", "APP", "restSessionOut", "DTOptionsBuilder", "DTColumnBuilder","notifications","SweetAlert", "$compile", function ($scope, $http,  APP,  restSessionOut, DTOptionsBuilder, DTColumnBuilder,notifications,SweetAlert, $compile) {

    
    
    $("#ui-datepicker-div").hide();
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token'))
    {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }
    $scope.valid_or_invalid = 'valid';
    $scope.validInvalid = function(){
        $scope.dtInstanceInvoiceRequest.rerender();
     }
    $scope.dtIntanceInvoiceRequestCallback_main = function (instance) {
        $scope.dtInstanceInvoiceRequest = instance;
    }
    $scope.dtInstanceInvoiceRequest = {};
    $scope.flag_request = 0;
    $scope.dtOptionInvoiceRequest_main = DTOptionsBuilder.newOptions().withOption('ajax', function (data, callback, settings) {
        if (data.order[0].column == 0) {
            var sque = 'desc';
            var columnmna = 'id';
        } else {
            var sque = data.order[0].dir;
            var columnmna = data.columns[data.order[0].column].name;
        }
        $http({
            method: "post",
            url: APP.API + 'dt_used_coupons_list',
            data: {
                length: data.length,
                start: data.start,
                draw: data.draw,
                column_name: columnmna,
                order: sque,
                search: data.search.value,
                valid_or_invalid:$scope.valid_or_invalid
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
                $("#usedCouponDatatable_paginate").parent().addClass('pagination_width');
                $("#usedCouponDatatable_paginate").parent().addClass('pagination_width');
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
        .withPaginationType('full_numbers')

    $scope.dtColumnInvoiceRequest_main = [
        DTColumnBuilder.newColumn('created_at').withTitle('Sale Date').withOption('sName', 'created_at').renderWith(saleDateHtml),
        DTColumnBuilder.newColumn('cc_number').withTitle('Number').withOption('sName', 'cc_number').renderWith(cc_numberHtml),
        DTColumnBuilder.newColumn('description').withTitle('Membership').withOption('sName', 'coupon_detail').renderWith(coupon_detailHtml),
        DTColumnBuilder.newColumn('full_name').withTitle('Customer').withOption('sName', 'customer').renderWith(customerHtml),
        DTColumnBuilder.newColumn('from_date').withTitle('Start').withOption('sName', 'from_date').renderWith(start_dateHtml),
        DTColumnBuilder.newColumn('to_date').withTitle('End').withOption('sName', 'to_date').renderWith(end_dateHtml),
        DTColumnBuilder.newColumn('id').withTitle('Action').withOption('sName', 'id').renderWith(delete1)
    ];
    $scope.dtColumnInvoiceRequestDefs_main = [];
    function createdRow(row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    }
    function saleDateHtml(data, type, full, meta){
        
        var d = data.split(' ')[0];
        var sale_date = new Date(d);
        var year = sale_date.getFullYear();
        var month = ((sale_date.getMonth() + 1).toString().length < 2) ? '0' + (sale_date.getMonth() + 1) : (sale_date.getMonth() + 1);
        var day = ((sale_date.getDate()).toString().length < 2) ? '0' + sale_date.getDate() : sale_date.getDate();
        var cdate = day + "-" + month + "-" + year;
        var salehtml = "<a href='#!/app/pages/invoice/"+full.invoice_id+"/0'><i class='fa fa-file-text-o'> <span>"+cdate+"</span></a>";
        return salehtml;
    }
    function cc_numberHtml(data, type, full, meta) {
        return "<span class='badge badge-warning'>"+data+"</span>";
    }
    function delete1(data, type, full, meta) {

        return(

            `<a class = ' btn btn-danger' ng-click = deleteMembership(${data})><i class='fa fa-remove'></i></a>`
        ); 
    }
    $scope.deleteMembership = function (membership_id) {
        $scope.delete_membership_id = { id: membership_id };
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to delete Selected membership!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                $http.post(APP.API + 'delete_membership', $scope.delete_membership_id
                    ).then(function (response) {
                       try{
                        if(response.data.status == "401"){
                         restSessionOut.getRstOut();
                     }
                 }catch(err){}
                 console.log('return_data', response.data);
                 notifications.Message('success', 'Success', response.data.message);
                 $scope.dtInstanceInvoiceRequest.rerender();

             }).catch(function (request, status, errorThrown) {

             });
         } else {

         }
     });
    }
    function coupon_detailHtml(data, type, full, meta) {
         return data;
    }
    function customerHtml(data, type, full, meta) {
        return data;
    }
    function invoiceHtml(data, type, full, meta) {
        return data;
    }
    function start_dateHtml(data, type, full, meta) {
        var sale_date = new Date(data);
        var year = sale_date.getFullYear();
        var month = ((sale_date.getMonth() + 1).toString().length < 2) ? '0' + (sale_date.getMonth() + 1) : (sale_date.getMonth() + 1);
        var day = ((sale_date.getDate()).toString().length < 2) ? '0' + sale_date.getDate() : sale_date.getDate();
        var cdate = day + "-" + month + "-" + year
        return cdate;
    }
    // function start_dateHtml(data, type, full, meta) {
    //     var start_date = new Date(data);
    //     var year = start_date.getFullYear();
    //     var month = ((start_date.getMonth() + 1).toString().length < 2) ? '0' + (start_date.getMonth() + 1) : (start_date.getMonth() + 1);
    //     var day = ((start_date.getDate()).toString().length < 2) ? '0' + start_date.getDate() : start_date.getDate();
    //     var cdate = day + "-" + month + "-" + year
    //     return cdate;
    // }
    function end_dateHtml(data, type, full, meta) {
        var end_date = new Date(data);
        var year = end_date.getFullYear();
        var month = ((end_date.getMonth() + 1).toString().length < 2) ? '0' + (end_date.getMonth() + 1) : (end_date.getMonth() + 1);
        var day = ((end_date.getDate()).toString().length < 2) ? '0' + end_date.getDate() : end_date.getDate();
        var cdate = day + "-" + month + "-" + year
        return cdate;
    }

    function useHtml(data, type, full, meta) {
        if(full.hmt_used == 0){
           return '0%';
        }else if(full.hmt_used > 0){
          var per =  (full.hmt_used/full.no_of_services*100).toFixed();
          return per+'%';
        }
    }
}]);


app.controller('ModalServiceCtrl', ["$scope", "$uibModalInstance", "items","restSessionOut","$http", function ($scope, $uibModalInstance, items,restSessionOut,$http) {

    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token'))
    {
        restSessionOut.getRstOut();
    }
    $scope.items = items;
    $scope.selected = {
        item: $scope.items[0]
    };
    $scope.ok = function () {
        $uibModalInstance.close($scope.selected.item);
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.hide_show_1 = false;
    $scope.hide_show_2 = false;
    $scope.category1 = function (index) {
        if ($scope['hide_show_' + index] != true) {
            $scope['hide_show_' + index] = true;
        } else {
            $scope['hide_show_' + index] = false;
        }
    }
}]);
