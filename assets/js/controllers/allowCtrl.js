'use strict';
/** 
  * controller for angular-ckeditor
*/
app.controller('allowCtrl', [ '$scope','$http','APP','$stateParams', function ($scope, $http,APP,$stateParams) {
    
    if($stateParams.type){
        $scope.type=$stateParams.type;
        $scope.sync=false;
        $scope.syncError=false;
        $scope.syncInfo=false;
        $scope.btn=0;
        $scope.allow={};
        $scope.allow.fromId=$stateParams.fromId;
        $scope.allow.toId=$stateParams.toId;
        $scope.allow.type=$stateParams.type;
        if($scope.type=='yes'){
            $http.post(APP.API + 'sync_allow', $scope.allow
                ).then(function (response) {
                    if(response.data.error==false){
                        
                        $scope.sync=true;
                        $scope.msg=response.data.message;
                        if(response.data.btn==1){
                            
                            $scope.btn=1;
                        }else if(response.data.btn==2){
                            
                            $scope.btn=2;
                        }
                    }else if(response.data.error==true) {
                        
                        $scope.syncError=true;
                        $scope.msg=response.data.message;
                    }else if(response.data.error=='info') {
                        
                        $scope.syncInfo=true;
                        $scope.msg=response.data.message;
                        
                        if(response.data.btn==1){
                            
                            $scope.btn=1;
                        }else if(response.data.btn==2){
                            
                            $scope.btn=2;
                        }
                    }
                    
                    return false;
                    
                });
        }else {
            
            $http.post(APP.API + 'sync_no_allow', $scope.allow
                ).then(function (response) {

                if(response.data.error==false){
                    
                    $scope.sync=true;
                    $scope.msg=response.data.message;
                    
                }else if(response.data.error==true) {
                    
                    $scope.syncError=true;
                    $scope.msg=response.data.message;
                    
                }else if(response.data.error=='info') {
                    
                        $scope.syncInfo=true;
                        $scope.msg=response.data.message;
                        
                        if(response.data.btn==1){
                            
                            $scope.btn=1;
                        }else if(response.data.btn==2){
                            
                            $scope.btn=2;
                        }
                    }
                return false;

            });
        }
    }
    
    $scope.denied= function(){

        $scope.sync=false;
        $scope.syncError=false;
        $scope.syncInfo=false;
        $scope.btn=0;
        
        $http.post(APP.API + 'denied_request', $scope.allow
        ).then(function (response) {

            if(response.data.error==false){
                
                $scope.sync=true;
                $scope.msg=response.data.message;
                
            }else if(response.data.error==true) {
                
                $scope.syncError=true;
                $scope.msg=response.data.message;
                
            }else if(response.data.error=='info') {
                
                $scope.syncInfo=true;
                $scope.msg=response.data.message;
                
            }

            return false;

        });
    }
    $scope.sync= function(){

        $scope.sync=false;
        $scope.syncError=false;
        $scope.syncInfo=false;
        $scope.btn=0;
        
        $http.post(APP.API + 'sync_request', $scope.allow
        ).then(function (response) {

            if(response.data.error==false){
                
                $scope.sync=true;
                $scope.msg=response.data.message;
                
            }else if(response.data.error==true) {
                
                $scope.syncError=true;
                $scope.msg=response.data.message;
                
            }else if(response.data.error=='info') {
                
                $scope.syncInfo=true;
                $scope.msg=response.data.message;
                
            }

            return false;

        });
    }
    
   
    
}]);
