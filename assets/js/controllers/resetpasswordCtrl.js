'use strict';
/** 
  * controller for angular-ckeditor
*/
app.controller('resetpasswordCtrl', ['$scope', '$state','$http','APP','$stateParams','toaster', function ($scope, $state,$http,APP,$stateParams,toaster) {
    
        if($scope.reset==undefined){
            $scope.reset={};
        }



/** 
* From below code we will check password_reset_token in db (users table) 
  if token is available than we will display new password confirm password screen
  otherwise will display Link Expired screen
  $scope.checkUnique_id()
*/

        $scope.checkUnique_id = function(){

            $http.post(APP.API + 'check_unique_id', $stateParams
            ).then(function (response) {
              
                if(response.data.user_data.length > 0){
                    $scope.display_div = false;
                }else{
                    $scope.display_div = true;
                }

            
            });

        }
        $scope.checkUnique_id()
        
        $scope.resetPassword= function(frm_id){
            if ($("#" + frm_id).valid()) {
                if($scope.reset.new_password!= $scope.reset.conf_password){
                    toaster.pop('error', 'Error',"Password doesn't match!");
                    return false;
                }
                $scope.reset.email=$stateParams.id;
                $http.post(APP.API + 'set_new_password', $scope.reset
                    ).then(function (response) {

                        if(response.data.error==false){

                            $scope.reset={};
                            $state.go('login.signin');
                            setTimeout(function(){
                                toaster.pop('success', 'Success',response.data.message);
                            },500);

                        }else if(response.data.error==true) {
                            toaster.pop('error', 'Error',response.data.message);
                        }

                    });
            }
        
        }
    
    
   
}]);
