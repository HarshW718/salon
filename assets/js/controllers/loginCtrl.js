'use strict';
/** 
  * controller for angular-ckeditor
*/
app.controller('loginCtrl', ['$rootScope', '$scope', '$stateParams' ,'$location', '$state', '$http','APP','$cookies','toaster', function ($rootScope, $scope, $stateParams ,$location, $state,$http,APP,$cookies,toaster) {
    //console.log("TCL: $location.search()", $location.search())
    let params = $location.absUrl().split('?')
    //console.log("TCL: params[1]", params[1])
    //console.log("TCL: params[1]['state']", params[1]['state'])
    //$state.go('app.pages.permission');
$scope.authLogin = ""
 var auth_token = localStorage.getItem('auth_token');
  if (!localStorage.getItem('auth_token') && $scope.authLogin === "") {
    if(params[1]) {
        $http({
            url:APP.API + 'googlelogin/google/callback?'+params[1],
            method: "get",
            data: $scope.users,
            headers: {
                'Content-type': 'application/json',
            }
        }).then(function (response) {
        var return_responce = response.data;
        if (response.data.error == false) {
            $rootScope.userdata = response.data.data;
            $cookies.put('userdata', JSON.stringify(response.data.data));
            sessionStorage.setItem('login_time', new Date());
            localStorage.setItem('auth_token', response.data.data.auth_token);
            $scope.f_menu_url = '';
            $scope.s_menu_url = ''
            var index = 0;
            angular.forEach($rootScope.userdata.menu, function (value, key) {
                if(value.permit_user == true) {
                    if(index == 0) {
                        $scope.f_menu_url = value.redirect_url;
                    }
                    if(value.menu_id == "0") {
                        $scope.s_menu_url = value.redirect_url;
                    }
                    index++;
                }
            });
            
            setTimeout(function(){
                
                toaster.pop('success', 'Success',response.data.message);
            },800);
	    $scope.authLogin = "login"
            console.log("$scope.s_menu_url", $scope.s_menu_url)
                
            if($scope.s_menu_url != undefined && $scope.s_menu_url != "") {
                $state.go($scope.s_menu_url);
            } else if($scope.f_menu_url != undefined && $scope.f_menu_url != "") {
                
                $state.go($scope.f_menu_url);
            } else {
                $state.go('app.pages.permission');
            }
            
        } else {
            //$state.go('login.signin');
            toaster.pop('error', 'Error',response.data.message);
        }
            
        });
    }
}
  
    if($location.search().code) {
        console.log
        
    }
   $scope.loginUser = function (frm_id) {
            if ($("#" + frm_id).valid()) 
            {
                $http({
                    url:APP.API + 'check-user-login',
                    method: "post",
                    data: $scope.users
                }).then(function (response) {

                    var return_responce = response.data;
                    if (response.data.error == false) {
                        $rootScope.userdata = response.data.data;
                        $cookies.put('userdata', JSON.stringify(response.data.data));
                        sessionStorage.setItem('login_time', new Date());
                        localStorage.setItem('auth_token', response.data.data.auth_token);
                        $scope.f_menu_url = '';
                        $scope.s_menu_url = ''
                        var index = 0;
                        angular.forEach($rootScope.userdata.menu, function (value, key) {
                            if(value.permit_user == true) {
                                if(index == 0) {
                                    $scope.f_menu_url = value.redirect_url;
                                }
                                if(value.menu_id == "0") {
                                    $scope.s_menu_url = value.redirect_url;
                                }
                                index++;
                            }
                        });
                        
                        setTimeout(function(){
                            
                            toaster.pop('success', 'Success',response.data.message);
                        },800);
                        
                        if($scope.s_menu_url != undefined && $scope.s_menu_url != "") {
                            $state.go($scope.s_menu_url);
                        } else if($scope.f_menu_url != undefined && $scope.f_menu_url != "") {
                            
                            $state.go($scope.f_menu_url);
                        } else {
                            $state.go('app.pages.permission');
                        }
                        
                    } else {
                        toaster.pop('error', 'Error',response.data.message);
                    }
                });
            }
        }
    
}]);
