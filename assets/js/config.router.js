'use strict';

/**
 * Config for the router
 */
app.config(['$stateProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$ocLazyLoadProvider', 'JS_REQUIRES',
    function ($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider, jsRequires) {

        app.controller = $controllerProvider.register;
        app.directive = $compileProvider.directive;
        app.filter = $filterProvider.register;
        app.factory = $provide.factory;
        app.service = $provide.service;
        app.constant = $provide.constant;
        app.value = $provide.value;

        // LAZY MODULES

        $ocLazyLoadProvider.config({
            debug: false,
            events: true,
            modules: jsRequires.modules
        });

        // APPLICATION ROUTES
        // -----------------------------------
        // For any unmatched url, redirect to /app/dashboard
       // $urlRouterProvider.otherwise("/login/signin");
    //    $urlRouterProvider.otherwise("/login/signin");
       $urlRouterProvider.otherwise("/app/pages/management");
   
        //
        // Set up the states
        $stateProvider.state('app', {
            url: "/app",
            templateUrl: "assets/views/app.html",
            resolve: loadSequence('modernizr', 'moment', 'uiSwitch', 'perfect-scrollbar-plugin', 'toaster', 'ngAside', 'vAccordion', 'sweet-alert',  'oitozero.ngSweetAlert', 'truncate', 'htmlToPlaintext'),
            abstract: true
        }).state('app.pages', {
            url: '/pages',
            template: '<div ui-view class="fade-in-up"></div>',
            title: 'Pages',
            ncyBreadcrumb: {
                label: 'Pages'
            }
        })
        //.state('app.pages.calendar', {
        //    url: '/calendar',
        //    templateUrl: "assets/views/calendar/calendar.html",
        //    ncyBreadcrumb: {
        //        label: 'calendar'
        //    },
        //    resolve: loadSequence('ui.select','blockCalendar__min_css','blockCalendar_scheduler_css','blockCalendar_moment_js','blockCalendar_fullcalendar_min_js','blockCalendar_scheduler_min_js', 'fullcalendarCtrl','spectrum-plugin', 'angularSpectrumColorpicker','appointmentAddCtrl','appointmentSettingCtrl','appointmentColorStatusCtrl','updateCustomerCtrl','selectjs', 'angularFileUpload', 'uploadCtrl', 'csvFile', 'fileReaderDirective','ckeditor')
        //})
        .state('app.pages.products', {
            url: '/products',
            templateUrl: "assets/views/products/products_list.html",
            ncyBreadcrumb: {
                label: 'Products'
            },
            resolve: loadSequence('ngTagInput', 'productCtrl', 'selectjs', 'angularFileUpload', 'uploadCtrl', 'csvFile', 'fileReaderDirective')
        }).state('app.pages.customers', {
            url: '/customers',
            templateUrl: "assets/views/customers/customers_list.html",
            ncyBreadcrumb: {
                label: 'Customers'
            },
            resolve: loadSequence('customerCtrl', 'updateCustomerCtrl', 'selectjs', 'angularFileUpload', 'uploadCtrl', 'csvFile', 'fileReaderDirective','ckeditor')
        }).state('app.pages.customers_archive', {
            url: '/customers_archive',
            templateUrl: "assets/views/customers/customers_archive_list.html",
            ncyBreadcrumb: {
                label: 'Customers Archive'
            },
            resolve: loadSequence('customerArchiveCtrl', 'updateCustomerCtrl', 'selectjs', 'angularFileUpload', 'uploadCtrl', 'csvFile', 'fileReaderDirective')
        }).state('app.pages.product_categories', {
            url: '/product_categories',
            templateUrl: "assets/views/products/product_categories_list.html",
            ncyBreadcrumb: {
                label: 'Product Categories'
            },
            resolve: loadSequence('productCtrl')
        }).state('app.pages.services_categories', {
            url: '/services_categories',
            templateUrl: "assets/views/services_categories/services_categories_list.html",
            ncyBreadcrumb: {
                label: 'Categories'
            },
            resolve: loadSequence('servicesCategoriesCtrl', 'selectjs', 'spectrum-plugin', 'angularSpectrumColorpicker')
        }).state('app.pages.coupons', {
            url: '/coupons',
            templateUrl: "assets/views/coupons/coupons_list.html",
            ncyBreadcrumb: {
                label: 'Coupons'
            },
            resolve: loadSequence('couponCtrl','showServiceModalController')
        }).state('app.pages.used_coupons', {
            url: '/used_coupons',
            templateUrl: "assets/views/coupons/coupons_used_list.html",
            ncyBreadcrumb: {
                label: 'Coupons Used'
            },
            resolve: loadSequence('couponUsedCtrl')
        }).state('app.pages.product_supplier', {
            url: '/product_supplier',
            templateUrl: "assets/views/products/product_companies_list.html",
            ncyBreadcrumb: {
                label: 'Product Supplier'
            },
            resolve: loadSequence('productCtrl')
        }).state('app.pages.cashdesk', {
            url: '/cashdesk',
            templateUrl: "assets/views/cashdesk/cashdesk.html",
            ncyBreadcrumb: {
                label: 'Cash Desk'
            },

            resolve: loadSequence('ui.select', 'selectCtrl', 'cashdeskCtrl','showServiceModalController')
        }).state('app.pages.cashdesk_main', {
            url: '/cashdesk_main',
            templateUrl: "assets/views/cashdesk/cashdesk_main.html",
            ncyBreadcrumb: {
                label: 'Cash Desk'
            },
            resolve: loadSequence('ui.select', 'selectCtrl', 'cashdeskMainCtrl')
        }).state('app.pages.cash_in_out', {
            url: '/cash_in_out',
            templateUrl: "assets/views/cashdesk/cash_in_out.html",
            ncyBreadcrumb: {
                label: 'Cash In Out'
            },
            resolve: loadSequence('ui.select', 'selectCtrl', 'cashInOutCtrl')
        }).state('app.pages.bank_transfer_invoice', {
            url: '/bank_transfer_invoice',
            templateUrl: "assets/views/cashdesk/bank_transfer_invoice.html",
            ncyBreadcrumb: {
                label: 'Bank Transfer'
            },
            resolve: loadSequence('ui.select', 'selectCtrl', 'bankTransferCtrl')
        }).state('app.pages.invoice/:id/:data_id', {
            url: '/invoice/:id/:data_id',
            templateUrl: "assets/views/cashdesk/invoice.html",
            ncyBreadcrumb: {
                label: 'Invoice'
            },
            resolve: loadSequence('ui.select', 'selectCtrl', 'invoiceCtrl')
        }).state('app.pages.cashdesk-settings', {
            url: '/cashdesk/settings',
            templateUrl: "assets/views/cashdesk/pages_cashdesk_settings.html",
            ncyBreadcrumb: {
                label: 'Cashdesk-Setting'
            },

            resolve: loadSequence('cashdeskSettingCtrl', 'ui.select', 'selectCtrl', 'editCompanyCtrl', 'ckeditor')

        }).state('app.pages.management', {
            url: '/management',
            templateUrl: "assets/views/management_list.html",
            ncyBreadcrumb: {
                label: 'Management'
            },
            resolve: loadSequence('managementCtrl')
        }).state('app.pages.smpt_details', {
            url: '/smpt_details',
            templateUrl: "assets/views/smpt_details.html",
            ncyBreadcrumb: {
                label: 'SMS'
            },
            resolve: loadSequence('smpt_detailsCtrl')
        }).state('app.pages.sync_request', {
            url: '/sync_request',
            templateUrl: "assets/views/sync_request.html",
            ncyBreadcrumb: {
                label: 'SMS'
            },
            resolve: loadSequence('ngTagInput','sync_requestCtrl')
        }).state('app.pages.company_setting', {
            url: '/company_setting',
            templateUrl: "assets/views/company_setting.html",
            ncyBreadcrumb: {
                label: 'SMS'
            },
            resolve: loadSequence('angularFileUpload','uploadCtrl','company_settingCtrl')
        }).state('app.pages.email_template', {
            url: '/email_template',
            templateUrl: "assets/views/template/email_template.html",
            ncyBreadcrumb: {
                label: 'SMS'
            },
            resolve: loadSequence('email_templateCtrl')
        }).state('app.pages.add_email_template', {
            url: '/add_email_template',
            templateUrl: "assets/views/template/add_email_template.html",
            ncyBreadcrumb: {
                label: 'SMS'
            },
            resolve: loadSequence('email_templateCtrl', 'ckeditor')
        }).state('app.pages.edit_email_template/:id', {
            url: '/edit_email_template/:id',
            templateUrl: "assets/views/template/add_email_template.html",
            ncyBreadcrumb: {
                label: 'SMS'
            },
            resolve: loadSequence('email_templateCtrl', 'ckeditor')
        }).state('app.pages.sms_template', {
            url: '/sms_template',
            templateUrl: "assets/views/template/sms_template.html",
            ncyBreadcrumb: {
                label: 'SMS'
            },
            resolve: loadSequence('sms_templateCtrl')
        }).state('app.pages.add_sms_template', {
            url: '/add_sms_template',
            templateUrl: "assets/views/template/add_sms_template.html",
            ncyBreadcrumb: {
                label: 'SMS'
            },
            resolve: loadSequence('sms_templateCtrl', 'ckeditor')
        }).state('app.pages.edit_sms_template/:id', {
            url: '/edit_sms_template/:id',
            templateUrl: "assets/views/template/add_sms_template.html",
            ncyBreadcrumb: {
                label: 'SMS'
            },
            resolve: loadSequence('sms_templateCtrl', 'ckeditor')
        }).state('app.pages.form_list', {
            url: '/form_list',
            templateUrl: "assets/views/form_builder/form_list.html",
            ncyBreadcrumb: {
                label: 'Form'
            },
            resolve: loadSequence('form_builderCtrl','ckeditor')
        }).state('app.pages.form_builder', {
            url: '/form_builder',
            templateUrl: "assets/views/form_builder/form_builder.html",
            ncyBreadcrumb: {
                label: 'Form'
            },
            resolve: loadSequence('form_builderCtrl','ckeditor')
        }).state('app.pages.form_builder/:id', {
            url: '/form_builder/:id',
            templateUrl: "assets/views/form_builder/form_builder.html",
            ncyBreadcrumb: {
                label: 'SMS'
            },
            resolve: loadSequence('form_builderCtrl')
        })
        .state('app.pages.workers', {
            url: '/management/workers',
            templateUrl: "assets/views/pages_workers.html",
            ncyBreadcrumb: {
                label: 'Workers'
            },
            resolve: loadSequence('workersCtrl', 'vAccordionCtrl', 'selectjs')
        }).state('app.pages.worker_detail/:id', {
            url: '/management/worker_detail/:id',
            templateUrl: "assets/views/pages_workers_detail_view.html",
            ncyBreadcrumb: {
                label: 'Workers'
            },
            resolve: loadSequence('ui.select',  'selectjs', 'workersDetailviewCtrl', 'selectCtrl')
        }).state('app.pages.service_provider', {
            url: '/management/service_provider',
            templateUrl: "assets/views/pages_service_provider.html",
            ncyBreadcrumb: {
                label: 'Service Provider'
            },
            resolve: loadSequence('serviceProviderCtrl')

        }).state('app.pages.services', {
            url: '/services',
            templateUrl: "assets/views/services/services_list.html",
            ncyBreadcrumb: {
                label: 'Services'
            },
            resolve: loadSequence('ui.select', 'selectjs', 'servicesCtrl', 'selectCtrl', 'csvFile','fileReaderDirective')

        }).state('app.pages.report', {
            url: '/report',
            templateUrl: "assets/views/report/report.html",
            ncyBreadcrumb: {
                label: 'Report'
            },

            resolve: loadSequence('ui.select', 'selectCtrl', 'reportCtrl')
        }).state('app.pages.invoice_report', {
            url: '/invoice_report',
            templateUrl: "assets/views/report/invoice-report.html",
            ncyBreadcrumb: {
                label: 'Report'
            },

            resolve: loadSequence('ui.select', 'selectCtrl', 'reportCtrl')
        }).state('app.pages.total_report', {
            url: '/total_report',
            templateUrl: "assets/views/report/total-report.html",
            ncyBreadcrumb: {
                label: 'Report'
            },

            resolve: loadSequence('ui.select', 'selectCtrl', 'reportCtrl')
        }).state('app.pages.sales_report', {
            url: '/sales_report',
            templateUrl: "assets/views/report/sales-report.html",
            ncyBreadcrumb: {
                label: 'Report'
            },
            resolve: loadSequence('ui.select', 'selectCtrl', 'reportCtrl')
        }).state('error', {
            url: '/error',
            template: '<div ui-view class="fade-in-up"></div>'
        }).state('error.404', {
            url: '/404',
            templateUrl: "assets/views/utility_404.html",
        }).state('app.pages.permission', {
            url: '/permission',
            templateUrl: "assets/views/permission.html",
        })
            .state('error.500', {
                url: '/500',
                templateUrl: "assets/views/utility_500.html",
            })

            // Login routes

            .state('login', {
                url: '/login',
                template: '<div ui-view class="fade-in-right-big smooth"></div>',
                abstract: true
            }).state('login.signin', {
                url: '/signin',
                templateUrl: "assets/views/login_login.html",
                resolve: loadSequence('loginCtrl', 'toaster')
            }).state('login.active', {
                url: '/active/:id',
                
                templateUrl: "assets/views/login_active.html", 
                resolve: loadSequence('activeCtrl', 'selectjs','toaster')
            
            }).state('login.reportform', {
                url: '/reportform/:company_id/:form_id/:customer_id/:app_id',
                templateUrl: "assets/views/form_builder/fillupreportform.html", 
                resolve: loadSequence('reportformCtrl', 'selectjs','toaster','signaturePad')
            
            }).state('login.allow', {
                url: '/allow/:type/:fromId/:toId',
                
                templateUrl: "assets/views/sync_allow.html", 
                resolve: loadSequence('allowCtrl', 'selectjs')
            
            }).state('login.forgot', {
                url: '/forgot',
                templateUrl: "assets/views/login_forgot.html",
                resolve: loadSequence('forgotCtrl', 'toaster')
            }).state('login.resetpassword', {
                url: '/resetpassword/:id/:uid',
                
                templateUrl: "assets/views/resetpassword.html", 
                resolve: loadSequence('resetpasswordCtrl','toaster')
            
            }).state('login.registration', {
                url: '/registration',
                templateUrl: "assets/views/login_registration.html",
                resolve: loadSequence('regCtrl', 'toaster')
               
            }).state('login.lockscreen', {
                url: '/lock',
                templateUrl: "assets/views/login_lock_screen.html"
            });

        // Generates a resolve object previously configured in constant.JS_REQUIRES (config.constant.js)
        function loadSequence() {
            var _args = arguments;
            return {
                deps: ['$ocLazyLoad', '$q',
                    function ($ocLL, $q) {
                        var promise = $q.when(1);
                        for (var i = 0, len = _args.length; i < len; i++) {
                            promise = promiseThen(_args[i]);
                        }
                        return promise;

                        function promiseThen(_arg) {
                            if (typeof _arg == 'function')
                                return promise.then(_arg);
                            else
                                return promise.then(function () {
                                    var nowLoad = requiredData(_arg);
                                    if (!nowLoad)
                                        return $.error('Route resolve: Bad resource name [' + _arg + ']');
                                    return $ocLL.load(nowLoad);
                                });
                        }

                        function requiredData(name) {
                            if (jsRequires.modules)
                                for (var m in jsRequires.modules)
                                    if (jsRequires.modules[m].name && jsRequires.modules[m].name === name)
                                        return jsRequires.modules[m];
                            return jsRequires.scripts && jsRequires.scripts[name];
                        }
                    }]
            };
        }
    }]);


    app.run(function($rootScope, $timeout, $document, $cookies, $interval, $state, $location,$http,APP) {   
     
        $rootScope.$on('$viewContentLoaded', function() {
            if($cookies.get('userdata') !== undefined) {
                                
                let location = $location.path().split('/')
                //call it here
                let params = $location.absUrl().split('?') 
                //$state.go('app.pages.management', null, {'reload':true});
                if(params[1]) {
                    var auth_token = localStorage.getItem('auth_token');
                    $http.defaults.headers.common.authtoken = auth_token;
                    $http({
                        url:APP.API + 'googlelogin/google/callback?'+params[1],
                        method: "get",
                        data: [],
                        headers: {
                            'Content-type': 'application/json',
                        }
                    }).then(function (response) {
                        var msgArr = {'error':response.data.error,'message':response.data.message}
                        localStorage.setItem('google_sync_msg', JSON.stringify(msgArr));
                        window.location.href= '';
                    //toaster.pop('success', 'Success',response.data.message);
                    });
                }
                let match_path = "#!/app/pages"
                let userdata = JSON.parse($cookies.get('userdata'))
                
                let user_menu = userdata.menu;
                let current_path = $location.path();
                let worker_menu = ['#!/app/pages/cashdesk','#!/app/pages/invoice/:id/:data_id']
                let reception_menu = ['#!/app/pages/cashdesk','#!/app/pages/invoice/:id/:data_id','#!/app/pages/calendar']
                let accountant_menu = ['#!/app/pages/cashdesk','#!/app/pages/cash_in_out','#!/app/pages/cashdesk/settings','#!/app/pages/bank_transfer_invoice','#!/app/pages/company_setting','#!/app/pages/invoice/:id/:data_id']
                let menus = ['#!/app/pages/invoice/','#!/login/reportform/']
                if ($cookies.get('userdata') !== undefined){
                    if(location) {
                        let path = ''
                        if(location[4]) {
                            path = '/'+location[3]+'/'+location[4]
                        } else {
                            path = '/'+location[3]
                        }
                       
                        let index = user_menu.findIndex( menu => menu.menu_url === match_path.concat(path));
                        //console.log("index", index)
                        if(user_menu[index]) {
                            //console.log("user_menu[index]", user_menu[index])
                            if(user_menu[index].permit_user === false) {
                                $timeout(function() {
                                    $state.go('app.pages.calendar', null, {'reload':true});
                                });
                            }
                        } else {
                            if(userdata.role_id === 4) {

                                if(location[3] === 'invoice') {
                                
                                } else if(location[2] === 'reportform') {
                                    
                                } else if(reception_menu.indexOf(match_path.concat(path)) === -1) {
                                    
                                    $timeout(function() {
                                        $state.go('app.pages.calendar', null, {'reload':true});
                                    });
                                }
                            }
                            if(userdata.role_id === 2) {
                                 
                                if(location[3] === 'invoice') {
                                  
                                } else if(location[2] === 'reportform') {
                                    
                                } else if(worker_menu.indexOf(match_path.concat(path)) === -1) {
                                    $timeout(function() {
                                        $state.go('app.pages.calendar', null, {'reload':true});
                                    });
                                }
                            }
                            if(userdata.role_id === 3) {
                                
                                if(location[3] === 'invoice') {
                                  
                                } else if(accountant_menu.indexOf(match_path.concat(path)) === -1) {
                                    $timeout(function() {
                                        $state.go('app.pages.calendar', null, {'reload':true});
                                    });
                                }
                            }
                        }
                    }
                
                }
            }
        });
        //console.log("TCL: $cookies.get('userdata')", $cookies.get('userdata'))
        /* if ($cookies.get('userdata') !== undefined){
            let match_path = "#!/app/pages"
            let userdata = JSON.parse($cookies.get('userdata'))
            let user_menu = userdata.menu;
            let current_path = $location.path();
            // console.log("TCL: current_path", current_path)
            $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) { 
                
                let path = toState.url
                let index = user_menu.findIndex( menu => menu.menu_url === match_path.concat(path));
                
                // console.log("TCL: user_menu[index]", user_menu[index])
                if(user_menu[index]) {
                    if(user_menu[index].permit_user === false) {
                        $timeout(function() {
                            $state.go('app.pages.calendar', null, {'reload':true});
                        });
                    }
                }
            });
        } */
        /* // $timeout(function() {
        //     $state.go('app.pages.calendar', null, {'reload':true});
        //   });
       
        //$timeout(function() { console.log("here hello"); $state.go('app.pages.calendar') });
        let index = user_menu.findIndex( menu => menu.menu_url === match_path.concat(current_path));
        //$state.go("app.pages.calendar", {}, { reload: 'app.pages.calendar' })
        if(user_menu[index].permit_user === false) {
            
            // $state.transitionTo('app.pages.calendar', {
            //     param: 'some parameter'
            // }, {
            //     reload : true
            // });
            //console.log("TCL: $state.go('app.pages.calendar');", $state.go('app.pages.calendar'))
        }
        $state.go('app.pages.agenda'); */
        $interval(function () {
            if ($cookies.get('userdata') !== undefined){
                //$rootScope.userdata = JSON.parse($cookies.get('userdata'));
                
                // Timeout timer value
                 var TimeOutTimerValue = 60*60*1000;
    
                // Start a timeout
                var TimeOut_Thread = $timeout(function(){ LogoutByTimer() } , TimeOutTimerValue);
                var bodyElement = angular.element($document);
                
                angular.forEach(['keydown', 'keyup', 'click', 'mousemove', 'DOMMouseScroll', 'mousewheel', 'mousedown', 'touchstart', 'touchmove', 'scroll', 'focus'], 
                function(EventName) {
                     bodyElement.bind(EventName, function (e) { TimeOut_Resetter(e) });  
                });
    
                function LogoutByTimer(){
                   
                    localStorage.clear();
                    $cookies.remove("userdata");
                    $state.go('login.signin');
                    ///////////////////////////////////////////////////
                    /// redirect to another page(eg. Login.html) here
                    ///////////////////////////////////////////////////
                }
    
                function TimeOut_Resetter(e){
                    /// Stop the pending timeout
                    $timeout.cancel(TimeOut_Thread);
    
                    /// Reset the timeout
                    TimeOut_Thread = $timeout(function(){ LogoutByTimer() } , TimeOutTimerValue);
                }               
                // console.log("TCL: current_path", current_path)
            }

            $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) { 
                if ($cookies.get('userdata') !== undefined){
                    let match_path = "#!/app/pages"
                    let userdata = JSON.parse($cookies.get('userdata'))
                    let user_menu = userdata.menu;
                    let current_path = $location.path();    
                    let path = toState.url
                    let index = user_menu.findIndex( menu => menu.menu_url === match_path.concat(path));
                    
                    let worker_menu = ['#!/app/pages/cashdesk']
                    let reception_menu = ['#!/app/pages/cashdesk']
                    let accountant_menu = ['#!/app/pages/cashdesk','#!/app/pages/cash_in_out','#!/app/pages/cashdesk/settings','#!/app/pages/bank_transfer_invoice','#!/app/pages/company_setting']
                    let menus = ['app.pages.invoice/:id/:data_id','']
                    //console.log("index", index)
                    // console.log("TCL: user_menu[index]", user_menu[index])
                /*  if(userdata.role_id === 2) {
                        
                    } else {
                        $timeout(function() {
                            $state.go('app.pages.calendar', null, {'reload':true});
                        });
                    } */
                    //console.log("user_menu[index]", user_menu[index])
                    if(user_menu[index]) {
                    //console.log("user_menu[index]", user_menu[index])
                        if(user_menu[index].permit_user === false) {
                            $timeout(function() {
                                $state.go('app.pages.calendar', null, {'reload':true});
                            });
                        }
                    } else {
                        if(userdata.role_id === 4) {

                            if(toState.name === 'app.pages.invoice/:id/:data_id') {
                                

                            } else if(toState.name === 'app.pages.invoice/:id/:data_id')  {
                                
                            } else if(reception_menu.indexOf(match_path.concat(path)) === -1) {
                               
                               $timeout(function() {
                                    $state.go('app.pages.calendar', null, {'reload':true});
                                });
                            }
                        }
                        if(userdata.role_id === 2) {
                            if(toState.name === 'app.pages.invoice/:id/:data_id') {
                                
                            } else if(toState.name === 'app.pages.invoice/:id/:data_id')  {

                            } else if(worker_menu.indexOf(match_path.concat(path)) === -1) {
                                $timeout(function() {
                                    $state.go('app.pages.calendar', null, {'reload':true});
                                });
                            }
                        }
                        if(userdata.role_id === 3) {
                            
                            if(toState.name === 'app.pages.invoice/:id/:data_id') {
                                

                            } else if(accountant_menu.indexOf(match_path.concat(path)) === -1) {
                                $timeout(function() {
                                    $state.go('app.pages.calendar', null, {'reload':true});
                                });
                            }
                        }
                    }
                }
            });
            
        }, 1000);
    
    
          var login_time = sessionStorage.getItem('login_time');
          var sessionStorage_transfer = function(event) {
          if(!event) { event = window.event; } // ie suq
          if(!event.newValue) return;          // do nothing if no value to work with
          if (event.key == 'getSessionStorage') {
            // another tab asked for the sessionStorage -> send it
            localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
            // the other tab should now have it, so we're done with it.
            localStorage.removeItem('sessionStorage'); // <- could do short timeout as well.
          } else if (event.key == 'sessionStorage' && !sessionStorage.length) {
            // another tab sent data <- get it
            console.log('event.keyelse',event)
            var data = JSON.parse(event.newValue);
            for (var key in data) {
              sessionStorage.setItem(key, data[key]);
            }
          }
        };
        // listen for changes to localStorage
        if(window.addEventListener) {
          window.addEventListener("storage", sessionStorage_transfer, false);
        } else {
          window.attachEvent("onstorage", sessionStorage_transfer);
        };
        
        // Ask other tabs for session storage (this is ONLY to trigger event)
        if (!sessionStorage.length) {
          localStorage.setItem('getSessionStorage', login_time);
          localStorage.removeItem('getSessionStorage', login_time);
        };
        
        

    })
// app.run(function($transitions,$state,$rootScope) {

//   $transitions.onStart({}, function(trans) {
//       console.log(trans);
//       console.log($rootScope.userdata);


//      var index = $rootScope.userdata.menu.findIndex(function(single_menu){

//        return single_menu.redirect_url == trans.to().name;
//       })

//       console.log('index',index);

//     if(trans.to().name == "app.pages.report"){
//         $state.go('app.pages.calendar');
//     }
//   });
// })
