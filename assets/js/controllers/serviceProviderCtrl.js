'use strict';
/**
 * controllers for UI Bootstrap components
 */

app.controller('serviceProviderCtrl', ["$scope", "$location","restSessionOut","$http","APP","notifications","SweetAlert",'toaster', function ($scope, $location,restSessionOut,$http,APP,notifications,SweetAlert,toaster) {
    

    $scope.NewWorkers = function(){
        $scope.users={};
        $location.url('/app/pages/management/workers');
    }
    $scope.workersDetailView = function(id){
        $location.url('/app/pages/management/worker_detail/'+id);
    }
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token'))
    {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }

    if(localStorage.getItem('google_sync_msg')) {
        var msgArr = {'error':true,'message':"hello"}
        var msg = JSON.parse(localStorage.getItem('google_sync_msg'))
        
        if(!msg.error) {
            toaster.pop('success', 'Success',msg.message);
        } else {
            toaster.pop('error', 'Error',msg.message);
        }
        
        localStorage.removeItem('google_sync_msg');
    }

    $scope.list_staff = function(){

        $http({
            url:APP.API + 'get_staff_list',
            method: "get",
        }).then(function (response) {
             try{
                if(response.data.status == "401"){
                       restSessionOut.getRstOut();
                }
                }catch(err){}
            $scope.activeData=response.data.activeData;
            $scope.inActiveData=response.data.inActiveData;
        })
    }
    $scope.list_staff()


        $scope.deleteWorker = function (staff_id) {
            $scope.delete_staff_id = { id: staff_id };
            SweetAlert.swal({
                title: "Are you sure?",
                text: "You want to delete selected staff!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: true,
                closeOnCancel: true
            }, function (isConfirm) {
    
                if (isConfirm) {
                    $http.post(APP.API + 'delete_staff', $scope.delete_staff_id
                        ).then(function (response) {
                           try{
                            if(response.data.status == "401"){
                             restSessionOut.getRstOut();
                         }
                     }catch(err){}
                     console.log('return_data', response.data);
                     notifications.Message('success', 'Success', response.data.message);
                     $scope.list_staff()
    
                 }).catch(function (request, status, errorThrown) {
    
                 });
             } else {
    
             }
         });
        }
}]);

