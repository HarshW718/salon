var app = angular.module('clipApp', ['clip-two']);
app.run(['$rootScope', '$state', '$stateParams', '$trace',
    function ($rootScope, $state, $stateParams, $trace) {

		// Attach Fastclick for eliminating the 300ms delay between a physical tap and the firing of a click event on mobile browsers
		FastClick.attach(document.body);

		// Set some reference to access them from any scope
		$rootScope.$state = $state;
		$rootScope.$stateParams = $stateParams;

		// GLOBAL APP SCOPE
		// set below basic information
		$rootScope.app = {
			name: 'Salon', // name of your project
			author: 'ClipTheme', // author's name or company name
			description: 'Angular Bootstrap Admin Template', // brief description
			version: '2.0', // current version
			year: ((new Date()).getFullYear()), // automatic current year (for copyright information)
			isMobile: (function () {// true if the browser is a mobile device
				var check = false;
				if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
					check = true;
				};
				return check;
			})(),
			layout: {
				isNavbarFixed: true, //true if you want to initialize the template with fixed header
				isSidebarFixed: true, // true if you want to initialize the template with fixed sidebar
				isSidebarClosed: false, // true if you want to initialize the template with closed sidebar
				isFooterFixed: false, // true if you want to initialize the template with fixed footer
				theme: 'theme-5', // indicate the theme chosen for your project
				logo: 'assets/images/logo2.png', // relative path of the project logo
			}
		};
		$rootScope.user = {
			name: 'Peter',
			job: 'ng-Dev',
			picture: 'app/img/user/02.jpg'
        };

        //$trace.enable('TRANSITION');
	}]);

	app.constant('APP', (function() {
		// Define your variable
		var resource = '';
		var PROJECT_NAME = '/salon/';
		// Use the variable in your constants
		var HOST_TYPE = 'http://';
		var SITE = '192.168.1.18';
		var VIEW_PATH = 'assets/views/';
		var NRM_APP_NOTIFICATION_DURATION = 5000//5000;
		var NRM_APP_ENC_ACTIVE = 0;
		var NRM_APP_ENC_ACTIVE_LOCAL = 1;
		var NRM_SETTING_ACCESS = [1];
		var IDEAL_TIMER_SECONDS = 2700; /* (45 * 60)*/
		return {
		HOST_TYPE : HOST_TYPE,
		SITE : SITE,
		API: 'api/api/',
		VIEW_PATH:VIEW_PATH,
		API_: HOST_TYPE+SITE+PROJECT_NAME+'api/',
		BASE: './',
		/*API: 'http://192.168.1.24/'+PROJECT_NAME+'/api/',*/
		PROJECT_NAME: PROJECT_NAME,
		DOCUMENT_TYPES: '.png,.jpg,.png,.jpeg,.pdf,.doc,.docx,.xlsx,.xls,.csv,.txt',
		DOCUMENT_TYPES_DROPZONE: '.png,.jpg,.png,.jpeg,.pdf,.doc,.docx,.xlsx,.xls,.csv,.txt',
		PROFILE_TYPES: '.png,.jpg,.png,.jpeg,.gif',
		PROFILE_IMG_SIZE : 102400,
		NRM_APP_NOTIFICATION_DURATION : NRM_APP_NOTIFICATION_DURATION,
		NRM_APP_ENC_ACTIVE : NRM_APP_ENC_ACTIVE,
		NRM_APP_ENC_ACTIVE_LOCAL : NRM_APP_ENC_ACTIVE_LOCAL,
		IDEAL_TIMER_SECONDS : IDEAL_TIMER_SECONDS,
		NRM_SETTING_ACCESS : NRM_SETTING_ACCESS,
		
		}
		})());









// translate config
app.config(['$translateProvider',
	function ($translateProvider) {
		// prefix and suffix information  is required to specify a pattern
		// You can simply use the static-files loader with this pattern:
		$translateProvider.useStaticFilesLoader({
			prefix: 'assets/i18n/',
			suffix: '.json'
		});

		// Since you've now registered more then one translation table, angular-translate has to know which one to use.
		// This is where preferredLanguage(langKey) comes in.
		$translateProvider.preferredLanguage('en');

		// Store the language in the local storage
		$translateProvider.useLocalStorage();

		// Enable sanitize
		$translateProvider.useSanitizeValueStrategy('sanitize');

	}]);
// configuration: Angular-Loading-Bar
app.config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
	cfpLoadingBarProvider.includeBar = true;
	cfpLoadingBarProvider.includeSpinner = false;
}]);
//Custom UI Bootstrap Calendar Popup Template
app.run(["$templateCache", function ($templateCache) {
	$templateCache.put("uib/template/datepickerPopup/popup.html",
		"<div>\n" +
		"  <ul class=\"uib-datepicker-popup clip-datepicker dropdown-menu\" dropdown-nested ng-if=\"isOpen\" ng-style=\"{top: position.top+'px', left: position.left+'px'}\" ng-keydown=\"keydown($event)\" ng-click=\"$event.stopPropagation()\">\n" +
		"    <li ng-transclude></li>\n" +
		"    <li ng-if=\"showButtonBar\" class=\"uib-button-bar\">\n" +
		"    <span class=\"btn-group pull-left\">\n" +
		"      <button type=\"button\" class=\"btn btn-sm btn-primary btn-o uib-datepicker-current\" ng-click=\"select('today', $event)\" ng-disabled=\"isDisabled('today')\">{{ getText('current') }}</button>\n" +
		"      <button type=\"button\" class=\"btn btn-sm btn-primary btn-o uib-clear\" ng-click=\"select(null, $event)\">{{ getText('clear') }}</button>\n" +
		"    </span>\n" +
		"      <button type=\"button\" class=\"btn btn-sm btn-primary pull-right uib-close\" ng-click=\"close($event)\">{{ getText('close') }}</button>\n" +
		"    </li>\n" +
		"  </ul>\n" +
		"</div>\n" +
		"");
	$templateCache.put("uib/template/datepicker/year.html",
		"<table class=\"uib-yearpicker\" role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
		"  <thead>\n" +
		"    <tr>\n" +
		"      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left uib-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
		"      <th colspan=\"{{::columns - 2}}\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm uib-title\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\"><strong>{{title}}</strong></button></th>\n" +
		"      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right uib-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
		"    </tr>\n" +
		"  </thead>\n" +
		"  <tbody>\n" +
		"    <tr class=\"uib-years\" ng-repeat=\"row in rows track by $index\">\n" +
		"      <td ng-repeat=\"dt in row\" class=\"uib-year text-center\" role=\"gridcell\"\n" +
		"        id=\"{{::dt.uid}}\"\n" +
		"        ng-class=\"::dt.customClass\">\n" +
		"        <button type=\"button\" class=\"btn btn-default\"\n" +
		"          uib-is-class=\"\n" +
		"            'btn-current' for selectedDt,\n" +
		"            'active' for activeDt\n" +
		"            on dt\"\n" +
		"          ng-click=\"select(dt.date)\"\n" +
		"          ng-disabled=\"::dt.disabled\"\n" +
		"          tabindex=\"-1\"><span ng-class=\"::{'text-info': dt.current}\">{{::dt.label}}</span></button>\n" +
		"      </td>\n" +
		"    </tr>\n" +
		"  </tbody>\n" +
		"</table>\n" +
		"");
	$templateCache.put("uib/template/datepicker/month.html",
		"<table class=\"uib-monthpicker\" role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
		"  <thead>\n" +
		"    <tr>\n" +
		"      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left uib-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
		"      <th><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm uib-title\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\"><strong>{{title}}</strong></button></th>\n" +
		"      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right uib-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
		"    </tr>\n" +
		"  </thead>\n" +
		"  <tbody>\n" +
		"    <tr class=\"uib-months\" ng-repeat=\"row in rows track by $index\">\n" +
		"      <td ng-repeat=\"dt in row\" class=\"uib-month text-center\" role=\"gridcell\"\n" +
		"        id=\"{{::dt.uid}}\"\n" +
		"        ng-class=\"::dt.customClass\">\n" +
		"        <button type=\"button\" class=\"btn btn-default\"\n" +
		"          uib-is-class=\"\n" +
		"            'btn-current' for selectedDt,\n" +
		"            'active' for activeDt\n" +
		"            on dt\"\n" +
		"          ng-click=\"select(dt.date)\"\n" +
		"          ng-disabled=\"::dt.disabled\"\n" +
		"          tabindex=\"-1\"><span ng-class=\"::{'text-info': dt.current}\">{{::dt.label}}</span></button>\n" +
		"      </td>\n" +
		"    </tr>\n" +
		"  </tbody>\n" +
		"</table>\n" +
		"");
}]);
