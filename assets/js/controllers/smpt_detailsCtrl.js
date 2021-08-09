



app.controller('smpt_detailsCtrl', ["$scope", "restSessionOut", "$http", "APP",  "notifications",  function ($scope, restSessionOut, $http, APP, notifications) {

    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
      restSessionOut.getRstOut();
  }

    $scope.smpt_details = {}


    $scope.smpt_detail = function () {
        $http.get(APP.API + 'smpt_details'
        ).then(function (response) {
            try {
                if (response.data.status == "401") {
                    restSessionOut.getRstOut();
                }
            } catch (err) { }
            $scope.smpt_details = response.data.data;
            $scope.smpt_details.confirm_mail_password = response.data.data.mail_password;
        }).catch(function (request, status, errorThrown) {
        });
    }
    $scope.smpt_detail()


    $scope.submit_smptDetailsForm = function () {

      if($scope.smpt_details.mail_password == $scope.smpt_details.confirm_mail_password){

        $http.post(APP.API + 'update_smpt_details', $scope.smpt_details
        ).then(function (response) {

          try {
            if (response.data.status == "401") {
              restSessionOut.getRstOut();
            }
          } catch (err) { }
          if(response.status != false){
            notifications.Message('success','Success','SMPT detail update successfully.')
          }
          
    
        }).catch(function (request, status, errorThrown) {
    
        });


      }else{

        notifications.Message('error','Error','Make sure password and confirm password are same !!');
      }



       

       

    }





}])

