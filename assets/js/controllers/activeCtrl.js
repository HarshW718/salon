'use strict';
/** 
  * controller for angular-ckeditor
*/
app.controller('activeCtrl', ['$rootScope', '$scope', '$state','$http','APP','$cookies','$stateParams','toaster' ,function ($rootScope, $scope, $state,$http,APP,$cookies,$stateParams,toaster) {

    if($stateParams.id){
        $http({
        url:APP.API + 'check_active_user?id='+$stateParams.id,
        method: "get",
    }).then(function (response) {

        if (response.data.error == false) {
            
          toaster.pop('success', 'Success',response.data.message);
          
        } else {
            
          toaster.pop('error', 'Error',response.data.message);
            
        }
    })
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
