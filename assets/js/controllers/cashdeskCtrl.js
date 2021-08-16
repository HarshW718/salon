var membership_price_valid = 0;
app.controller('cashdeskCtrl', ["$rootScope","$scope", "$http", "SweetAlert", "modalProvider", "APP", "notifications", "restSessionOut", "storeAppointmentData", "$state", "displayInvoiceModal", "$timeout", function ($rootScope,$scope, $http, SweetAlert, modalProvider, APP, notifications, restSessionOut, storeAppointmentData, $state, displayInvoiceModal, $timeout) {
    console.log("$rootScope", $rootScope.clickedAppointmentId);
    
    // const SERVICE_FROM_APPOINTMENT = storeAppointmentData.get();
    //TEsting comment
    //Second TEsting Commit
    const UNPAID_INVOICE = storeAppointmentData.get();
    console.log("UNPAID_INVOICE", UNPAID_INVOICE);
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;

    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }
    $("#ui-datepicker-div").hide();
    var modal_html_link = '';
    var modal_controller = '';
    var modal_size = '';
    $scope.ui_select_customer = false;
    $scope.row = {};
    $scope.gift_certificate_no = 1000000;
    $scope.customer = { full_name: '' };
    $scope.invoice = { invoice_date: '', treatment_date: '', table_data: {}, invoice_tax: {},comments:'' };
    $scope.appointment_id = 0;
    $scope.invoice_id = 0;
    $scope.display_cashdesk_data = [];
    $scope.total_no_of_services = 0;
    $scope.list_tax = function () {
        $http.get(APP.API + 'list_tax'
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            $scope.taxes = response.data.data;
            $scope.invoice_data()
        }).catch(function (request, status, errorThrown) {
        });
    }
    
    var free_services = [];
    var service_status = [];
    $scope.list_coupon = function () {
        $http.get(APP.API + 'coupons_list'
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            
            // $scope.coupons = response.data.data;
            // for(var i = 0; i<=5; i++)
            // {
            //     free_services[i] = response.data.data[0].services[i].id;
            // }
            
            console.log(response.data.data[0].services[0].status);

            $scope.coupons = response.data.data.filter(function(single_coupon){
                
                return single_coupon.where_from == 0;
             })
           
           
            
            $scope.list_tax();
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.list_service = function () {
        
        $http.get(APP.API + 'list_service'
        
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            angular.forEach(response.data.data, function (single_service) {
                if(UNPAID_INVOICE.customer != null ){
                  if(UNPAID_INVOICE.customer.coupon != undefined){
                        if(UNPAID_INVOICE.customer.coupon.length > 0){
                            $scope.current_customer_coupon = UNPAID_INVOICE.customer.coupon.filter(function (c_cc) {
                                if (c_cc.service_id == single_service.id) {
                                    return true;
                                }
                            })
                            if ( $scope.current_customer_coupon.length > 0) {
                                single_service.coupon = $scope.current_customer_coupon[0];
                            } else {
                                single_service.coupon = {};
                            }
                        }
                  }else{
                    single_service.coupon = {};
                  }
                }else{
                    single_service.coupon = {};
                }
                
                if(single_service.coupon != undefined){
                    if(single_service.coupon.cc_number != undefined){
                        single_service.label = single_service.name + "  ( ₹" + single_service.sales_price + ") ";
                    }else{
                        single_service.label = single_service.name + "  ( ₹" + single_service.sales_price + ")";
                    }
                }else{
                    single_service.label = single_service.name + "  ( ₹" + single_service.sales_price + ")";
                }
            })
            
            $scope.services = response.data.data;
            $scope.list_coupon();
        }).catch(function (request, status, errorThrown) {
        });
    }

    $scope.list_service_male = function () {
        
        $http.get(APP.API + 'list_service_male'
        
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            angular.forEach(response.data.data, function (single_service) {
                if(UNPAID_INVOICE.customer != null ){
                  if(UNPAID_INVOICE.customer.coupon != undefined){
                        if(UNPAID_INVOICE.customer.coupon.length > 0){
                            $scope.current_customer_coupon = UNPAID_INVOICE.customer.coupon.filter(function (c_cc) {
                                if (c_cc.service_id == single_service.id) {
                                    return true;
                                }
                            })
                            if ( $scope.current_customer_coupon.length > 0) {
                                single_service.coupon = $scope.current_customer_coupon[0];
                            } else {
                                single_service.coupon = {};
                            }
                        }
                  }else{
                    single_service.coupon = {};
                  }
                }else{
                    single_service.coupon = {};
                }
                
                        console.log(response.data.data);
                if(single_service.coupon != undefined){
                    
                    if(single_service.coupon.cc_number != undefined){
                        
                        if(membership_price_valid == 0)
                        {
                            single_service.label = single_service.name + "  ( ₹" + single_service.sales_price + ") - "+single_service.service_category.name;
                        }else if(membership_price_valid == 1)
                        {
                            single_service.label = single_service.name + "  ( ₹" + single_service.membership_price + ") - "+single_service.service_category.name ;
                        }
                    }else{
                        if(membership_price_valid == 0)
                        {
                            single_service.label = single_service.name + "  ( ₹" + single_service.sales_price + ") - "+single_service.service_category.name ;
                        }else if(membership_price_valid == 1)
                        {
                            single_service.label = single_service.name + "  ( ₹" + single_service.membership_price + ") - "+single_service.service_category.name ;
                        }                    
                    }
                }else{
                    
                        console.log(response.data.data);
                    if(membership_price_valid == 0)
                        {
                            single_service.label = single_service.name + "  ( ₹" + single_service.sales_price + ") " ;
                        }else if(membership_price_valid == 1)
                        {
                            single_service.label = single_service.name + "  ( ₹" + single_service.membership_price + ") " ;
                        }  
                }
            })
            
            $scope.services_male = response.data.data;
            console.log($scope.services_male);
            $scope.list_coupon();
        }).catch(function (request, status, errorThrown) {
        });
    }

    $scope.list_service_male_membership_price = function () {
        
        $http.get(APP.API + 'list_service_male'
        
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            angular.forEach(response.data.data, function (single_service) {
                if(UNPAID_INVOICE.customer != null ){
                  if(UNPAID_INVOICE.customer.coupon != undefined){
                        if(UNPAID_INVOICE.customer.coupon.length > 0){
                            $scope.current_customer_coupon = UNPAID_INVOICE.customer.coupon.filter(function (c_cc) {
                                if (c_cc.service_id == single_service.id) {
                                    return true;
                                }
                            })
                            if ( $scope.current_customer_coupon.length > 0) {
                                single_service.coupon = $scope.current_customer_coupon[0];
                            } else {
                                single_service.coupon = {};
                            }
                        }
                  }else{
                    single_service.coupon = {};
                  }
                }else{
                    single_service.coupon = {};
                }
                if(single_service.coupon != undefined){
                    if(single_service.coupon.cc_number != undefined){
                        
                            single_service.label = single_service.name + "  ( ₹" + single_service.membership_price + ")- " +single_service.service_category.name;
                    }else{
                            single_service.label = single_service.name + "  ( ₹" + single_service.membership_price + ")- "+single_service.service_category.name;
                    }
                }else{
                    single_service.label = single_service.name + "  ( ₹" + single_service.membership_price + ")- "+single_service.service_category.name;
                }
            })
            
            $scope.services_male_membership = response.data.data;
            $scope.list_coupon();
        }).catch(function (request, status, errorThrown) {
        });
    }


    $scope.list_service_female = function () {
        
        $http.get(APP.API + 'list_service_female'
        
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            angular.forEach(response.data.data, function (single_service) {
                if(UNPAID_INVOICE.customer != null ){
                  if(UNPAID_INVOICE.customer.coupon != undefined){
                        if(UNPAID_INVOICE.customer.coupon.length > 0){
                            $scope.current_customer_coupon = UNPAID_INVOICE.customer.coupon.filter(function (c_cc) {
                                if (c_cc.service_id == single_service.id) {
                                    return true;
                                }
                            })
                            if ( $scope.current_customer_coupon.length > 0) {
                                single_service.coupon = $scope.current_customer_coupon[0];
                            } else {
                                single_service.coupon = {};
                            }
                        }
                  }else{
                    single_service.coupon = {};
                  }
                }else{
                    single_service.coupon = {};
                }
                if(single_service.coupon != undefined){
                    if(single_service.coupon.cc_number != undefined){
                            single_service.label = single_service.name + "  ( ₹" + single_service.sales_price + ") - "+single_service.service_category.name;
                    }else{
                            single_service.label = single_service.name + "  ( ₹" + single_service.sales_price + ")- "+single_service.service_category.name;
                    }
                }else{
                    single_service.label = single_service.name + "  ( ₹" + single_service.sales_price + ")- "+single_service.service_category.name;
                }
            })
            
            $scope.services_female = response.data.data;
            $scope.list_coupon();
        }).catch(function (request, status, errorThrown) {
        });
    }

    $scope.list_service_female_membership_price = function () {
        
        $http.get(APP.API + 'list_service_female'
        
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            angular.forEach(response.data.data, function (single_service) {
                if(UNPAID_INVOICE.customer != null ){
                  if(UNPAID_INVOICE.customer.coupon != undefined){
                        if(UNPAID_INVOICE.customer.coupon.length > 0){
                            $scope.current_customer_coupon = UNPAID_INVOICE.customer.coupon.filter(function (c_cc) {
                                if (c_cc.service_id == single_service.id) {
                                    return true;
                                }
                            })
                            if ( $scope.current_customer_coupon.length > 0) {
                                single_service.coupon = $scope.current_customer_coupon[0];
                            } else {
                                single_service.coupon = {};
                            }
                        }
                  }else{
                    single_service.coupon = {};
                  }
                }else{
                    single_service.coupon = {};
                }
                if(single_service.coupon != undefined){
                    if(single_service.coupon.cc_number != undefined){
                            single_service.label = single_service.name + "  ( ₹" + single_service.membership_price + ") - "+single_service.service_category.name;
                    }else{
                            single_service.label = single_service.name + "  ( ₹" + single_service.membership_price + ") - "+single_service.service_category.name;
                    }
                }else{
                    single_service.label = single_service.name + "  ( ₹" + single_service.membership_price + ") - "+single_service.service_category.name;
                }
            })
            
            $scope.services_female_membership= response.data.data;
            $scope.list_coupon();
        }).catch(function (request, status, errorThrown) {
        });
    }
   


    $scope.list_service_category = function () {
        var service_categories = []
        $http.get(APP.API + 'list_service_category_forselect'
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            angular.forEach(response.data.data, function (service_cat) {
                service_categories.push(service_cat)
            });
            $scope.service_categories = service_categories
            $scope.list_service();
            $scope.list_service_male();
            $scope.list_service_male_membership_price();
            $scope.list_service_female();
            $scope.list_service_female_membership_price();
            
            
            
           
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.list_product = function () {
        $http.get(APP.API + 'list_product'
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            angular.forEach(response.data.data, function (single_product) {
                single_product.label = single_product.name + " (₹" + single_product.sale_price + ") " + " (stock::" + single_product.stocke + ")";
            })
            $scope.products = response.data.data;
            $scope.list_service_category();
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.list_product_categories = function () {
        var product_categories = []
        $http.get(APP.API + 'list_product_category'
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            angular.forEach(response.data.data, function (product_cat) {
                product_categories.push(product_cat)
            });
            $scope.product_categories = product_categories;
            $scope.list_product();
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.fetch_invoice_number = function () {
        $http.get(APP.API + 'invoice_number'
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }

            if (UNPAID_INVOICE.id == undefined) {
                if(response.data.last_row != null){


                  var remove_last_char_from_prefix =  response.data.prifix[0].prefix_title.substring(0, response.data.prifix[0].prefix_title.length - 1);

                  if(remove_last_char_from_prefix == response.data.last_row.invoice_prefix){
                    $scope.invoice_number = (response.data.last_row.invoice_no != undefined) ? (response.data.last_row.invoice_no + 1) : response.data.prifix[0].prefix_title.charAt(response.data.prifix[0].prefix_title.length - 1) ;
                  }else{
                    $scope.invoice_number = response.data.prifix[0].prefix_title.charAt(response.data.prifix[0].prefix_title.length - 1) ;

                  }
                    
                }else{
                    $scope.invoice_number = response.data.prifix[0].prefix_title.charAt(response.data.prifix[0].prefix_title.length - 1);
                }
                $scope.invoice_no = $scope.invoice_number;
                $scope.invoice_prefix = response.data.prifix[0].prefix_title.substring(0, response.data.prifix[0].prefix_title.length - 1);
                $scope.display_invoice_number = $scope.invoice_prefix + $scope.invoice_number;
            } else {
                $scope.display_invoice_number = UNPAID_INVOICE.invoice_prefix + UNPAID_INVOICE.invoice_no;
                $scope.invoice_prefix = UNPAID_INVOICE.invoice_prefix;
                $scope.invoice_id = UNPAID_INVOICE.id;
                $scope.invoice_number = UNPAID_INVOICE.invoice_no;
                $scope.invoice_no = $scope.invoice_number;
                $scope.invoice.comments = UNPAID_INVOICE.comment;
                
            }
            $scope.list_product_categories();

        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.paidAmount = function (invoiceId) {
        if (invoiceId != 0) {
            var paid_amount_now = 0;
            $http.get(APP.API + 'get_payment_by_invoice_id/' + invoiceId
            ).then(function (response) {
                try {
                    if (response.data.status == "401") {
                        restSessionOut.getRstOut();
                    }
                } catch (err) { }
                angular.forEach(response.data.data, function (single_paid_amount) {
                    paid_amount_now += single_paid_amount.amount;
                })
                $scope.paid_amount_till_now = paid_amount_now;
            }).catch(function (request, status, errorThrown) {
            });
        } else {
            $scope.paid_amount_till_now = 0;
        }
    }

    $scope.staff_list = function () {
        $http.get(APP.API + 'get_staff_list'
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            $scope.staff_data = response.data.activeData;
            $scope.first_staff_id = response.data.activeData[0].id;
            $scope.fetch_invoice_number();
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.worker_list = function () {
        $http.get(APP.API + 'worker_list_for_calendar/' + 0
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            $scope.workers = response.data.data;
            $scope.first_worker_id = response.data.data[0].id;
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.staff_list();
    $scope.worker_list();
    $scope.goBackToMain = function () {
        storeAppointmentData.set({});
        $state.go('app.pages.cashdesk_main', {});
    }
    $scope.invoice_data = function () {
        const INVOICE_DATA = UNPAID_INVOICE.invoice_data;
        $scope.customer.full_name = (UNPAID_INVOICE.customer != null) ? (UNPAID_INVOICE.customer.firstname + " " + UNPAID_INVOICE.customer.lastname) : '';
        $scope.invoice.to_pay_id = (UNPAID_INVOICE.to_pay_id == undefined || UNPAID_INVOICE.to_pay_id == 0) ? $scope.first_staff_id : UNPAID_INVOICE.to_pay_id;
        $scope.invoice.customer = UNPAID_INVOICE.customer;
        $scope.couponIds_hmt_adjust = [];
        angular.forEach(INVOICE_DATA, function (single_display_data, key) {
            if (single_display_data.coupon_id != 0 && single_display_data.coupon_id != undefined) {
                var request_data = { service_id: single_display_data.data_id, coupon_id: single_display_data.coupon_id, customer_id: UNPAID_INVOICE.customer.id }
                $http.post(APP.API + 'coupon_by_id', request_data
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    var current_coupon = response.data.data
                    if($scope.invoice_id != 0){
                         current_coupon.hmt_used = (current_coupon.hmt_used - single_display_data.quantity);
                        $scope.services.find(function(single_service){
                            if(single_service.id == single_display_data.data_id){
                                single_display_data.calculation_sale_price = single_service.sales_price;
                            }
                        });
                        if($scope.couponIds_hmt_adjust.length > 0){
                            var c_index = $scope.couponIds_hmt_adjust.findIndex(function(c_id){
                                return c_id.coupon_id == current_coupon.id; });
                                if(c_index == -1){
                                    $scope.couponIds_hmt_adjust.push({coupon_id:current_coupon.id,hmt_used:single_display_data.quantity});
                                }else{
                                    $scope.couponIds_hmt_adjust[c_index].hmt_used = $scope.couponIds_hmt_adjust[c_index].hmt_used + single_display_data.quantity;
                                }
                        }else{
                            $scope.couponIds_hmt_adjust.push({coupon_id:current_coupon.id,hmt_used:single_display_data.quantity});
                        }
                    }
                    var total_no_of_serv = 0;
                    angular.forEach(current_coupon.coupon_detail.services,function(service_no){
                        total_no_of_serv += service_no.no_of_services;
                    })
                    $scope.total_no_of_services = total_no_of_serv;
                    $scope.display_cashdesk_data.push({
                        which_one: single_display_data.which_one,
                        id: single_display_data.data_id,
                        is_check: (single_display_data.is_check == 1) ? true : false,
                        is_disabled: (single_display_data.is_disabled == 1) ? true : false,
                        worker_id: single_display_data.worker_id,
                        appointment_id: single_display_data.appointment_id,
                        name: single_display_data.description,
                        display_sale_price: single_display_data.calculation_sale_price,
                        calculation_sale_price: parseFloat((current_coupon.coupon_detail.sale_price/$scope.total_no_of_services).toFixed(2)),
                        tax_id: single_display_data.tax_id,
                        quantity: single_display_data.quantity,
                        discount_amount: single_display_data.discount_amount,
                        discount_percentage: single_display_data.discount_percentage,
                        data_before_discount: {},
                        discount_apply: 3,
                        single_row_total: parseFloat((current_coupon.coupon_detail.sale_price/$scope.total_no_of_services).toFixed(2)),
                        single_row_comment: single_display_data.single_row_comment,
                        coupon: current_coupon,
                        coupon_start_date: single_display_data.coupon_start_date,
                        coupon_end_date: single_display_data.coupon_end_date,
                        service_treatment_date: new Date(),
                    });
                }).catch(function (request, status, errorThrown) {
                });
            } else {
                $scope.display_cashdesk_data.push({
                    which_one: single_display_data.which_one,
                    id: single_display_data.data_id,
                    is_check: (single_display_data.is_check == 1) ? true : false,
                    is_disabled: (single_display_data.is_disabled == 1) ? true : false,
                    worker_id: single_display_data.worker_id,
                    appointment_id: single_display_data.appointment_id,
                    name: single_display_data.description,
                    display_sale_price: single_display_data.calculation_sale_price,
                    calculation_sale_price: single_display_data.calculation_sale_price,
                    tax_id: single_display_data.tax_id,
                    quantity: single_display_data.quantity,
                    discount_amount: single_display_data.discount_amount,
                    discount_percentage: single_display_data.discount_percentage,
                    data_before_discount: {},
                    discount_apply: single_display_data.discount_apply,
                    single_row_total: single_display_data.single_row_total,
                    single_row_comment: single_display_data.single_row_comment,
                    coupon: {},
                    coupon_start_date: single_display_data.coupon_start_date,
                    coupon_end_date: single_display_data.coupon_end_date,
                    service_treatment_date: new Date(),
                });
            }
        })
        $timeout(function () {
            $scope.forDisplayData($scope.display_cashdesk_data);
        }, 500);
    }
    $scope.openServicesProductsGiftsCoupons = function (which_one) {
        switch (which_one) {
            case 'services':
                modal_html_link = 'cashdesk/showServicesInCashDeskModalContent.html';
                modal_controller = 'showServicesInCashDeskCtrl';
                modal_size = 'lg';
                $scope.data_inside_modal = {
                    which_one: 'services',
                    services: $scope.services,
                    service_categories: $scope.service_categories,
                    first_worker_id: $scope.first_worker_id

                }
                break;
            case 'products':
                modal_html_link = 'cashdesk/showProductsInCashDeskModalContent.html';
                modal_controller = 'showServicesInCashDeskCtrl';
                modal_size = 'lg';
                $scope.data_inside_modal = {
                    which_one: 'products',
                    products: $scope.products,
                    product_categories: $scope.product_categories,
                    first_worker_id: $scope.first_worker_id
                }
                break;
            case 'gifts':
                modal_html_link = 'cashdesk/showGiftsInCashDeskModalContent.html';
                modal_controller = 'showServicesInCashDeskCtrl';
                modal_size = '';
                $scope.data_inside_modal = {
                    which_one: 'gifts',
                    gift_certificate_no: $scope.gift_certificate_no,
                    first_worker_id: $scope.first_worker_id
                }
                break;
            case 'coupons':
                modal_html_link = 'cashdesk/showCouponsInCashDeskModalContent.html';
                modal_controller = 'showServicesInCashDeskCtrl';
                modal_size = 'lg';
                $scope.data_inside_modal = {
                    which_one: 'coupons',
                    coupons: $scope.coupons,
                    first_worker_id: $scope.first_worker_id
                }
                break;
        }
        modalProvider
            .openPopupModal(
                APP.VIEW_PATH + modal_html_link,
                modal_controller,
                modal_size,
                $scope.data_inside_modal,
                {
                    'success': function (state, title, msg) {

                        $scope.display_cashdesk_data.push(msg)
                        $scope.forDisplayData($scope.display_cashdesk_data.flat());

                    }
                },
            )
    }

    $scope.createCoupon = function (which_one) {

        modal_html_link = 'cashdesk/createCouponModalContent.html';
        modal_controller = 'createCouponCtrl';
        modal_size = 'lg';
        $scope.data_inside_modal = {
            which_one: 'coupons',
            coupons: $scope.coupons,
            first_worker_id: $scope.first_worker_id
        }

        modalProvider
        .openPopupModal(
            APP.VIEW_PATH + modal_html_link,
            modal_controller,
            modal_size,
            $scope.data_inside_modal,
            {
                'success': function (state, title, msg) {

                    $scope.display_cashdesk_data.push(msg)
                    $scope.forDisplayData($scope.display_cashdesk_data.flat());

                }
            },
        )


    }












    $scope.group_by_taxs = [];
    var taxids_display_below_table = [];
    const groupBy = key => array =>
        array.reduce((objectsByKeyValue, obj) => {
            const value = obj[key];
            objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
            return objectsByKeyValue;
        }, {});
    const groupByTax = groupBy('tax_id');
    $scope.forDisplayData = function (display_data) {
        angular.forEach(display_data, function (single_display_data, key) {
            if (single_display_data.which_one != 'gift') {
                if (single_display_data.which_one != 'coupon') {
                    var check_index = taxids_display_below_table.findIndex(function (check_tax_id) {
                        if (check_tax_id.id != undefined) {
                            return check_tax_id.id == single_display_data.tax_id
                        }
                    });
                    if (check_index == -1) {
                        $scope.taxes.find(function (tax) {
                            if (tax.id == single_display_data.tax_id) {
                                taxids_display_below_table.push(tax);
                            }
                        })
                    }
                }
            } else {
                $scope.gift_certificate_no = ($scope.gift_certificate_no + 1);
            }
        });
        $scope.table_data = display_data;
        const group_by_taxs = groupByTax($scope.table_data);
        var total_price = 0
        angular.forEach(group_by_taxs, function (group_by_tax, key) {
            if (key != 0) {
                var _TAX = $scope.taxes.find(function (tax) { return tax.id == key });
                var product_or_service_tax_price = 0;
                for (var i = 0; i < group_by_tax.length; i++) {
                    if (group_by_tax[i].is_check) {
                        var product_or_service_price_with_tax = group_by_tax[i].calculation_sale_price;
                        var product_or_service_price_actual_price = group_by_tax[i].quantity * ((product_or_service_price_with_tax / (1 + (_TAX.tax_value / 100))));
                        product_or_service_tax_price += (product_or_service_price_with_tax - product_or_service_price_actual_price)
                        // total_price += group_by_tax[i].calculation_sale_price
                        total_price += parseFloat(group_by_tax[i].calculation_sale_price);
                    }
                }
                $scope.group_by_taxs.push({ taxid: key, total_amount_of_this_tax: product_or_service_tax_price.toFixed(2), tax_value: _TAX.tax_value })
            } else {
                for (var i = 0; i < group_by_tax.length; i++) {
                    if (group_by_tax[i].is_check) {
                        total_price += parseFloat(group_by_tax[i].calculation_sale_price);
                    }
                }
            }
        })
        $scope.total_price = (total_price).toFixed(2);
        $scope.changeInTableData();
    }
    $scope.changeInTableData = function () {
        $scope.total_coupon_amount = 0;
        var total_invoice_amount = 0;
        var paid_amount = 0;
        $scope.group_by_taxs = [];
        $scope.total_price = 0;
        const group_by_taxs = groupByTax($scope.table_data);
        var total_price = 0
        angular.forEach(group_by_taxs, function (group_by_tax, key) {
            if (key != 0) {
                ;
                var _TAX = $scope.taxes.find(function (tax) { return tax.id == key });
                var product_or_service_tax_price = 0;
                for (var i = 0; i < group_by_tax.length; i++) {
                    if (group_by_tax[i].is_check) {
                        

                        if(group_by_tax[i].which_one == 'product'){
                            console.log(group_by_tax[i].quantity);
                            if(group_by_tax[i].quantity > group_by_tax[i].stock ){
                             group_by_tax[i].quantity = group_by_tax[i].stock;
                             group_by_tax[i].single_row_total = (group_by_tax[i].calculation_sale_price*group_by_tax[i].quantity - group_by_tax[i].discount_amount);
                             notifications.Message('warning', 'Quantity is heigher than stock', 'Availabe stock is '+group_by_tax[i].stock+' !!');
                            }else{
                                group_by_tax[i].single_row_total = (group_by_tax[i].calculation_sale_price*group_by_tax[i].quantity - group_by_tax[i].discount_amount);
                            }
                        }else{
                            group_by_tax[i].single_row_total = (group_by_tax[i].calculation_sale_price*group_by_tax[i].quantity - group_by_tax[i].discount_amount);
                        }
       
                    }
                }
                $scope.group_by_taxs.push({ taxid: key, total_amount_of_this_tax: product_or_service_tax_price.toFixed(2), tax_value: _TAX.tax_value });
            } else {
                for (var i = 0; i < group_by_tax.length; i++) {
                    if (group_by_tax[i].is_check) {
                        
                        if(group_by_tax[i].which_one == 'product'){
                            console.log(group_by_tax[i].quantity);
                            if(group_by_tax[i].quantity > group_by_tax[i].stock ){
                             group_by_tax[i].quantity = group_by_tax[i].stock;
                             group_by_tax[i].single_row_total = (group_by_tax[i].calculation_sale_price*group_by_tax[i].quantity - group_by_tax[i].discount_amount);
                             notifications.Message('warning', 'Quantity is heigher than stock', 'Availabe stock is '+group_by_tax[i].stock+' !!');
                            }else{
                                group_by_tax[i].single_row_total = (group_by_tax[i].calculation_sale_price*group_by_tax[i].quantity - group_by_tax[i].discount_amount);
                            }
                        }else{
                            group_by_tax[i].single_row_total = (group_by_tax[i].calculation_sale_price*group_by_tax[i].quantity - group_by_tax[i].discount_amount);
                        }
                        total_price += group_by_tax[i].single_row_total;
                    }
                }
            }
        })
        $scope.total_price = parseFloat(total_price.toFixed(2));
        angular.forEach($scope.table_data, function (single_data, key) {
            total_invoice_amount += single_data.single_row_total;
        })
        $scope.total_invoice_amount = total_invoice_amount;
        if($scope.invoice_id != 0){
            angular.forEach($scope.table_data, function (single_data, key) {
                if (single_data.discount_apply == 3) {
                    var coupon_hmt_for_adjust = $scope.couponIds_hmt_adjust.find(function(cpn_hmt){
                        return single_data.coupon.id == cpn_hmt.coupon_id;
                    })
                    if(single_data.coupon != undefined && coupon_hmt_for_adjust != undefined){
                        single_data.coupon.hmt_used = single_data.coupon.no_of_services - coupon_hmt_for_adjust.hmt_used; 
                    }
                }
            })
        }
        angular.forEach($scope.table_data, function (single_data, key) {
            if (single_data.discount_apply == 3) {
                var current_validity = single_data.coupon.no_of_services - single_data.coupon.hmt_used;
                if (current_validity < single_data.quantity) {
                    if (current_validity == 0) {
                        $scope.total_coupon_amount = 0;
                    } else {
                        $scope.total_coupon_amount += (current_validity * single_data.calculation_sale_price);
                        single_data.discount_amount = (current_validity * single_data.calculation_sale_price);
                    }
                } else if (current_validity > single_data.quantity) {
                    $scope.total_coupon_amount += (single_data.quantity * single_data.calculation_sale_price);
                    single_data.discount_amount = (single_data.quantity * single_data.calculation_sale_price);
                } else if (current_validity == single_data.quantity) {
                    $scope.total_coupon_amount += (single_data.quantity * single_data.calculation_sale_price);
                    single_data.discount_amount = (single_data.quantity * single_data.calculation_sale_price);
                }
            }

            //getting prestatie_code code from service list when page load from to adjust click.
            single_data.prestatie_code = '';
            if(single_data.which_one == "service"){
                var serviceKey = Object.keys($scope.services).find(key => $scope.services[key].id === single_data.id)
                if(serviceKey !== undefined){
                    single_data.prestatie_code = $scope.services[serviceKey].prestatie_code;
                }
            }
        })
        $scope.paid_amount = paid_amount;
        $scope.remaining_amount = ($scope.total_price - $scope.paid_amount - $scope.total_coupon_amount).toFixed(2);
        $scope.checkValidityOfCoupon();
    }
    $scope.checkDiscount = function (index, single_data) {
        if (!$scope.table_data[index].is_check) {
            $scope.table_data[index].discount_apply = 0;
            $scope.table_data[index].data_before_discount = {};
            $scope.table_data[index].calculation_sale_price = $scope.table_data[index].calculation_sale_price;
            $scope.table_data[index].single_row_total = $scope.table_data[index].calculation_sale_price;
            $scope.table_data[index].discount_amount = 0;
            $scope.table_data[index].discount_percentage = 0;
            $scope.changeInTableData();
        }
    }
    $scope.clickOnDiscount = function (index, single_data) {
        if (!$scope.table_data[index].is_check) {
            notifications.Message('warning', 'Not allowed', 'First checked item before apply discount !!');
            return false;
        }
        if (single_data.discount_apply == 0) {
            $scope.table_data[index].data_before_discount = { calculation_sale_price: single_data.calculation_sale_price, discount_amount: single_data.discount_amount, discount_apply: single_data.discount_apply, discount_percentage: single_data.discount_percentage, display_sale_price: single_data.display_sale_price, id: single_data.id, name: single_data.name, quantity: single_data.quantity, single_row_comment: single_data.single_row_comment, single_row_total: single_data.single_row_total, tax_id: single_data.tax_id, which_one: single_data.which_one, is_check: single_data.is_check };
            modal_html_link = 'cashdesk/showDiscountModalContent.html';
            modal_controller = 'showServicesInCashDeskCtrl';
            modal_size = '';
            $scope.data_inside_modal = {
                which_one: 'discount',
                selected_row: single_data
            }
            modalProvider
                .openPopupModal(
                    APP.VIEW_PATH + modal_html_link,
                    modal_controller,
                    modal_size,
                    $scope.data_inside_modal,
                    {
                        'success': function (state, title, msg) {
                            const DISCOUNT_DATA = msg;
                            if (DISCOUNT_DATA.type == 'amount') {

                                $scope.table_data[index].discount_apply = 1; // 1 = amount
                                $scope.table_data[index].discount_amount = DISCOUNT_DATA.value_amount;
                                $scope.table_data[index].discount_percentage = 0;
                                $scope.changeInTableData();

                            } else if (DISCOUNT_DATA.type == 'percentage') {

                                $scope.table_data[index].discount_apply = 2; // 2 = percentage
                                $scope.table_data[index].discount_percentage = DISCOUNT_DATA.value_percentage;
                                $scope.table_data[index].discount_amount = 0;
                                $scope.changeInTableData();
                            } else if (DISCOUNT_DATA.type == 'coupon_card') {

                                $scope.service_quantity_after_modal = [];
                                angular.forEach($scope.table_data, function (single_row) {
                                    if(single_row.coupon != undefined){
                                        if(single_row.coupon.id != undefined &&   single_row.discount_apply == 3){
                                            
                                            $scope.service_quantity_after_modal.push({service_id:single_row.id,quantity:single_row.quantity})
                                        }
                                    }
                                })
                                $scope.service_quantity_sum_after_modal = [];
                                $scope.service_quantity_after_modal.reduce(function(res, value) {
                                if (!res[value.service_id]) {
                                    res[value.service_id] = { serviceId: value.service_id, quantity: 0 };
                                    $scope.service_quantity_sum_after_modal.push(res[value.service_id])
                                }
                                res[value.service_id].quantity += value.quantity;
                                return res;
                                }, {});
                                var no_of_services_used = $scope.service_quantity_sum_after_modal.find(function(single_row_info){
                                    return single_row_info.serviceId == $scope.table_data[index].id
                                });
                                if(no_of_services_used == undefined){
                                    var no_of_service_used_till_now = 0;
                                }else{
                                    var no_of_service_used_till_now = no_of_services_used.quantity;
                                }
                                var remaining_service_till_now = $scope.table_data[index].coupon.no_of_services - $scope.table_data[index].coupon.hmt_used;
                                if($scope.table_data[index].quantity > (remaining_service_till_now  - no_of_service_used_till_now )){
                                    notifications.Message('warning','Warning','Quantity is greater than remaining coupon services');
                                    $scope.changeInTableData();
                                }else{
                                var total_no_of_serv = 0;
                                angular.forEach(DISCOUNT_DATA.coupon.coupon_detail.services,function(service_no){
                                    total_no_of_serv += service_no.no_of_services;
                                });
                                 $scope.total_no_of_services = total_no_of_serv;
                                 $scope.table_data[index].discount_apply = 3;
                                 $scope.table_data[index].calculation_sale_price = parseFloat((DISCOUNT_DATA.coupon.coupon_detail.sale_price/$scope.total_no_of_services).toFixed(2));
                                 //parseFloat((service.coupon.coupon_detail.sale_price/$scope.total_no_of_services).toFixed(2))
                                 $scope.changeInTableData();
                                }
                            }
                        }
                    },
                )
        } else {
            if($scope.table_data[index].discount_apply != 3){
                $scope.table_data[index].discount_apply = 0; //0 = no discount apply
                $scope.table_data[index].data_before_discount = {};
                $scope.table_data[index].calculation_sale_price = $scope.table_data[index].calculation_sale_price;
                $scope.table_data[index].discount_amount = 0;
                $scope.table_data[index].discount_percentage = 0;
            }else{
                angular.forEach($scope.services, function (single_service) {
                   
                    if(single_service.coupon.id == undefined && single_service.id == $scope.table_data[index].id){
                        single_service.coupon = $scope.table_data[index].coupon;
                   }
                     if(single_service.coupon != undefined){
                        if(single_service.coupon.cc_number != undefined){
                            single_service.label = single_service.name + "  ( ₹" + single_service.sales_price + ") " + single_service.coupon.cc_number;
                        }else{
                            single_service.label = single_service.name + "  ( ₹" + single_service.sales_price + ")";
                        }
                        }else{
                         single_service.label = single_service.name + "  ( ₹" + single_service.sales_price + ")";
                     }
                 })
                $scope.table_data[index].discount_apply = 0; //0 = no discount apply
                $scope.table_data[index].data_before_discount = {};
                $scope.table_data[index].calculation_sale_price = $scope.table_data[index].display_sale_price;
                $scope.table_data[index].discount_amount = 0;
            }
            $scope.changeInTableData();
        }
    }
    $scope.removedExistingServiceAppointmentIds = []
    $scope.removeTableData = function (index, single_data) {
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to remove from list ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                if($scope.table_data[index].appointment_id && $scope.table_data[index].which_one == "service"){
                    $scope.removedExistingServiceAppointmentIds.push($scope.table_data[index].appointment_id)
                }

                //remove code added by vijay gohil 17-08-2020 START
                // if($scope.table_data[index].which_one == "service"){
                //     var delete_appointment = { id: $scope.table_data[index].appointment_id }
                //     $http.post(APP.API + 'delete_appointment', delete_appointment
                //     ).then(function (response) {
                //         try {
                //             if (response.data.status == "401") {
                //                 restSessionOut.getRstOut();
                //             }
                //         } catch (err) { }
                //         $uibModalInstance.close();
                //         cb.success('success', 'Success', response.data.message);
                //     }).catch(function (request, status, errorThrown) {

                //     });
                // }
                //remove code added by vijay gohil 17-08-2020 END

                if($scope.table_data[index].discount_apply == 3){
                angular.forEach($scope.services, function (single_service) {
                    if(single_service.coupon.id == undefined && single_service.id == $scope.table_data[index].id){
                     single_service.coupon = $scope.table_data[index].coupon;
                    }
                      if(single_service.coupon != undefined){
                        if(single_service.coupon.cc_number != undefined){
                            single_service.label = single_service.name + "  ( ₹" + single_service.sales_price + ") " + single_service.coupon.cc_number;
                        }else{
                            single_service.label = single_service.name + "  ( ₹" + single_service.sales_price + ")";
                        }
                        }else{
                          single_service.label = single_service.name + "  ( ₹" + single_service.sales_price + ")";
                      }
                  })
                  angular.forEach($scope.table_data, function (single_row) {
                    if(single_row.id == $scope.table_data[index].id){
                        single_row.coupon = $scope.table_data[index].coupon;
                    }
                  })
                }
                $scope.display_cashdesk_data.splice(index, 1);
                $scope.forDisplayData($scope.display_cashdesk_data.flat());
            } else {
            }
        });
    }
    $scope.replaceService = function (index, single_data) {
        modal_html_link = 'cashdesk/replaceServiceModal.html';
        modal_controller = 'replaceServiceModalCtrl';
        modal_size = '';
        $scope.data_inside_modal = {
            services: $scope.services,
            single_data:single_data,
            index:index,
            display_cashdesk_data:$scope.display_cashdesk_data,
        }
        modalProvider
            .openPopupModal(
                APP.VIEW_PATH + modal_html_link,
                modal_controller,
                modal_size,
                $scope.data_inside_modal,
                {
                    'success': function (data) {
                        $scope.forDisplayData(data);
                    }
                },
            )

    }
    $scope.editTableData = function (index, single_data) {
        modal_html_link = 'cashdesk/showEditCommentModalContent.html';
        modal_controller = 'showServicesInCashDeskCtrl';
        modal_size = '';
        $scope.data_inside_modal = {
            edited_row: single_data
        }
        modalProvider
            .openPopupModal(
                APP.VIEW_PATH + modal_html_link,
                modal_controller,
                modal_size,
                $scope.data_inside_modal,
                {
                    'success': function (state, title, msg) {
                        const EDITED_ROW = msg;
                        $scope.table_data[index].single_row_comment = EDITED_ROW.single_row_comment;
                    }
                },
            )
    }
    $scope.salesPriceVal = true;
    $scope.membershipPriceVal = false;
    $scope.checkMembership = true;


    

    $scope.onSelectCallback = function (item) {
        
        $scope.salesPriceVal = true;
        $scope.membershipPriceVal = false;
        
        if (item.id != 0) {
            if(item.membership_id == 'yes')
            {
                $scope.checkMembership = false;
                $scope.membershipPriceVal = true;
                $scope.salesPriceVal = false;
                
            }
            else{
                $scope.membershipPriceVal = false;
                $scope.checkMembership = true;
                $scope.salesPriceVal = true;
            }
            
        $scope.invoice.customer = item;
        $scope.customer.full_name = item.firstname + " " + item.lastname;
        var cust_id = $scope.invoice.customer.id;
        var ToDate;
        var CheckDate;
        var CurrentDate;
        
        //Get Coupons of Customers
        $http.get(APP.API + 'customer_coupon_get/' + cust_id
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            
            ToDate = response.data.data[0].to_date;
            CheckDate = new Date(ToDate);
            CurrentDate = new Date();
            if(CurrentDate > CheckDate)
            {
                // Delete Customer Coupon And Customer Membership Id
                $http.get(APP.API + 'delete_customer_membership/' + cust_id
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    
                    console.log(response.data.data);
                    notifications.Message('warning', $scope.customer.full_name,'This Customer Service Is Expired');
                }).catch(function (request, status, errorThrown) {
                });
            }
            else{
                console.log("Byy");
            }
            $scope.first_worker_id = response.data.data[0].id;
        }).catch(function (request, status, errorThrown) {
        });

        
        
        $scope.ui_select_customer = ($scope.ui_select_customer == true) ? false : true;
        
        }else{
            $scope.customer = item;
            $scope.ui_select_customer = ($scope.ui_select_customer == true) ? false : true;
            
        }

        
    };
    $scope.service_data_array = [];
    $scope.saveInvoice = function (which_button) {
        var total_invoice_amount = 0;
        if ($scope.remaining_amount != undefined) {
            $scope.invoice.id = $scope.invoice_id;
            angular.forEach($scope.table_data, function (single_data, key) {
                total_invoice_amount += single_data.single_row_total;
            })
            $scope.invoice.invoice_prefix = $scope.invoice_prefix;
            $scope.invoice.invoice_no = $scope.invoice_no;
            $scope.invoice.table_data = $scope.table_data;
            $scope.invoice.invoice_tax = $scope.group_by_taxs;
            $scope.invoice.appointment_id = $scope.appointment_id;
            $scope.invoice.total_invoice_amount = total_invoice_amount;
            $scope.invoice.removedExistingServiceAppointmentIds = $scope.removedExistingServiceAppointmentIds;
            if ($scope.invoice.to_pay_id != undefined && $scope.invoice.to_pay_id != 0) {
                $http.post(APP.API + 'save_invoice', $scope.invoice
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    $scope.invoice_id = response.data;
                    
                    console.log(response.data);
                    if (which_button == 'to_pay') {
                        $scope.toPay();
                    } else if (which_button == 'save_invoice') {
                        $state.go('app.pages.cashdesk_main', {});
                    } else if (which_button == 'complete_payment') {
                        $scope.add_data_in_invoice_payment();
                    }
                }).catch(function (request, status, errorThrown) {
                });
            } else {
                notifications.Message('error', 'Error', 'Please select to pay option !!')
            }
        } else {
            notifications.Message('error', 'Error', 'Please select item !!');
        }
    }
    $scope.sarchFieldHideShow = function () {
        $scope.ui_select_customer = ($scope.ui_select_customer == true) ? false : true;
        $timeout(function() {
            $('.ui-select-toggle').click()
        },5);
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
            
            console.log($scope.people);
            $scope.people.push({
                id: 0,
                full_name: "Walk-in-customer",
                mobile: 00000,
                postal_code: 0000,
                birthday: "00-00-0000",
            })
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.yourFunction(null);
    $scope.select_services = [];
    $scope.select_services_male = [];
    $scope.select_services_male_membership = [];
    $scope.select_services_female_membership = [];
    $scope.multiselectSelectSetting = {
        checkBoxes: true,
        dynamicTitle: true,
        showUncheckAll: true,
        showCheckAll: false,
        enableSearch: true,
        showSelectAll: true,
        keyboardControls: true,
    };
    
    $scope.service_text = { buttonDefaultText: 'Click here to select services' };
    $scope.service_male_text = { buttonDefaultText: 'Click here to Male select services' };
    $scope.service_female_text = { buttonDefaultText: 'Click here to female select services' };

    $scope.clickAddService = function () {
        if($scope.select_services.length > 0){
        var service_ids = $scope.select_services.map(({ id }) => id);
        angular.forEach(service_ids, function (id, key) {
            $scope.services.find(function (service) {
                if (service.id == id) {
                    if(service.coupon != undefined){
                        if(service.coupon.cc_number != undefined){
                             var total_no_of_serv = 0;
                             angular.forEach(service.coupon.coupon_detail.services,function(service_no){
                                 total_no_of_serv += service_no.no_of_services;
                             })
                             let display_name;
                             if(service.display_name == '-')
                             {
                                 display_name = service.name;
                                 
                                }else{
                                 display_name = service.display_name;

                             }
                             $scope.total_no_of_services = total_no_of_serv;
                                $scope.display_cashdesk_data.push({
                                 which_one: 'service',
                                 id: service.id,
                                 is_check: true,
                                 worker_id: $scope.first_worker_id,
                                 appointment_id: 0,
                                 name: service.name,
                                 display_name: display_name,
                                 display_sale_price: service.sales_price,
                                 calculation_sale_price: parseFloat((service.coupon.coupon_detail.sale_price/$scope.total_no_of_services).toFixed(2)) ,
                                 tax_id: service.tax_id,
                                 quantity: 1,
                                 discount_amount: 0,
                                 discount_percentage: 0,
                                 data_before_discount: {},
                                 discount_apply: 3,
                                 single_row_total: parseFloat((service.coupon.coupon_detail.sale_price/$scope.total_no_of_services).toFixed(2)),
                                 single_row_comment: '',
                                 coupon: service.coupon,
                                 coupon_start_date: service.coupon.from_date,
                                 coupon_end_date: service.coupon.to_date,
                                 service_treatment_date: new Date(),
                                 prestatie_code: service.prestatie_code
                             });
                         }else{
                             let display_name;
                             if(service.display_name == '-')
                             {
                                 display_name = service.name;
                                 
                                }else{
                                 display_name = service.display_name;

                             }
                            $scope.display_cashdesk_data.push({ which_one: 'service', id: service.id, is_check: true, appointment_id: 0, name: service.name,display_name: display_name, display_sale_price: service.sales_price, calculation_sale_price: service.sales_price, tax_id: service.tax_id, quantity: 1, discount_amount: 0, discount_percentage: 0, data_before_discount: {}, discount_apply: 0, single_row_total: service.sales_price, single_row_comment: '', worker_id: $scope.first_worker_id ,
                            service_treatment_date: new Date(),prestatie_code: service.prestatie_code});
                         }
                    }else{
                        let display_name;
                             if(service.display_name == '-')
                             {
                                 display_name = service.name;
                                 
                                }else{
                                 display_name = service.display_name;

                             }
                            

                        $scope.display_cashdesk_data.push({ which_one: 'service', id: service.id, is_check: true, appointment_id: 0, name: service.name,display_name:display_name, display_sale_price: service.sales_price, calculation_sale_price: service.sales_price, tax_id: service.tax_id, quantity: 1, discount_amount: 0, discount_percentage: 0, data_before_discount: {}, discount_apply: 0, single_row_total: service.sales_price, single_row_comment: '', worker_id: $scope.first_worker_id ,service_treatment_date: new Date(),prestatie_code: service.prestatie_code});
                    }
                }
            })
        });
        $scope.forDisplayData($scope.display_cashdesk_data.flat());
        $scope.select_services = [];
    }else{
        notifications.Message('warning', 'Service not selected', 'Select at least one service !!');
    }
    }





    $scope.clickAddService1 = function () {
        if($scope.select_services_female_membership.length > 0){
        var service_ids = $scope.select_services_female_membership.map(({ id }) => id);
        angular.forEach(service_ids, function (id, key) {
            $scope.services.find(function (service) {
                if (service.id == id) {
                    if(service.coupon != undefined){
                        if(service.coupon.cc_number != undefined){
                             var total_no_of_serv = 0;
                             angular.forEach(service.coupon.coupon_detail.services,function(service_no){
                                 total_no_of_serv += service_no.no_of_services;
                             })
                             let display_name;
                             if(service.display_name == '-')
                             {
                                 display_name = service.name;
                                 
                                }else{
                                 display_name = service.display_name;

                             }
                             $scope.total_no_of_services = total_no_of_serv;
                             $scope.display_cashdesk_data.push({
                                 which_one: 'service',
                                 id: service.id,
                                 is_check: true,
                                 worker_id: $scope.first_worker_id,
                                 appointment_id: 0,
                                 name: service.name,
                                 display_name:display_name,
                                 display_sale_price: service.membership_price,
                                 calculation_sale_price: parseFloat((service.coupon.coupon_detail.membership_price/$scope.total_no_of_services).toFixed(2)) ,
                                 tax_id: service.tax_id,
                                 quantity: 1,
                                 discount_amount: 0,
                                 discount_percentage: 0,
                                 data_before_discount: {},
                                 discount_apply: 3,
                                 single_row_total: parseFloat((service.coupon.coupon_detail.membership_price/$scope.total_no_of_services).toFixed(2)),
                                 single_row_comment: '',
                                 coupon: service.coupon,
                                 coupon_start_date: service.coupon.from_date,
                                 coupon_end_date: service.coupon.to_date,
                                 service_treatment_date: new Date(),
                                 prestatie_code: service.prestatie_code
                             });
                         }else{
                            let display_name;
                            if(service.display_name == '-')
                            {
                                display_name = service.name;
                                
                               }else{
                                display_name = service.display_name;

                            }
                            $scope.display_cashdesk_data.push({ which_one: 'service', id: service.id, is_check: true, appointment_id: 0, name: service.name,display_name:display_name, display_sale_price: service.membership_price, calculation_sale_price: service.membership_price, tax_id: service.tax_id, quantity: 1, discount_amount: 0, discount_percentage: 0, data_before_discount: {}, discount_apply: 0, single_row_total: service.sales_price, single_row_comment: '', worker_id: $scope.first_worker_id ,
                            service_treatment_date: new Date(),prestatie_code: service.prestatie_code});
                         }
                    }else{
                        let display_name;
                             if(service.display_name == '-')
                             {
                                 display_name = service.name;
                                 
                                }else{
                                 display_name = service.display_name;

                             }
                        $scope.display_cashdesk_data.push({ which_one: 'service', id: service.id, is_check: true, appointment_id: 0, name: service.name,display_name: display_name, display_sale_price: service.membership_price, calculation_sale_price: service.membership_price, tax_id: service.tax_id, quantity: 1, discount_amount: 0, discount_percentage: 0, data_before_discount: {}, discount_apply: 0, single_row_total: service.sales_price, single_row_comment: '', worker_id: $scope.first_worker_id ,service_treatment_date: new Date(),prestatie_code: service.prestatie_code});
                    }
                }
            })
        });
        $scope.forDisplayData($scope.display_cashdesk_data.flat());
        $scope.select_services_female_membership = [];
    }else{
        notifications.Message('warning', 'Service not selected', 'Select at least one service !!');
    }
    }


    $scope.clickMaleAddService = function () {
        if($scope.select_services_male.length > 0){
        var service_ids = $scope.select_services_male.map(({ id }) => id);
        angular.forEach(service_ids, function (id, key) {
            $scope.services.find(function (service) {
                if (service.id == id) {
                    if(service.coupon != undefined){
                        if(service.coupon.cc_number != undefined){
                             var total_no_of_serv = 0;
                             angular.forEach(service.coupon.coupon_detail.services,function(service_no){
                                 total_no_of_serv += service_no.no_of_services;
                             })
                             let display_name;
                             if(service.display_name == '-')
                             {
                                 display_name = service.name;
                                 
                                }else{
                                 display_name = service.display_name;

                             }
                             $scope.total_no_of_services = total_no_of_serv;
                             $scope.display_cashdesk_data.push({
                                 which_one: 'service',
                                 id: service.id,
                                 is_check: true,
                                 worker_id: $scope.first_worker_id,
                                 appointment_id: 0,
                                 name: service.name,
                                 display_name:display_name,                                 
                                 display_sale_price: service.membership_price,
                                 calculation_sale_price: parseFloat((service.coupon.coupon_detail.sale_price/$scope.total_no_of_services).toFixed(2)) ,
                                 tax_id: service.tax_id,
                                 quantity: 1,
                                 discount_amount: 0,
                                 discount_percentage: 0,
                                 data_before_discount: {},
                                 discount_apply: 3,
                                 single_row_total: parseFloat((service.coupon.coupon_detail.sale_price/$scope.total_no_of_services).toFixed(2)),
                                 single_row_comment: '',
                                 coupon: service.coupon,
                                 coupon_start_date: service.coupon.from_date,
                                 coupon_end_date: service.coupon.to_date,
                                 service_treatment_date: new Date(),
                                 prestatie_code: service.prestatie_code
                             });
                         }
                        {
                            let display_name;
                            if(service.display_name == '-')
                            {
                                display_name = service.name;
                                
                               }else{
                                display_name = service.display_name;

                            }                                     
                            $scope.display_cashdesk_data.push({ which_one: 'service', id: service.id, is_check: true, appointment_id: 0, name: service.name,display_name: display_name, display_sale_price: service.membership_price, calculation_sale_price: service.sales_price, tax_id: service.tax_id, quantity: 1, discount_amount: 0, discount_percentage: 0, data_before_discount: {}, discount_apply: 0, single_row_total: service.sales_price, single_row_comment: '', worker_id: $scope.first_worker_id ,
                            service_treatment_date: new Date(),prestatie_code: service.prestatie_code});
                         }
                    }else{
                        let display_name;
                             if(service.display_name == '-')
                             {
                                 display_name = service.name;
                                 
                                }else{
                                 display_name = service.display_name;

                             }
                        $scope.display_cashdesk_data.push({ which_one: 'service', id: service.id, is_check: true, appointment_id: 0, name: service.name,display_name:display_name, display_sale_price: service.membership_price, calculation_sale_price: service.sales_price, tax_id: service.tax_id, quantity: 1, discount_amount: 0, discount_percentage: 0, data_before_discount: {}, discount_apply: 0, single_row_total: service.sales_price, single_row_comment: '', worker_id: $scope.first_worker_id ,service_treatment_date: new Date(),prestatie_code: service.prestatie_code});
                    }
                }
            })
        });
        $scope.forDisplayData($scope.display_cashdesk_data.flat());
        $scope.select_services_male = [];
    } // rakhna he
    else{
        notifications.Message('warning', 'Service not selected', 'Select at least one service !!');
    }
    }

    var service_remaining;
    $scope.clickMaleAddService1 = function () {
        if($scope.select_services_male_membership.length > 0){
        var service_ids = $scope.select_services_male_membership.map(({ id }) => id);        
            angular.forEach(service_ids, function (id, key) {

                $scope.services.find(function (service) {
                    if (service.id == id) {
                        let display_name;
                             if(service.display_name == '-')
                             {
                                 display_name = service.name;
                                 
                                }else{
                                 display_name = service.display_name;

                             }
                            $scope.display_cashdesk_data.push({ which_one: 'service', id: service.id, is_check: true, appointment_id: 0, name: service.name, display_name:display_name,display_sale_price: service.membership_price, calculation_sale_price: service.membership_price, tax_id: service.tax_id, quantity: 1, discount_amount: 0, discount_percentage: 0, data_before_discount: {}, discount_apply: 0, single_row_total: service.sales_price, single_row_comment: '', worker_id: $scope.first_worker_id ,service_treatment_date: new Date(),prestatie_code: service.prestatie_code});                            
                    }
                })
            });
        $scope.forDisplayData($scope.display_cashdesk_data.flat());
        $scope.select_services_male_membership = [];
    }else{
        notifications.Message('warning', 'Service not selected', 'Select at least one service !!');
    }
    }




    
    $scope.checkValidityOfCoupon = function(){
        $scope.service_quantity = [];
        angular.forEach($scope.table_data, function (single_row) {
            if(single_row.coupon != undefined){
                if(single_row.coupon.id != undefined && single_row.discount_apply == 3){
                    $scope.service_quantity.push({service_id:single_row.id,quantity:single_row.quantity})
                }
            }
        })
        $scope.service_quantity_sum = [];
        $scope.service_quantity.reduce(function(res, value) {
        if (!res[value.service_id]) {
            res[value.service_id] = { serviceId: value.service_id, quantity: 0 };
            $scope.service_quantity_sum.push(res[value.service_id])
        }
        res[value.service_id].quantity += value.quantity;
        return res;
        }, {});
        angular.forEach($scope.services, function (single_service) {
            $scope.service_quantity_sum.find(function(current_service_qty){
                           if (current_service_qty.serviceId == single_service.id){
                            var remaining_services = (single_service.coupon.no_of_services - single_service.coupon.hmt_used);

                            if(remaining_services > 0){
                                if(remaining_services == current_service_qty.quantity){
                                    single_service.coupon = {};
                                }
                            }
                           }
                        })
                if(single_service.coupon != undefined){
                    if(single_service.coupon.cc_number != undefined){
                        single_service.label = single_service.name + "  ( ₹" + single_service.sales_price + ") " + single_service.coupon.cc_number;
                    }else{
                        single_service.label = single_service.name + "  ( ₹" + single_service.sales_price + ")";
                    }
                }else{
                    single_service.label = single_service.name + "  ( ₹" + single_service.sales_price + ")";
                }
            })
}
    $scope.select_products = [];
    $scope.product_text = { buttonDefaultText: 'Click here to select products' };
    $scope.clickAddProduct = function () {
        if($scope.select_products.length > 0){
        var product_index = $scope.table_data.findIndex(function(single_data){
            return single_data.id === $scope.select_products[0].id;
        })
        if(product_index === -1){
            var checked_product = [];
            var product_ids = $scope.select_products.map(({ id }) => id);
            angular.forEach(product_ids, function (id, key) {
                $scope.products.find(function (product) {
                    if (product.id == id) {
                        if (product.stocke > 0) {
                            $scope.display_cashdesk_data.push({ which_one: 'product', id: product.id, is_check: true, appointment_id: 0, name: product.name,display_name:product.display_name, display_sale_price: product.sale_price, calculation_sale_price: product.sale_price, tax_id: product.tax_id, quantity: 1, discount_amount: 0, discount_percentage: 0, data_before_discount: {}, discount_apply: 0, single_row_total: product.sale_price, single_row_comment: '', worker_id: $scope.first_worker_id,stock:product.stocke });
                        } else {
                            notifications.Message('warning', 'Not available', 'Not in stock !!')
                        }
                    }
                })
            });
            //$scope.display_cashdesk_data.push(checked_product)
            $scope.forDisplayData($scope.display_cashdesk_data.flat());
        }else{
            notifications.Message('warning', 'Product already in list.', 'You can increase quantity of selected product !!');
        }
        $scope.select_products = [];
    }else{
        notifications.Message('warning', 'Product not selected', 'Select at least one product !!')
    }
    }


    $scope.select_gender = [];
    $scope.gender_text = { buttonDefaultText: 'Click here to select Gender' };
    $scope.clickAddProduct = function () {
        if($scope.select_products.length > 0){
        var product_index = $scope.table_data.findIndex(function(single_data){
            return single_data.id === $scope.select_products[0].id;
        })
        if(product_index === -1){
            var checked_product = [];
            var product_ids = $scope.select_products.map(({ id }) => id);
            angular.forEach(product_ids, function (id, key) {
                $scope.products.find(function (product) {
                    if (product.id == id) {
                        if (product.stocke > 0) {
                            $scope.display_cashdesk_data.push({ which_one: 'product', id: product.id, is_check: true, appointment_id: 0, name: product.name,display_name:product.display_name, display_sale_price: product.sale_price, calculation_sale_price: product.sale_price, tax_id: product.tax_id, quantity: 1, discount_amount: 0, discount_percentage: 0, data_before_discount: {}, discount_apply: 0, single_row_total: product.sale_price, single_row_comment: '', worker_id: $scope.first_worker_id,stock:product.stocke });
                        } else {
                            notifications.Message('warning', 'Not available', 'Not in stock !!')
                        }
                    }
                })
            });
            //$scope.display_cashdesk_data.push(checked_product)
            $scope.forDisplayData($scope.display_cashdesk_data.flat());
        }else{
            notifications.Message('warning', 'Product already in list.', 'You can increase quantity of selected product !!');
        }
        $scope.select_products = [];
    }else{
        notifications.Message('warning', 'Product not selected', 'Select at least one product !!')
    }
    }


    $scope.toPay = function () {
        if($scope.table_data != undefined && $scope.table_data.length > 0){
            modal_html_link = 'cashdesk/showToPayModalContent.html';
            modal_controller = 'showToPayCashDeskCtrl';
            modal_size = '';
            $scope.data_inside_modal = {
                invoice_id: $scope.invoice_id,
                total_paid_amount: $scope.remaining_amount,
                productServiceData: $scope.table_data,
            }
            modalProvider
            .openPopupModal(
                APP.VIEW_PATH + modal_html_link,
                modal_controller,
                modal_size,
                $scope.data_inside_modal,
                {
                    'success': function (state, title, msg) {
                        if (state == 'paying_amount') {
                            $scope.paying_amount_fn(msg);
                            // START code added by vijay
                            // $scope.data_for_invoice_payment = msg;
                            // if ($scope.invoice.customer != undefined) {
                            //     $scope.tempService = ""
                            //     angular.forEach($scope.table_data, function (single_data) {
                            //         if (single_data.appointment_id == 0 && single_data.which_one == "service" && single_data.is_check == true) {
                            //             $scope.service_data_array.push(single_data);
                            //         }else if (single_data.which_one == "service"){
                            //             if($scope.tempService == ""){
                            //                 $scope.tempService = single_data;
                            //             }
                            //         }
                            //     })
                            //     if ($scope.service_data_array.length > 0 && $scope.tempService && $scope.tempService.appointment_id) {

                            //         //STRAT getting appointment data from exiting service
                            //         $scope.appointment = {};
                            //         var services_array = [];
                            //         $scope.datetimeNew = ""
                            //         $http.get(APP.API + 'get_appointment_by_id/'+$scope.tempService.appointment_id
                            //         ).then(function (response) {
                            //             try {
                            //                 if (response.data.status == "401") {
                            //                     restSessionOut.getRstOut();
                            //                 }
                            //             } catch (err) { }
                            //                 console.log("response.data.data", response.data.data);
                            //             if(response.data.data){
                            //                 $scope.datetimeNew = response.data.data.appointment_date +" "+response.data.data.start_time
                            //                 $scope.datetimeNew = new Date($scope.datetimeNew)
                            //                 $scope.datetimeNew = new Date($scope.datetimeNew.getTime() + 10*60000);
                            //                 angular.forEach($scope.service_data_array, function (selected_service) {
                            //                     $scope.services.find(function (single_service) {
                            //                         if (single_service.id == selected_service.id) {
                            //                             // single_service.worker_id = selected_service.worker_id;
                            //                             single_service.worker_id = $scope.invoice.to_pay_id;
                                                        
                            //                             services_array.push(single_service);
                            //                         }
                            //                     });
                            //                 });
                            //                 $scope.appointment.services = services_array;
                            //                 $scope.appointment.customer = $scope.invoice.customer
                            //                 $scope.appointment.start_time = $scope.datetimeNew.getHours().toString()+":"+$scope.datetimeNew.getMinutes().toString();
                            //                 $scope.appointment.appointment_date = $scope.datetimeNew;
                            //                 $scope.appointment.paid_appointment = 'paid';
                            //                 $http.post(APP.API + 'add_appointment', $scope.appointment
                            //                 ).then(function (response) {
                            //                     try {
                            //                         if (response.data.status == "401") {
                            //                             restSessionOut.getRstOut();
                            //                         }
                            //                     } catch (err) { }
                            //                     if (response.data.success != false) {
                            //                         var APPOINTMENTS = response.data.appointments;
                            //                         angular.forEach($scope.table_data, function (single_data) {

                            //                             if (single_data.which_one == "service" && single_data.appointment_id == 0) {
                            //                                 APPOINTMENTS.find(function (appointment) {
                            //                                     if (appointment.service_id == single_data.id) {
                            //                                         single_data.appointment_id = appointment.id
                            //                                     }
                            //                                 });
                            //                             }
                            //                             APPOINTMENTS = APPOINTMENTS.filter(function(appointment)   {
                            //                                 return single_data.appointment_id != appointment.id;
                            //                               });
                            //                         })
                            //                         $scope.sendToSaveInvoice();
                            //                     } else {
                            //                         // /cb.success('warning', 'Alredy Exist', response.data.message);
                            //                     }
                            //                 }).catch(function (request, status, errorThrown) {
                            //                     var responce_error = request.data;
                            //                     angular.forEach(responce_error.errors, function (error) {
                            //                         for (var i = 0; i < error.length; i++) {
                            //                             toaster.pop('error', 'Error', error[i]);
                            //                         }
                            //                     });
                            //                 });

                            //             }
                                        
                            //         }).catch(function (request, status, errorThrown) {
                            //         });
                            //         //END getting appointment data from exiting service
                                    
                            //     } else {
                            //         //$scope.sendToSaveInvoice();
                            //     }
                            // } else {
                            //     //$scope.sendToSaveInvoice();
                            // }
                            // END code added by vijay
                        }
                    }
                },
            )
        }else{
            notifications.Message('warning','Warning','There is no service selected for payment.');
        }
    }
    $scope.data_for_invoice_payment = {}
    $scope.paying_amount_fn = function (payment) {
        $scope.data_for_invoice_payment = payment;
        if ($scope.invoice.customer != undefined) {
            angular.forEach($scope.table_data, function (single_data) {
                if (single_data.appointment_id == 0 && single_data.which_one == "service" && single_data.is_check == true) {
                    $scope.service_data_array.push(single_data);
                }
            })
            if ($scope.service_data_array.length > 0) {
                if(Object.keys(UNPAID_INVOICE).length === 0){
                    modal_html_link = 'cashdesk/askSaveAppointmentModalContent.html';
                    modal_controller = 'askSaveAppointmentCtrl';
                    modal_size = '';
                    $scope.data_inside_modal = {
                        customer: $scope.invoice.customer,
                        service_data_array: $scope.service_data_array,
                        to_pay_id:$scope.invoice.to_pay_id
                    }
                    // modalProvider
                        // .openPopupModal(
                        //     APP.VIEW_PATH + modal_html_link,
                        //     modal_controller,
                        //     modal_size,
                        //     $scope.data_inside_modal,
                        //     {
                        //         'success': function (state, title, msg) {
                        //             if (state == 'success') {
                        //                 if (msg != 'closed') {
                        //                     var APPOINTMENTS = msg;
                        //                     angular.forEach($scope.table_data, function (single_data) {

                        //                         if (single_data.which_one == "service" && single_data.appointment_id == 0) {
                        //                             APPOINTMENTS.find(function (appointment) {
                        //                                 if (appointment.service_id == single_data.id) {
                        //                                     single_data.appointment_id = appointment.id
                        //                                 }
                        //                             });
                        //                         }
                        //                         APPOINTMENTS = APPOINTMENTS.filter(function(appointment)   {
                        //                             return single_data.appointment_id != appointment.id;
                        //                           });
                        //                     })
                                            $scope.sendToSaveInvoice();
                        //                 }else{
                        //                     $scope.sendToSaveInvoice();
                        //                 }
                        //             }
                        //         }
                        //     },
                        // )
                }else{
                     $scope.sendToSaveInvoice();
                }
            } else {
                $scope.sendToSaveInvoice();
            }
        } else {
            $scope.sendToSaveInvoice();
        }
    }
    $scope.sendToSaveInvoice = function () {
        if ($scope.total_coupon_amount > 0) {
            $scope.data_for_invoice_payment.table_data.push({
                display_name: 'Coupon Card',
                display_icon: false,
                amount: $scope.total_coupon_amount,
                class_name: "fa-money",
                status: true,
                method: 'coupon'
            })
        }
        angular.forEach($scope.table_data, function (single_data, index) {
            if($scope.removedExistingServiceAppointmentIds.length > 0){
                if($scope.removedExistingServiceAppointmentIds.includes($rootScope.clickedAppointmentId)){
                    if($scope.table_data[index].appointment_id == 0){
                        $scope.table_data[index].appointment_id = $rootScope.clickedAppointmentId;
                    }
                }
            }
            $scope.table_data[index].is_disabled = (single_data.is_check == true) ? 1 : 0;
        });
        $scope.saveInvoice('complete_payment');
    }
    $scope.add_data_in_invoice_payment = function () {
        $scope.data_for_invoice_payment.invoice_id = $scope.invoice_id
        $http.post(APP.API + 'save_payment', $scope.data_for_invoice_payment
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            if (response.data.success == true) {
                displayInvoiceModal.set(true);
                storeAppointmentData.set({});
                $state.go('app.pages.invoice/:id/:data_id', { id: $scope.invoice_id, data_id: 0 });
            }
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.today = function () {
        $scope.invoice.invoice_date = new Date();
        $scope.invoice.treatment_date = (UNPAID_INVOICE.treatment_date != undefined) ? new Date(UNPAID_INVOICE.treatment_date) : new Date();
    };
    $scope.today();
    
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
    $scope.open = function (type,index) {
        if (type == 'treatment') {
            $scope.treatment_opened = !$scope.treatment_opened;
        }else if(type == 'service_treatment_date') {
            $scope.table_data[index].dt_open = !$scope.table_data[index].dt_open;
        }else{
            $scope.opened = !$scope.opened;
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
    $scope.formatsInvoiceDate = 'dd-MM-yyyy';
    $scope.formats = ['dd-MM-yyyy HH:mm'];
    $scope.format = $scope.formats[0];
    $scope.format1 = 'dd-MM-yyyy';
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
app.controller('showServicesInCashDeskCtrl', ["$scope", "$uibModalInstance", "$http", "items", "APP",  "cb", "restSessionOut", "notifications", function ($scope, $uibModalInstance, $http, items, APP, cb, restSessionOut, notifications) {

    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    $scope.servicesList = [];
    $scope.productList = [];
    $scope.search = {
        "search_service": '',
        "search_product": '',
    };
    var search_data = {};
    var php_api_link = '';
    var product_true_ids = [];
    var service_true_ids = [];
    var checked_product = [];
    var checked_service = [];
    var cashdesk_product = [];
    $scope.cashdesk_full_data = [];
    $scope.ids = {};
    $scope.search_table = true;
    $scope.discount = {};
    $scope.edited_row = {};
    switch (items.which_one) {
        case 'services':
            $scope.all_service_cat = items.service_categories;
            $scope.all_services = items.services;
            angular.forEach($scope.all_services, function (v, i) {
                $scope.servicesList.push(v.name);
            })
            search_data = { search: $scope.search, ids: [], taxid: 0 };
            php_api_link = 'search_service_for_coupon';
            break;
        case 'products':
            $scope.product_categories = items.product_categories;
            $scope.products = items.products;
            angular.forEach($scope.products, function (v, i) {
                $scope.productList.push(v.name);
            })
            search_data = { search: $scope.search };
            php_api_link = 'search_products';
            break;
        case 'gifts':
            var gift_unicode_no = items.gift_certificate_no;
            break;
        case 'coupons':
            $scope.coupons = items.coupons;
            search_data = { search: $scope.search };
            $scope.coupon_cheked = false;
            break;
        case 'discount':
            $scope.selected_row_for_discount = items.selected_row;
            // search_data = { search: $scope.search };
            break;
    }
    if (items.edited_row != undefined) {
        $scope.edited_row = items.edited_row
    }
    $scope.saveEditRowComment = function () {
        cb.success('comment_add', 'comment', $scope.edited_row);
        $uibModalInstance.close();
    }
    $scope.filterByType = function () {
        if ($scope.productTypeFilter) {
            if ($scope.productTypeFilter == 1) {
                $('#tr_1').show();
                $('#tr_2').hide();
            } else {
                $('#tr_2').show();
                $('#tr_1').hide();
            }
        } else {
            $('#tr_1').show();
            $('#tr_2').show();
        }
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
    $scope.onKeyUp = function () {
        var serach_value = $scope.search;
        if (serach_value.search_service.length > 0 || serach_value.search_product != undefined) {
            if (serach_value.search_product.length > 0 || serach_value.search_service.length > 0) {
                $scope.main_table = true;
                $scope.search_table = false;
            } else {
                $scope.main_table = false;
                $scope.search_table = true;
            }
        } else {
            $scope.main_table = false;
            $scope.search_table = true;
        }
        $http.post(APP.API + php_api_link, search_data
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            if (items.which_one == 'services') {
                $scope.searched_services = response.data.data;
            } else {
                $scope.searched_products = response.data.data;
            }
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.checkedRadio = function (which_checked) { $scope.discount.type = which_checked; }
    $scope.AddServiceProduct = function (which_one) {
        switch (which_one) {
            case 'services':
                service_true_ids = [];
                checked_service = [];
                angular.forEach($scope.ids, function (id, key) {
                    if (id == true) {
                        service_true_ids.push(key);
                        items.services.find(function (service) {
                            if (service.id == key) {
                                checked_service.push(service);
                            }
                        })
                    }
                });
                angular.forEach(checked_service, function (service) {
                    $scope.cashdesk_full_data.push(
                        { which_one: 'service', id: service.id, is_check: true, appointment_id: 0, name: service.name, display_sale_price: service.sales_price, calculation_sale_price: service.sales_price, tax_id: service.tax_id, quantity: 1, discount_amount: 0, discount_percentage: 0, data_before_discount: {}, discount_apply: 0, single_row_total: service.sales_price, single_row_comment: '', worker_id: items.first_worker_id }
                    );
                })
                cb.success('cashdesk_data', 'services', $scope.cashdesk_full_data);
                $uibModalInstance.close();
                $scope.ids = {};
                break;
            case 'products':

                product_true_ids = [];
                checked_product = [];
                angular.forEach($scope.ids, function (id, key) {
                    if (id == true) {
                        product_true_ids.push(key);
                        items.products.find(function (product) {
                            if (product.id == key) {
                                checked_product.push(product);
                            }
                        })
                    }
                });
                angular.forEach(checked_product, function (product) {
                    $scope.cashdesk_full_data.push(
                        { which_one: 'product', id: product.id, is_check: true, appointment_id: 0, name: product.name,display_name:product.display_name, display_sale_price: product.sale_price, calculation_sale_price: product.sale_price, tax_id: product.tax_id, quantity: 1, discount_amount: 0, discount_percentage: 0, data_before_discount: {}, discount_apply: 0, single_row_total: product.sale_price, single_row_comment: '', worker_id: items.first_worker_id }
                    );
                })
                cb.success('cashdesk_data', 'products', $scope.cashdesk_full_data);
                $uibModalInstance.close();
                $scope.ids = {};
                break;
            case 'gift':
                if ($scope.gift_coupon.unicode == undefined || $scope.gift_coupon.unicode == '') {
                    notifications.Message('error', 'Error', 'Unicode is empty !!');
                    return false;
                }
                if ($scope.gift_coupon.sale_price == '') {
                    notifications.Message('error', 'Error', 'Value is empty !!');
                    return false;
                }
                if ($scope.gift_coupon.sale_price == undefined) {
                    notifications.Message('error', 'Error', 'Value is empty or invalid !!');
                    return false;
                }
                var gift_card = { which_one: 'gift', id: $scope.gift_coupon.unicode, is_check: true, appointment_id: 0, name: 'Gift Certificate(' + $scope.gift_coupon.unicode + ')', display_sale_price: $scope.gift_coupon.sale_price, calculation_sale_price: $scope.gift_coupon.sale_price, tax_id: 0, quantity: 1, discount_amount: 0, discount_percentage: 0, data_before_discount: {}, discount_apply: 0, single_row_total: $scope.gift_coupon.sale_price, single_row_comment: '', worker_id: items.first_worker_id }
                cb.success('gift_certificate', 'gift', gift_card);
                $uibModalInstance.close();
                break;
            case 'coupons':
                // if ($scope.checked_coupon_data == undefined) {
                //     notifications.Message('error', 'Error', 'Select coupon code !!');
                //     return false;
                // }
                if ($scope.entrance_date.date == null || $scope.entrance_date.date == '') {
                    notifications.Message('error', 'Error', 'Choose entrance date !!');
                    return false;
                }
                if ($scope.end_date.date == null || $scope.end_date.date == '') {
                    notifications.Message('error', 'Error', 'Choose End date !!');
                    return false;
                }
                var coupon_card = { which_one: 'Membership', id: $scope.checked_coupon_data.id, is_check: true, appointment_id: 0, name:"Membership",display_name:'Membership', display_sale_price: $scope.checked_coupon_data.sale_price, calculation_sale_price: $scope.checked_coupon_data.sale_price, tax_id: 0, quantity: 1, discount_amount: 0, discount_percentage: 0, data_before_discount: {}, discount_apply: 0, single_row_total: $scope.checked_coupon_data.sale_price, single_row_comment: '', worker_id: items.first_worker_id,coupon_start_date:   moment($scope.entrance_date.date).format('YYYY-MM-DD'),coupon_end_date: moment($scope.end_date.date).format('YYYY-MM-DD')}
                
                console.log($scope.checked_coupon_data.id);
                cb.success('coupon_card_certificate', 'coupon', coupon_card);
                $uibModalInstance.close();
                break;
            case 'discount':
                if ($scope.discount.type == 'amount') {
                    if ($scope.discount.value_amount > ($scope.selected_row_for_discount.calculation_sale_price*$scope.selected_row_for_discount.quantity)) {
                        notifications.Message('error', 'Error', 'Discount amount should be less than total price !!');
                        $scope.discount.value_amount = 0;
                        return false;
                    } else if ($scope.discount.value_amount == undefined) {
                        notifications.Message('error', 'Error', 'Discount amount should be greater than zero !!');
                        $scope.discount.value_amount = 0;
                        return false;
                    }
                } else if ($scope.discount.type == 'percentage') {
                    if ($scope.discount.value_percentage > 99) {
                        notifications.Message('error', 'Error', 'Not allow more than 99% !!');
                        $scope.discount.value_percentage = 0;
                        return false;
                    } else if ($scope.discount.value_percentage == undefined || $scope.discount.value_percentage == 0) {
                        notifications.Message('error', 'Error', 'Discount percentage should be greater than zero !!');
                        $scope.discount.value_percentage = 0;
                        return false;
                    }
                } else if ($scope.discount.type == 'coupon_card') {
                    $scope.discount.coupon = $scope.selected_row_for_discount.coupon;
                }
                cb.success('discount_data', 'discount', $scope.discount);
                $uibModalInstance.close();
                break;
        }
    }
    $scope.gift_coupon = {};
    $scope.generateUnicode = function () {
        $scope.gift_coupon.unicode = (gift_unicode_no + 1);
    }
    $scope.couponCheck = function (coupon) {
        $scope.coupon_cheked = true;
        $scope.checked_coupon_data = coupon;
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    
    var a = new Date();
    
    $scope.entrance_date = { date: a };
    var end_date = moment($scope.entrance_date.date, 'DD-MM-YYYY').add('month', 12);
    $scope.end_date = { date: end_date._d };


    $scope.dateChanged = function () {
       
       
            // var end_date = moment($scope.entrance_date.date, 'DD-MM-YYYY').add('month', $scope.checked_coupon_data.validity);
            // $scope.end_date = end_date._d;
        
    }
    $scope.dateChanged_endDate = function () {
        var check1 = moment(moment($scope.end_date.date, 'DD-MM-YYYY').format('YYYY-MM-DD')).isBefore(moment(new Date(), 'DD-MM-YYYY').format('YYYY-MM-DD'));
        if(check1){
            notifications.Message('warning','Not allowed past date !!','End Date should be after or equal to today.')
            $scope.end_date = { date: '' }
        }else{
            // var end_date = moment($scope.entrance_date.date, 'DD-MM-YYYY').add('month', $scope.checked_coupon_data.validity);
            // $scope.end_date = end_date._d;
            // $scope.end_date = { date: end_date._d };
            console.log($scope.end_date.date);

        }
    }
    $scope.start = $scope.minDate;
    $scope.end = $scope.maxDate;
    $scope.datepickerOptions = {
        showWeeks: false,
        startingDay: 1,
        datepickerMode: 'day'
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
        $scope.entrance_date = new Date(year, month, day);
    };
    $scope.toggleMin = function () {
        $scope.datepickerOptions.minDate = $scope.datepickerOptions.minDate ? null : new Date();
        $scope.dateDisabledOptions.minDate = $scope.dateDisabledOptions.minDate ? null : new Date();
    };
    $scope.maxDate = new Date(2020, 5, 22);
    $scope.minDate = new Date(1970, 12, 31);
    $scope.open = function () {
        $scope.opened = !$scope.opened;
    };
    $scope.open1 = function () {
        $scope.opened1 = !$scope.opened1;
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
        $scope.entrance_date = d;
    };
    $scope.clear = function () {
        $scope.entrance_date = null;
    };
}])

app.controller('showToPayCashDeskCtrl', ["$scope", "$uibModalInstance", "$http", "items", "APP", "cb", "restSessionOut", "modalProvider", "notifications", "SweetAlert", "$state", "displayInvoiceModal", function ($scope, $uibModalInstance, $http, items, APP, cb, restSessionOut, modalProvider, notifications, SweetAlert, $state, displayInvoiceModal) {


    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }

    $scope.paid_amount = items.total_paid_amount;
    $scope.invoice_id = items.invoice_id;
    $scope.productServiceData = items.productServiceData;
    $scope.flag = (items.total_paid_amount == 0) ? 1 : 0;
    
    $scope.received_amount = 0;
    var blur_received_amount = 0;
    var cheked_received_amount = 0;
    var uncheked_received_amount = 0;
    $scope.gift_received = [];
    var selected_gift_ids = [];
   
    $scope.$watch('received_amount', function() {
        if(parseFloat($scope.received_amount) != parseFloat($scope.paid_amount)){
            $scope.totalLblClass = false
        }
    });
   
    $scope.PaymentMethod = function () {
        $http.get(APP.API + 'payment_method/1'
                ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) {
            }
            var check_data = response.data.data.filter(function(single_p){
                return single_p.is_check == 1;
            });
            angular.forEach(check_data,function(single_p){
                single_p.display_name = single_p.method_name;
                single_p.method = single_p.method;
                single_p.status = false;
                single_p.amount = 0;
                single_p.display_icon = true;
                single_p.class_name = single_p.payment_icon;
            });
            $scope.table_data = check_data;
        }).catch(function (request, status, errorThrown) {
        });
    };
    $scope.PaymentMethod();
   
   
    // $scope.table_data = [
    //     { display_name: 'In cash', method: 'cash', status: false, amount: 0, display_icon: true, class_name: 'fa-money' },
    //     { display_name: 'Pin', method: 'pin', status: false, amount: 0, display_icon: true, class_name: 'fa-credit-card' },
    //     { display_name: 'Credit card', method: 'credit_card', status: false, amount: 0, display_icon: true, class_name: 'fa-cc-mastercard' },
    //     { display_name: 'Invoice', method: 'invoice', status: false, amount: 0, display_icon: true, class_name: 'fa-file-text' },
    //     { display_name: 'Gift certificate', method: 'gift_certificate', status: false, amount: 0, display_icon: true, class_name: 'fa-gift' },

    // ]

    $scope.getPaidAmount = function () {
        $http.get(APP.API + 'get_payment_by_invoice_id/' + $scope.invoice_id
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.getPaidAmount();
    $scope.totalLblClass = false
    if(items.total_paid_amount == "0.00"){
        $scope.totalLblClass = true
    }
    $scope.payMethod = function (index, _coming_method) {
        if (_coming_method.method == 'gift_certificate') {
            modalProvider
                .openPopupModal(
                    APP.VIEW_PATH + 'cashdesk/showGiftListModalContent.html',
                    'giftListCtrl',
                    'sm',
                    { selected_gift_ids: selected_gift_ids },
                    {
                        'success': function (state, title, msg) {
                            $scope.totalLblClass = true
                            selected_gift_ids.push(msg.id);
                            $scope.gift_received.push(msg);
                            $scope.after_add_gift();
                        }
                    },
                    'compare-modal'
                )
        } else {
            $scope.table_data[index].status = ($scope.table_data[index].status == false) ? true : false;
            if ($scope.table_data[index].status) {
                cheked_received_amount = 0;
                angular.forEach($scope.table_data, function (single_data, key) {
                    if (cheked_received_amount != $scope.paid_amount) {
                        single_data.display_icon = true;
                    } else {
                        single_data.display_icon = false;
                    }
                    single_data.status = (single_data.amount == 0) ? false : true;
                    cheked_received_amount += single_data.amount;
                });
                cheked_received_amount = $scope.paid_amount - cheked_received_amount;
                $scope.table_data[index].amount = cheked_received_amount;
                $scope.table_data[index].status = true;
                angular.forEach($scope.table_data, function (single_data, key) {
                    single_data.display_icon = (single_data.amount == 0) ? false : true;
                })
            } else {
                uncheked_received_amount = 0;
                $scope.table_data[index].amount = 0;
                angular.forEach($scope.table_data, function (single_data, key) {
                    if (uncheked_received_amount != $scope.paid_amount) {
                        single_data.display_icon = true;
                    } else {
                        single_data.display_icon = false;
                    }
                    single_data.status = (single_data.amount == 0) ? false : true;
                    uncheked_received_amount += single_data.amount;
                });
            }
            $scope.received_amount = 0;
            angular.forEach($scope.table_data, function (single_data, key) {
                $scope.received_amount += single_data.amount;
                if ($scope.paid_amount == $scope.received_amount || $scope.paid_amount == 0) {
                    $scope.flag = 1;
                    if (key == 4) {
                        single_data.display_icon = false;
                    }
                } else {
                    $scope.flag = 0;
                }
            })
        }
        
        $scope.totalLblClass = _coming_method.status
    }
    $scope.amountBoxBlur = function () {
        blur_received_amount = 0;
        var keepGoing = true;
        $scope.totalLblClass = true
        angular.forEach($scope.table_data, function (single_data, key) {
            if (keepGoing) {
                if (blur_received_amount != $scope.paid_amount) {
                    single_data.display_icon = true;
                } else {
                    single_data.display_icon = false;
                }
                single_data.status = (single_data.amount == 0 || single_data.amount == null) ? false : true;
                if (single_data.amount != undefined) {
                    if (single_data.amount > $scope.paid_amount) {
                        single_data.status = false;
                        notifications.Message('warning', 'Enter valid amount', 'Received amount is greater than paid amount !!');
                    } else {
                        blur_received_amount += single_data.amount;
                        if (blur_received_amount > $scope.paid_amount) {
                            notifications.Message('warning', 'Enter valid amount', 'Received amount is greater than paid amount !!');
                            single_data.status = false;
                        }
                    }
                } else {
                    single_data.status = false;
                    notifications.Message('warning', 'Enter valid amount', 'Please enter valid amount !!')
                    keepGoing = false;
                }
            }
        });
        $scope.received_amount = 0;
        angular.forEach($scope.table_data, function (single_data, key) {
            $scope.received_amount += single_data.amount;
        })
        if ($scope.received_amount == $scope.paid_amount || $scope.paid_amount == 0) {
            $scope.flag = 1;
            angular.forEach($scope.table_data, function (single_data, key) {
                if (key == 4) {
                    single_data.display_icon = false;
                } else {
                    single_data.display_icon = (single_data.amount == 0 || single_data.amount == null) ? false : true;
                }
            })
        } else {
            $scope.flag = 0;
            angular.forEach($scope.table_data, function (single_data, key) {
                single_data.display_icon = true
            })
        }
    }
    $scope.after_add_gift = function () {
        var gifted_amount = 0
        var total_received_without_gift = 0;
        var received_amount_with_gift = 0
        $scope.table_data[4].amount = 0
        angular.forEach($scope.gift_received, function (single_gift, key) {
            gifted_amount += single_gift.calculation_sale_price
        })
        angular.forEach($scope.table_data, function (single_data, key) {
            total_received_without_gift += single_data.amount;
        })
        if (gifted_amount >= $scope.paid_amount) {
            $scope.table_data[4].amount = ($scope.paid_amount - total_received_without_gift);
            angular.forEach($scope.table_data, function (single_data, key) {
                if (received_amount_with_gift != $scope.paid_amount) {
                    single_data.display_icon = (single_data.amount == 0) ? false : true;
                } else {
                    single_data.display_icon = false;
                }
                single_data.status = (single_data.amount == 0) ? false : true;
                received_amount_with_gift += single_data.amount;
            });
            $scope.table_data[4].display_icon = false;
            $scope.received_amount = 0;
            angular.forEach($scope.table_data, function (single_data, key) {
                $scope.received_amount += single_data.amount;
                if ($scope.received_amount == $scope.paid_amount || $scope.paid_amount == 0) {
                    $scope.flag = 1;
                    if (key == 4) {
                        single_data.display_icon = false;
                    }
                } else {
                    $scope.flag = 0;
                }
            })
        } else {
            var gifted_plus_witout_gifted = gifted_amount + total_received_without_gift;
            if (gifted_plus_witout_gifted >= $scope.paid_amount) {
                $scope.table_data[4].amount = ($scope.paid_amount - total_received_without_gift);
                angular.forEach($scope.table_data, function (single_data, key) {
                    if (received_amount_with_gift != $scope.paid_amount) {
                        single_data.display_icon = (single_data.amount == 0) ? false : true;
                    } else {
                        single_data.display_icon = false;
                    }
                    single_data.status = (single_data.amount == 0) ? false : true;
                    received_amount_with_gift += single_data.amount;
                });
                $scope.table_data[4].display_icon = false;
                $scope.received_amount = 0;
                angular.forEach($scope.table_data, function (single_data, key) {
                    $scope.received_amount += single_data.amount;
                    if ($scope.received_amount == $scope.paid_amount || $scope.paid_amount == 0) {
                        $scope.flag = 1;
                        if (key == 4) {
                            single_data.display_icon = false;
                        }
                    } else {
                        $scope.flag = 0;
                    }
                })
            } else {
                $scope.table_data[4].amount = gifted_amount;
                angular.forEach($scope.table_data, function (single_data, key) {
                    if (received_amount_with_gift != $scope.paid_amount) {
                        single_data.display_icon = true;
                    } else {
                        single_data.display_icon = false;
                    }
                    single_data.status = (single_data.amount == 0) ? false : true;
                    received_amount_with_gift += single_data.amount;
                });
                $scope.table_data[4].display_icon = true;
                $scope.received_amount = 0;
                angular.forEach($scope.table_data, function (single_data, key) {
                    $scope.received_amount += single_data.amount;
                    if ($scope.received_amount == $scope.paid_amount || $scope.paid_amount == 0) {
                        $scope.flag = 1;
                        if (key == 4) {
                            single_data.display_icon = false;
                        }
                    } else {
                        $scope.flag = 0;
                    }
                })
            }
        }
    }
    $scope.removeGift = function (gift) {
        var index = selected_gift_ids.indexOf(gift.id);
        if (index > -1) {
            selected_gift_ids.splice(index, 1);
        }
        var gift_index = $scope.gift_received.findIndex(function (single_gift) { return single_gift.id == gift.id; });
        if (gift_index > -1) {
            $scope.gift_received.splice(gift_index, 1);
        }
        var gifted_amount = 0
        var total_received_without_gift = 0;
        var received_amount_with_gift = 0
        $scope.table_data[4].amount = 0;
        angular.forEach($scope.gift_received, function (single_gift, key) {
            gifted_amount += single_gift.calculation_sale_price
        })
        angular.forEach($scope.table_data, function (single_data, key) {
            total_received_without_gift += single_data.amount;
        })
        if (gifted_amount >= $scope.paid_amount) {
            $scope.table_data[4].amount = ($scope.paid_amount - total_received_without_gift);
            angular.forEach($scope.table_data, function (single_data, key) {
                if (received_amount_with_gift != $scope.paid_amount) {
                    single_data.display_icon = (single_data.amount == 0) ? false : true;
                } else {
                    single_data.display_icon = false;
                }
                single_data.status = (single_data.amount == 0) ? false : true;
                received_amount_with_gift += single_data.amount;
            });
            $scope.table_data[4].display_icon = false;
            $scope.received_amount = 0;
            angular.forEach($scope.table_data, function (single_data, key) {
                $scope.received_amount += single_data.amount;
                if ($scope.received_amount == $scope.paid_amount || $scope.paid_amount == 0) {
                    $scope.flag = 1;
                    if (key == 4) {
                        single_data.display_icon = false;
                    }
                } else {
                    $scope.flag = 0;
                }
            })
        } else {
            var gifted_plus_witout_gifted = gifted_amount + total_received_without_gift;
            if (gifted_plus_witout_gifted >= $scope.paid_amount) {
                $scope.table_data[4].amount = (gifted_plus_witout_gifted - $scope.paid_amount);
                angular.forEach($scope.table_data, function (single_data, key) {
                    if (received_amount_with_gift != $scope.paid_amount) {
                        single_data.display_icon = (single_data.amount == 0) ? false : true;
                    } else {
                        single_data.display_icon = false;
                    }
                    single_data.status = (single_data.amount == 0) ? false : true;
                    received_amount_with_gift += single_data.amount;
                });
                $scope.table_data[4].display_icon = false;
                $scope.received_amount = 0;
                angular.forEach($scope.table_data, function (single_data, key) {
                    $scope.received_amount += single_data.amount;
                    if ($scope.received_amount == $scope.paid_amount || $scope.paid_amount == 0) {
                        $scope.flag = 1;
                        if (key == 4) {
                            single_data.display_icon = false;
                        }
                    } else {
                        $scope.flag = 0;
                    }
                })
            } else {
                $scope.table_data[4].amount = gifted_amount;
                angular.forEach($scope.table_data, function (single_data, key) {
                    if (received_amount_with_gift != $scope.paid_amount) {
                        single_data.display_icon = true;
                    } else {
                        single_data.display_icon = false;
                    }
                    single_data.status = (single_data.amount == 0) ? false : true;
                    received_amount_with_gift += single_data.amount;
                });
                $scope.table_data[4].display_icon = true;
                $scope.received_amount = 0;
                angular.forEach($scope.table_data, function (single_data, key) {
                    $scope.received_amount += single_data.amount;
                    if ($scope.received_amount == $scope.paid_amount || $scope.paid_amount == 0) {
                        $scope.flag = 1;
                        if (key == 4) {
                            single_data.display_icon = false;
                        }
                    } else {
                        $scope.flag = 0;
                    }
                })
            }
        }

        if($scope.gift_received.length == 0){
            $scope.totalLblClass = false
        }
    }
    $scope.completePayment = function () {
        var products = [];
        angular.forEach($scope.productServiceData, function (val, i) {
            if (val.which_one == "product") {
                products.push(val);
            }
        })
        $http.post(APP.API + 'deduct_product_quantity', products
        ).then(function (response) {
        }).catch(function (request, status, errorThrown) { });
        $scope.payment = {
            invoice_id: $scope.invoice_id,
            table_data: $scope.table_data,
            gift_received: $scope.gift_received
        }
        $uibModalInstance.close();
        cb.success('paying_amount', 'paying_amount', $scope.payment)
    }

    $scope.completePayment1 = function () {
        var total_amount = 0;
        $scope.payment = {
            invoice_id: $scope.invoice_number,
            table_data: $scope.table_data,
            gift_received: $scope.gift_received
        }
        angular.forEach($scope.table_data, function (single_data, key) {
            total_amount += single_data.amount;
        })
        if ($scope.paid_amount == total_amount) {
            $http.post(APP.API + 'save_payment', $scope.payment
            ).then(function (response) {
                try {
                    if (response.data.status == "401") {
                        restSessionOut.getRstOut();
                    }
                } catch (err) { }
                if (response.data.success == true) {
                    $uibModalInstance.close();
                    displayInvoiceModal.set(true);
                    $state.go('app.pages.invoice/:id/:data_id', { id: $scope.invoice_id, data_id: 0 });
                }
            }).catch(function (request, status, errorThrown) {
            });
        } else if ($scope.paid_amount > total_amount) {
            SweetAlert.swal({
                title: "Not allow !!",
                // text: "Please confirm that paid amount is greater than paying amount ?",
                text: "You are paying lesser amount compare to paid amount !!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "pay full amount, Okay ?",
                closeOnConfirm: true,
                closeOnCancel: true
            }, function (isConfirm) {
                if (isConfirm) {
                } else {
                }
            });
        } else if ($scope.paid_amount < total_amount) {
            alert("total amount greater than");
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
        // cb.success('on_close', 'cancel', "On modal close communicate to main modal");
    };
}]);
app.controller('giftListCtrl', ["$scope", "$uibModalInstance", "$http", "items", "APP", "cb", "restSessionOut", function ($scope, $uibModalInstance, $http, items, APP, cb, restSessionOut) {


    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    var GIFTS = [];
    $http.get(APP.API + 'gift_list',
    ).then(function (response) {
        try {
            if (response.data.status == "401") {
                restSessionOut.getRstOut();
            }
            GIFTS = response.data
            angular.forEach(items.selected_gift_ids, function (value, key) {
                var index = GIFTS.findIndex(function (gift) { return gift.id == value; });
                if (index > -1) {
                    GIFTS.splice(index, 1);
                }
            })
            $scope.gifts = GIFTS;
        } catch (err) { }
    }).catch(function (request, status, errorThrown) {
    });
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.clickOnGift = function (selected_gift) {
        cb.success('selected_gift', 'selected_gift', selected_gift);
        $uibModalInstance.close();
    }
}]);
app.controller('askSaveAppointmentCtrl', ["$scope", "$uibModalInstance", "$http", "items", "APP", "toaster", "cb", "restSessionOut", function ($scope, $uibModalInstance, $http, items, APP, toaster, cb, restSessionOut) {
    $scope.appointment = {};
    var services_array = [];
    $scope.services = {};
    $scope.appointment.customer = items.customer;
    $scope.list_service = function () {
        $http.get(APP.API + 'list_service'
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            $scope.services = response.data.data;
            angular.forEach(items.service_data_array, function (selected_service) {
                $scope.services.find(function (single_service) {
                    if (single_service.id == selected_service.id) {
                        // single_service.worker_id = selected_service.worker_id;
                        single_service.worker_id = items.to_pay_id;
                        
                        services_array.push(single_service);
                    }
                });
            });
            $scope.appointment.services = services_array;
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.list_service();
    $scope.saveAppointment = function () {
        $scope.appointment.start_time = ((($scope.appointment_date.getHours().toString()).length > 1) ? $scope.appointment_date.getHours().toString() : "0" + $scope.appointment_date.getHours().toString()) + ":" + ((($scope.appointment_date.getMinutes().toString()).length > 1) ? $scope.appointment_date.getMinutes().toString() : "0" + $scope.appointment_date.getMinutes().toString());
        $scope.appointment.appointment_date = $scope.appointment_date;
        $scope.appointment.paid_appointment = 'paid';
        $http.post(APP.API + 'add_appointment', $scope.appointment
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            if (response.data.success != false) {
                $uibModalInstance.close();
                cb.success('success', 'Success', response.data.appointments);
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
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
        cb.success('success', 'Success', 'closed');
    };
    $scope.today = function () {
        $scope.appointment_date = new Date();
    };
    $scope.today();
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
    $scope.open = function () {
        $scope.opened = !$scope.opened;
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
    $scope.formats = ['dd-MM-yyyy HH:mm'];
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
}])

app.controller('createCouponCtrl', ["$scope", "$uibModalInstance", "$http", "items", "APP",  "cb", "restSessionOut", "notifications","modalProvider", function ($scope, $uibModalInstance, $http, items, APP, cb, restSessionOut, notifications,modalProvider) {


    var service_ids = [];
    var taxid = [];
   // $scope.service_below_form = false;
    $scope.coupon = {validity:1}



    $scope.entrance_date = { date: '' }
    



    $scope.service_list_for_coupon = function () {
        var service_data = { service_ids: service_ids, tax_id: ($scope.current_tax_id == undefined) ? 0 : $scope.current_tax_id.id }
       
        $http.post(APP.API + 'service_list_for_coupon', service_data
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            
            $scope.service_categories = response.data.service_categories;
            $scope.services = response.data.services;
        }).catch(function (request, status, errorThrown) {

        });

    }

    $scope.service_list_for_coupon()


    $scope.showServiceModal = function () {

        $scope.data_inside_modal = {
            all_service_cat: $scope.service_categories,
            all_services: $scope.services,
            service_form_id: ($scope.service_ids_for_form == undefined) ? [] : $scope.service_ids_for_form,
            tax__id: ($scope.current_tax_id == undefined) ? 0 : $scope.current_tax_id.id
        }

        modalProvider
            .openPopupModal(
                APP.VIEW_PATH + 'coupons/showServicesModalContent.html',
                'showServiceModalController',
                '',
                $scope.data_inside_modal,
                {
                    'success': function (state, title, msg) {
                        $scope.clearAll(state, title, msg);
                    }
                },
                'select-treatment'
            )
    };


    var services_array = [];

    $scope.clearAll = function (state, title, msg) {
        var service_from_modal = msg
        if (services_array.length != 0) {
            var find_index = services_array.findIndex(function (single_service) {
                return service_from_modal.id == single_service.id
            });
            if (find_index == -1) {
                services_array.push(service_from_modal)
                service_ids.push(service_from_modal.id)
            }
        } else {
            services_array.push(service_from_modal)
            service_ids.push(service_from_modal.id)
            taxid.push(service_from_modal.service_tax)
            $scope.current_tax_id = taxid[0]
            $scope.service_below_form = true;
        }

        $scope.service_list_for_coupon()
        $scope.service_for_form = services_array;
        $scope.service_ids_for_form = service_ids;
        


    }

    $scope.removeServiceFrom_Form = function (serviceid) {

        if ($scope.coupon.services != undefined) {
          
            delete $scope.coupon.services[serviceid]
        }
        
        if (services_array.length != 0 && ($scope.service_for_form).length) {

            var find_index_of_id = service_ids.findIndex(function (single_service_id) {
                return serviceid == single_service_id
            });

            if (find_index_of_id != -1) {
                service_ids.splice(find_index_of_id, 1)

            }
            var find_index_for_remove = services_array.findIndex(function (single_service) {
                return serviceid == single_service.id
            });
            if (find_index_for_remove != -1) {
                services_array.splice(find_index_for_remove, 1)
            }
            if (services_array.length == 0) {
                $scope.service_below_form = false;
                taxid = []
                $scope.current_tax_id = {}
            }

            $scope.service_for_form = services_array
            $scope.service_ids_for_form = service_ids;
            $scope.service_list_for_coupon();

        }
    }



    $scope.saveCouponForm = function () {


        var php_api = ($scope.coupon.id != undefined && $scope.coupon.id != null) ? 'update_coupon': 'add_coupon';
        if($scope.coupon.services == undefined){
            notifications.Message('warning','Select Service','Choose at least one service !!');
            return false;
        }
        if ($scope.coupon.sale_price == undefined ) {
            $scope.sale_price_validation_message_display = true;
            $scope.sale_price_validation_message = "This field is required."

        } else {
            $scope.sale_price_validation_message_display = false;
            $scope.sale_price_validation_message = "";
        }

        if ($scope.coupon.validity == undefined || $scope.coupon.validity == null) {
            $scope.validity_validation_message_display = true;
            $scope.validity_validation_message = "This field is required.";
        } else if($scope.coupon.validity == 0) {
            $scope.validity_validation_message_display = true;
            $scope.validity_validation_message = "Validity 0 not allowed.";
        }else{
            $scope.validity_validation_message_display = false;
            $scope.validity_validation_message = "";
        }

        if ($('#id_couponForm').valid()) {
        if(!$scope.sale_price_validation_message_display && !$scope.validity_validation_message_display){
        $scope.coupon.tax_id = $scope.current_tax_id.id;


        console.log('$scope.coupon',$scope.coupon);








        if ($scope.entrance_date.date == null || $scope.entrance_date.date == '') {
            notifications.Message('error', 'Error', 'Choose entrance date !!');
            return false;
        }
       

        var coupon_card = { which_one: 'Membership', id: 0, is_check: true, appointment_id: 0, name: $scope.coupon.description, display_name : 'Membership',display_sale_price: parseFloat($scope.coupon.sale_price), calculation_sale_price: parseFloat($scope.coupon.sale_price), tax_id: 0, quantity: 1, discount_amount: 0, discount_percentage: 0, data_before_discount: {}, discount_apply: 0, single_row_total: $scope.coupon.sale_price, single_row_comment: '', worker_id: items.first_worker_id,coupon_start_date: moment($scope.entrance_date.date).format('YYYY-MM-DD'),coupon_end_date: moment($scope.end_date.date).format('YYYY-MM-DD'),new_coupon_data:$scope.coupon}

        
       // console.log('coupon_card',coupon_card);
        cb.success('coupon_card_certificate', 'coupon', coupon_card);
        $uibModalInstance.close();

        // $http.post(APP.API + php_api, $scope.coupon
        // ).then(function (response) {
        //     try {
        //         if (response.data.status == "401") {
        //             restSessionOut.getRstOut();
        //         }
        //     } catch (err) { }
        //     var return_responce = response.data;
        //     if (return_responce.success != false) {

        //         notifications.Message('success', 'Success', return_responce.message);
        //         $scope.dtInstanceInvoiceRequest.rerender();
        //         $scope.hideCouponForm();
        //     } else {
        //         notifications.Message('error', 'Error', 'Error from database');
        //     }
        // }).catch(function (request, status, errorThrown) {
        //     var responce_error = request.data;
        //     angular.forEach(responce_error.errors, function (error) {
               
        //         for (var i = 0; i < error.length; i++) {
        //             cb.success('error', 'Error', error[i]);
        //         }
        //     });
        // });

        }
        }

    }

    $scope.dateChanged = function () {
        var check1 = moment(moment($scope.entrance_date.date, 'DD-MM-YYYY').format('YYYY-MM-DD')).isBefore(moment(new Date(), 'DD-MM-YYYY').format('YYYY-MM-DD'));
        if(check1){
            notifications.Message('warning','Not allowed past date !!','Date should be after or equal to today.')
            $scope.entrance_date = { date: '' }
            $scope.end_date = '';
        }else{
            var end_date = moment($scope.entrance_date.date, 'DD-MM-YYYY').add('month', $scope.checked_coupon_data.validity);
            $scope.end_date = end_date._d;
        }
    }

    $scope.cancel = function () {
        $uibModalInstance.close();
    };






$scope.dateChanged = function () {
        var check1 = moment(moment($scope.entrance_date.date, 'DD-MM-YYYY').format('YYYY-MM-DD')).isBefore(moment(new Date(), 'DD-MM-YYYY').format('YYYY-MM-DD'));
        if(check1){
            notifications.Message('warning','Not allowed past date !!','Date should be after or equal to today.')
            $scope.entrance_date = { date: '' }
            $scope.end_date = '';
        }else{
            var end_date = moment($scope.entrance_date.date, 'DD-MM-YYYY').add('month', $scope.coupon.validity);
            $scope.end_date = end_date._d;
        }
    }
    $scope.start = $scope.minDate;
    $scope.end = $scope.maxDate;
    $scope.datepickerOptions = {
        showWeeks: false,
        startingDay: 1,
        datepickerMode: 'day'
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
        $scope.entrance_date = new Date(year, month, day);
    };
    $scope.toggleMin = function () {
        $scope.datepickerOptions.minDate = $scope.datepickerOptions.minDate ? null : new Date();
        $scope.dateDisabledOptions.minDate = $scope.dateDisabledOptions.minDate ? null : new Date();
    };
    $scope.maxDate = new Date(2020, 5, 22);
    $scope.minDate = new Date(1970, 12, 31);
    $scope.open = function () {
        $scope.opened = !$scope.opened;
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
        $scope.entrance_date = d;
    };
    $scope.clear = function () {
        $scope.entrance_date = null;
    };


}])


app.filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace !== -1) {
                //Also remove . and , so its gives a cleaner result.
                if (value.charAt(lastspace - 1) === '.' || value.charAt(lastspace - 1) === ',') {
                    lastspace = lastspace - 1;
                }
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
});
app.controller('replaceServiceModalCtrl', ["$scope", "$uibModalInstance", "$http", "items", "APP",  "cb", "restSessionOut", "notifications", function ($scope, $uibModalInstance, $http, items, APP, cb, restSessionOut, notifications) {

    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    $scope.services = items.services;
    $scope.single_data = items.single_data;
    $scope.index = items.index;
    $scope.display_cashdesk_data = items.display_cashdesk_data;
    $scope.appointment_id = $scope.display_cashdesk_data[$scope.index].appointment_id
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.replace = function () {
        $scope.select_services = [];
        $scope.select_services.push($scope.selectedService);
        if($scope.select_services.length > 0){
            console.log("$scope.display_cashdesk_data", $scope.display_cashdesk_data);
            const alreadyExists = $scope.display_cashdesk_data.some(el => el.id == $scope.selectedService);
            if(alreadyExists){
                notifications.Message('warning', 'Warning', 'Service already added please select another!');
                return false
            }
            angular.forEach($scope.select_services, function (id, key) {
                $scope.services.find(function (service) {
                    if (service.id == id) {
                        if(service.coupon != undefined){
                            if(service.coupon.cc_number != undefined){
                                 var total_no_of_serv = 0;
                                 angular.forEach(service.coupon.coupon_detail.services,function(service_no){
                                     total_no_of_serv += service_no.no_of_services;
                                 })
                                 $scope.total_no_of_services = total_no_of_serv;
                                 $scope.display_cashdesk_data[$scope.index] = {
                                     which_one: 'service',
                                     id: service.id,
                                     is_check: true,
                                     worker_id: $scope.first_worker_id,
                                     appointment_id:$scope.appointment_id,
                                     name: service.name,
                                     display_sale_price: service.sales_price,
                                     calculation_sale_price: parseFloat((service.coupon.coupon_detail.sale_price/$scope.total_no_of_services).toFixed(2)) ,
                                     tax_id: service.tax_id,
                                     quantity: 1,
                                     discount_amount: 0,
                                     discount_percentage: 0,
                                     data_before_discount: {},
                                     discount_apply: 3,
                                     single_row_total: parseFloat((service.coupon.coupon_detail.sale_price/$scope.total_no_of_services).toFixed(2)),
                                     single_row_comment: '',
                                     coupon: service.coupon,
                                     coupon_start_date: service.coupon.from_date,
                                     coupon_end_date: service.coupon.to_date,
                                     service_treatment_date: new Date(),
                                     prestatie_code: service.prestatie_code
                                 };
                             }else{
                                $scope.display_cashdesk_data[$scope.index] = { which_one: 'service', id: service.id, is_check: true, appointment_id:$scope.appointment_id, name: service.name, display_sale_price: service.sales_price, calculation_sale_price: service.sales_price, tax_id: service.tax_id, quantity: 1, discount_amount: 0, discount_percentage: 0, data_before_discount: {}, discount_apply: 0, single_row_total: service.sales_price, single_row_comment: '', worker_id: $scope.first_worker_id ,
                                service_treatment_date: new Date(),prestatie_code: service.prestatie_code};
                             }
                        }else{
                            $scope.display_cashdesk_data[$scope.index] = { which_one: 'service', id: service.id, is_check: true, appointment_id:$scope.appointment_id, name: service.name, display_sale_price: service.sales_price, calculation_sale_price: service.sales_price, tax_id: service.tax_id, quantity: 1, discount_amount: 0, discount_percentage: 0, data_before_discount: {}, discount_apply: 0, single_row_total: service.sales_price, single_row_comment: '', worker_id: $scope.first_worker_id ,service_treatment_date: new Date(),prestatie_code: service.prestatie_code};
                        }
                    }
                })
            });
        }else{
            notifications.Message('warning', 'Service not selected', 'Select at least one service !!');
        }


        var request_data = { 
            service_id: $scope.select_services[0],
            appointment_id: $scope.appointment_id,
        }
        $http.post(APP.API + 'update_service_from_topay', request_data
        ).then(function (response) {
            console.log("response", response);
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }

            notifications.Message('success', 'Success', 'Appointment updated successfully.')
            cb.success($scope.display_cashdesk_data.flat());
            $scope.select_services = [];
            $scope.cancel()
            
        }).catch(function (request, status, errorThrown) {

        });
    };
}])
