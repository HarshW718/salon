'use strict';
/**
 * controllers for UI Bootstrap components
 */

app.controller('workersCtrl', ["$scope", "$http","APP", "notifications","restSessionOut", function ($scope,$http, APP,  notifications,restSessionOut) {
     //   $state.go('app.pages.service_provider');
    $scope.users={};
    
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token'))
    {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }
    $scope.user_role = $scope.userdata.menu;
    console.log($scope.userdata);

    var strongRegularExp = new RegExp("^(?=.[a-z])(?=.[A-Z])(?=.[0-9])(?=.[!@#\$%\^&\*])(?=.{8,})");
    var mediumRegularExp = new RegExp("^(((?=.[a-z])(?=.[A-Z]))|((?=.[a-z])(?=.[0-9]))|((?=.[A-Z])(?=.[0-9])))(?=.{6,})");
    $scope.active = 0

    
    
    $scope.addUser = function (frm_id) {

        if ($scope.users.is_sync_google) {
            $scope.users.is_sync_google = 1;
        } else {
            $scope.users.is_sync_google = 0;
        }



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
        if(!/^[a-zA-Z ]*$/g.test($scope.users.name)){
            $scope.displayname_validation_message_display = true;
            $scope.displayname_validation_message = "Only allow alphabet and space.";
            return false;
        }else{
            $scope.displayname_validation_message_display = false;
            $scope.displayname_validation_message = "";
        }
        




        if ($("#" + frm_id).valid())
        {
            if ($scope.users.role == undefined) {

                $scope.active = 1;
                notifications.Message('error', 'Error', 'Please select role of user in authorizations tab !!');

            } else {

                if ($scope.users.role == 0) {
                    $scope.active = 1;
                    notifications.Message('error', 'Error', 'Please select role of user in authorizations tab !!');

                } else {

                    $scope.users.user_role = $scope.user_role;
                    $http({
                        url: APP.API + 'add_staff',
                        method: "post",
                        data: $scope.users,
                    }).then(function (response) {
                        
                        try {
                            if (response.data.status == "401") {
                                restSessionOut.getRstOut();
                            }
                        } catch (err) {
                        }
                        if (response.data.error == false) {
                            $scope.users = {};
                            notifications.Message('success', 'Success', response.data.message, 'app.pages.service_provider');
                        } else {
                            notifications.Message('error', 'Error', response.data.message);
                        }
                    }).catch(function (request, status, errorThrown) {
                        var responce_error = request.data;
                        angular.forEach(responce_error.errors, function (error) {
                            for (var i = 0; i < error.length; i++) {
                                notifications.Message('error', 'Error', error[i]);
                            }
                        });
                    });


                }



            }
        }
    }

}]);

