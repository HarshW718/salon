'use strict';
/** 
  * controller for angular-ckeditor
*/
app.controller('regCtrl', ['$scope', '$state','$http','APP','toaster', function ( $scope, $state, $http,APP,toaster) {
    
  $scope.addUser = function (frm_id) {
      

    if(!/^[a-zA-Z ]*$/g.test($scope.users.first_name)){
        $scope.firstname_validation_message_display = true;
        $scope.firstname_validation_message = "Only allow alphabet and space.";
        return false;
    }else{
        $scope.firstname_validation_message_display = false;
        $scope.firstname_validation_message = "";
    }
    
    if(!/^[a-zA-Z ]*$/g.test($scope.users.last_name)){
        $scope.lastname_validation_message_display = true;
        $scope.lastname_validation_message = "Only allow alphabet and space.";
        return false;
    }else{
        $scope.lastname_validation_message_display = false;
        $scope.lastname_validation_message = "";
    }

    
    if ($("#" + frm_id).valid()) 
    {
        if($scope.users.password!= $scope.users.conf_password){
            toaster.pop('error', 'Error',"Password doesn't match!");
            return false;

        }
        $http({
            url:APP.API + 'add-user',
            method: "post",
            data: $scope.users
        }).then(function (response) {
            
            if (response.data.error == false) {
                $scope.user={};
                $state.go('login.signin');
                setTimeout(function(){
                    toaster.pop('success', 'Success',response.data.message);   
                },500);
                
                
            }else {
                
                toaster.pop('error', 'Error',response.data.message);   
            }

        }).catch(function (request, status, errorThrown) {
            var responce_error = request.data;
            angular.forEach(responce_error.errors, function (error) {
                for (var i = 0; i < error.length; i++) {
                    toaster.pop('error', 'Error',error[i]); 
                }
            });
        });
    }
}
    
}]);

