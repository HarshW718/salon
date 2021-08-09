'use strict';

/**
 * Config constant
 */
 
app.constant('APP_MEDIAQUERY', {
    'desktopXL': 1200,
    'desktop': 992,
    'tablet': 768,
    'mobile': 480
});
app.constant('JS_REQUIRES', {
    //*** Scripts
    scripts: {
        //*** Javascript Plugins
        'modernizr': ['bower_components/modernizr/modernizr.js?v=30_11_2019_1'],
        'mobiscrollTime': ['assets/js/mobiscroll.angularjs.min.js?v=30_11_2019_1','assets/css/ timepicker/mobiscroll.angularjs.min.css'],
        'moment': ['bower_components/moment/min/moment.min.js?v=30_11_2019_1'],
        'spin': 'bower_components/spin.js?v=30_11_2019_1/spin.js?v=30_11_2019_1',

        //*** jQuery Plugins
        'perfect-scrollbar-plugin': ['bower_components/perfect-scrollbar/js/min/perfect-scrollbar.jquery.min.js?v=30_11_2019_1', 'bower_components/perfect-scrollbar/css/perfect-scrollbar.min.css'],
        'ladda': ['bower_components/ladda/dist/ladda.min.js?v=30_11_2019_1', 'bower_components/ladda/dist/ladda-themeless.min.css'],
        'sweet-alert': ['bower_components/sweetalert/dist/sweetalert.min.js?v=30_11_2019_1', 'bower_components/sweetalert/dist/sweetalert.css'],
        //'chartjs': 'bower_components/chart.js/dist/Chart.min.js?v=30_11_2019_1',
       // 'jquery-sparkline': 'bower_components/jquery.sparkline.build/dist/jquery.sparkline.min.js?v=30_11_2019_1',
        'ckeditor-plugin': 'bower_components/ckeditor/ckeditor.js?v=30_11_2019_1',
        'jquery-nestable-plugin': ['bower_components/jquery-nestable/jquery.nestable.js?v=30_11_2019_1'],
        'touchspin-plugin': ['bower_components/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.js?v=30_11_2019_1', 'bower_components/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.css'],
		'spectrum-plugin': ['bower_components/spectrum/spectrum.js?v=30_11_2019_1', 'bower_components/spectrum/spectrum.css'],
		
        'fullcalendarCtrl': 'assets/js/controllers/fullcalendarCtrl.js?v=30_11_2019_1',
        'customerCtrl': 'assets/js/controllers/customerCtrl.js?v=30_11_2019_1',
        'productsCategoriesCtrl':'assets/js/controllers/productsCategoriesCtrl.js?v=30_11_2019_1',
        'productCtrl': 'assets/js/controllers/productCtrl.js?v=30_11_2019_1',
        'customerCtrl': 'assets/js/controllers/customerCtrl.js?v=30_11_2019_1',
        'customerArchiveCtrl':'assets/js/controllers/customerArchiveCtrl.js?v=30_11_2019_1',
        'updateCustomerCtrl':'assets/js/controllers/updateCustomerCtrl.js?v=30_11_2019_1',
        'companyCtrl': 'assets/js/controllers/companyCtrl.js?v=30_11_2019_1',
        'cashdeskCtrl': 'assets/js/controllers/cashdeskCtrl.js?v=30_11_2019_1',
        'cashdeskMainCtrl': 'assets/js/controllers/cashdeskMainCtrl.js?v=30_11_2019_1',
        'cashInOutCtrl': 'assets/js/controllers/cashInOutCtrl.js?v=30_11_2019_1',
        'bankTransferCtrl': 'assets/js/controllers/bankTransferCtrl.js?v=30_11_2019_1',
        'cashdeskSettingCtrl': 'assets/js/controllers/cashdeskSettingCtrl.js?v=30_11_2019_1',
        'invoiceCtrl': 'assets/js/controllers/invoiceCtrl.js?v=30_11_2019_1',
        'selectCtrl': 'assets/js/controllers/selectCtrl.js?v=30_11_2019_1',
        'uploadCtrl': 'assets/js/controllers/uploadCtrl.js?v=30_11_2019_1',
        'servicesCategoriesCtrl':'assets/js/controllers/servicesCategoriesCtrl.js?v=30_11_2019_1',
        'servicesCtrl':'assets/js/controllers/servicesCtrl.js?v=30_11_2019_1',
        'giftCtrl':'assets/js/controllers/giftCtrl.js?v=30_11_2019_1',
        'giftUseCtrl':'assets/js/controllers/giftUseCtrl.js?v=30_11_2019_1',
        'couponCtrl':'assets/js/controllers/couponCtrl.js?v=30_11_2019_1',
        'couponUsedCtrl':'assets/js/controllers/couponUsedCtrl.js?v=30_11_2019_1',
        'managementCtrl':'assets/js/controllers/managementCtrl.js?v=30_11_2019_1',
        'vAccordionCtrl': 'assets/js/controllers/vAccordionCtrl.js?v=30_11_2019_1',
        'workersCtrl':'assets/js/controllers/workersCtrl.js?v=30_11_2019_1',
        'serviceProviderCtrl':'assets/js/controllers/serviceProviderCtrl.js?v=30_11_2019_1',
        'workersDetailviewCtrl':'assets/js/controllers/workersDetailviewCtrl.js?v=30_11_2019_1',
        'csvFile':'assets/js/ng-csv/ng-csv.min.js?v=30_11_2019_1',
        'selectjs':'assets/js/directives/select.js?v=30_11_2019_1',
        'fileReaderDirective':'assets/js/directives/file-reader.js?v=30_11_2019_1',
        'appointmentAddCtrl':'assets/js/controllers/appointmentAddCtrl.js?v=30_11_2019_1',
        'appointmentSettingCtrl':'assets/js/controllers/appointmentSettingCtrl.js?v=30_11_2019_1', 
        'appointmentColorStatusCtrl':'assets/js/controllers/appointmentColorStatusCtrl.js?v=30_11_2019_1', 
        'smpt_detailsCtrl':'assets/js/controllers/smpt_detailsCtrl.js?v=30_11_2019_1',
        'sync_requestCtrl':'assets/js/controllers/sync_requestCtrl.js?v=30_11_2019_1',
        'company_settingCtrl':'assets/js/controllers/company_settingCtrl.js?v=30_11_2019_1',
        'email_templateCtrl':'assets/js/controllers/email_templateCtrl.js?v=30_11_2019_1',
        'form_builderCtrl':'assets/js/controllers/form_builderCtrl.js?v=30_11_2019_1',
        'sms_templateCtrl':'assets/js/controllers/sms_templateCtrl.js?v=30_11_2019_1',
        'editCompanyCtrl':'assets/js/controllers/editCompanyCtrl.js?v=30_11_2019_1',
        'reportCtrl': 'assets/js/controllers/reportCtrl.js?v=30_11_2019_1',
        'showServiceModalController': 'assets/js/controllers/showServiceModalController.js?v=30_11_2019_1',
        
        //*** Filters
        'htmlToPlaintext': 'assets/js/filters/htmlToPlaintext.js?v=30_11_2019_1',
        
        'ckeditorCtrl': 'assets/js/controllers/ckeditorCtrl.js?v=30_11_2019_1',
        'activeCtrl': 'assets/js/controllers/activeCtrl.js?v=30_11_2019_1',
        'reportformCtrl': 'assets/js/controllers/reportformCtrl.js?v=30_11_2019_1',
        'allowCtrl': 'assets/js/controllers/allowCtrl.js?v=30_11_2019_1',
        'resetpasswordCtrl': 'assets/js/controllers/resetpasswordCtrl.js?v=30_11_2019_1',
        
        'loginCtrl': 'assets/js/controllers/loginCtrl.js?v=30_11_2019_1',
        'regCtrl': 'assets/js/controllers/regCtrl.js?v=30_11_2019_1',
        'forgotCtrl': 'assets/js/controllers/forgotCtrl.js?v=30_11_2019_1',
        'signaturePad':'assets/js/directives/signature-pad.js?v=30_11_2019_1',
    },
    //*** angularJS Modules
    modules: [{
        name: 'toaster',
        files: ['bower_components/AngularJS-Toaster/toaster.js?v=30_11_2019_1', 'bower_components/AngularJS-Toaster/toaster.css']
    },{
        name: 'angular-ladda',
        files: ['bower_components/angular-ladda/dist/angular-ladda.min.js?v=30_11_2019_1']
    },{
        name: 'ui.select',
        files: ['bower_components/angular-ui-select/dist/select.min.js?v=30_11_2019_1', 'bower_components/angular-ui-select/dist/select.min.css', 'bower_components/select2/dist/css/select2.min.css', 'bower_components/select2-bootstrap-css/select2-bootstrap.min.css', 'bower_components/selectize/dist/css/selectize.bootstrap3.css']
    }, {
        name: 'ui.mask',
        files: ['bower_components/angular-ui-mask/dist/mask.min.js?v=30_11_2019_1']
    }, {
        name: 'angularFileUpload',
        files: ['bower_components/angular-file-upload/dist/angular-file-upload.min.js?v=30_11_2019_1']
    },{
        name: 'ngTagInput',
        files: ['assets/css/ng-tag-inputs/ng-tags-input.min.css','assets/js/ng-tag-inputs/ng-tags-input.min.js?v=30_11_2019_1']
    }, {
        name: 'ngAside',
        files: ['bower_components/angular-aside/dist/js/angular-aside.min.js?v=30_11_2019_1', 'bower_components/angular-aside/dist/css/angular-aside.min.css']
    }, {
        name: 'truncate',
        files: ['bower_components/angular-truncate/src/truncate.js?v=30_11_2019_1']
    }, {
        name: 'oitozero.ngSweetAlert',
        files: ['bower_components/ngSweetAlert/SweetAlert.min.js?v=30_11_2019_1']
    }, {
        name: 'monospaced.elastic',
        files: ['bower_components/angular-elastic/elastic.js?v=30_11_2019_1']
    }, {
        name: 'flow',
        files: ['bower_components/ng-flow/dist/ng-flow-standalone.min.js?v=30_11_2019_1']
    }, {
        name: 'uiSwitch',
        files: ['bower_components/angular-ui-switch/angular-ui-switch.min.js?v=30_11_2019_1', 'bower_components/angular-ui-switch/angular-ui-switch.min.css']
    }, {
        name: 'ckeditor',
        files: ['bower_components/angular-ckeditor/angular-ckeditor.min.js?v=30_11_2019_1']
    }, {
        name: 'mwl.calendar',
        files: ['bower_components/angular-bootstrap-calendar/dist/js/angular-bootstrap-calendar-tpls.js?v=30_11_2019_1', 'bower_components/angular-bootstrap-calendar/dist/css/angular-bootstrap-calendar.min.css', 'assets/js/config/config-calendar.js?v=30_11_2019_1']
    },
    {
        name: 'jquerycalendar',
        files: ['plugins/fullcalendar/fullcalendar.css', 'plugins/jquery-ui/jquery-ui.min.js?v=30_11_2019_1','plugins/moment/moment.min.js?v=30_11_2019_1', 'plugins/moment/locales.js?v=30_11_2019_1','plugins/fullcalendar/fullcalendar.js?v=30_11_2019_1']
    },
    {
        name: 'blockCalendar__min_css',
        files: ['plugins/fullcalendar_new/3.3.0/fullcalendar.min.css',]
    },
    {
        name: 'blockCalendar_scheduler_css',
        files: ['plugins/fullcalendar_new/fullcalendar-scheduler/1.9.4/scheduler.min.css']
    },
    {
        name: 'blockCalendar_moment_js',
        files: ['plugins/fullcalendar_new/3.10.0/lib/moment.min.js?v=30_11_2019_1']
    },
    {
        name: 'blockCalendar_jquery_min_js',
        files: ['plugins/fullcalendar_new/3.10.0/lib/jquery.min.js?v=30_11_2019_1']

    },
    {
        name: 'blockCalendar_fullcalendar_min_js',
        files: ['plugins/fullcalendar_new/3.10.0/fullcalendar.min.js?v=30_11_2019_1']
    },
    {
        name: 'blockCalendar_scheduler_min_js',
        files: ['plugins/fullcalendar_new/fullcalendar-scheduler/1.9.4/scheduler.min.js?v=30_11_2019_1','plugins/jquery-ui/jquery-ui.min.js?v=30_11_2019_1']
    },
    {
        name: 'mwl.fullcalendar',
        files: ['https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.10.0/fullcalendar.css','https://cdnjs.cloudflare.com/ajax/libs/moment.js?v=30_11_2019_1/2.24.0/moment.min.js?v=30_11_2019_1','https://cdnjs.cloudflare.com/ajax/libs/angular-ui-calendar/1.0.0/calendar.min.js?v=30_11_2019_1','https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.10.0/fullcalendar.min.js?v=30_11_2019_1']
    }
    , {
        name: 'ng-nestable',
        files: ['bower_components/ng-nestable/src/angular-nestable.js?v=30_11_2019_1']
    }, {
        name: 'vAccordion',
        files: ['bower_components/v-accordion/dist/v-accordion.min.js?v=30_11_2019_1', 'bower_components/v-accordion/dist/v-accordion.min.css']
    },  {
        name: 'checklist-model',
        files: ['bower_components/checklist-model/checklist-model.js?v=30_11_2019_1']
    }, {
        name: 'angular-notification-icons',
        files: ['bower_components/angular-notification-icons/dist/angular-notification-icons.min.js?v=30_11_2019_1', 'bower_components/angular-notification-icons/dist/angular-notification-icons.min.css']
    }, {
        name: 'angularSpectrumColorpicker',
        files: ['bower_components/angular-spectrum-colorpicker/dist/angular-spectrum-colorpicker.min.js?v=30_11_2019_1']
    },{
        name: 'ui.bootstrap.datetimepicker',
        files: ['assets/js/datetime-picker.js?v=30_11_2019_1']
    },]
});
