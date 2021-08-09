'use strict';
/** 
  * controller for angular-ckeditor
*/
app.controller('forgotCtrl', [ '$scope', '$http','APP','toaster', function ( $scope, $http,APP,toaster) {
    
  if($scope.forgot==undefined){
            $scope.forgot={};
        }
        $scope.forgotPassword = function (frm_id) {
            if ($("#" + frm_id).valid()) 
            {
                $http({
                    url:APP.API + 'forgot-password',
                    method: "post",
                    data: $scope.forgot
                }).then(function (response) {

                    var return_responce = response.data;
                    
                    if (response.data.error == false) {
                        $scope.forgot={};
                        toaster.pop('success', 'Success',response.data.message);   
                    } else {
                        toaster.pop('error', 'Error',response.data.message);   
                    }
                });
            }
        }
    
}]);
