app.controller('company_settingCtrl', ["$scope", "restSessionOut", "$http", "APP", "notifications", "SweetAlert","FileUploader", function ($scope, restSessionOut, $http, APP, notifications, SweetAlert,FileUploader) {

    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token')) {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }

    $("#ui-datepicker-div").hide();
    if($scope.company==undefined){
        $scope.company={};
    }
    
   
       
    $http.get(APP.API + 'company_details',

    ).then(function (response) {

        if(response.data.success==false){
            
            $scope.company=response.data.data;
            
        }

    });
        
    $scope.updateCompanyDetails=function(){
        
        if ($('#id_companyForm').valid()) {
            if($scope.imageError==1 || $scope.company.company_logo==undefined || $scope.company.company_logo==''){
                 notifications.Message('error','Error','Please upload company logo.');
                return false;
               
            }
            $http.post(APP.API + 'update_company_details',$scope.company

            ).then(function (response) {

                if(response.data.success==false){
                    
                    notifications.Message('success','Success',response.data.message)
                    location.reload();

                }else {
                    
                    notifications.Message('error','Error',response.data.message)
                }

            });
        }
    }
    
     $scope.moveToTrash = function () {

        
        SweetAlert.swal({
            title: "Are you sure ?",
            text: "You want to delete selected images !",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes,delete it!",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                $http.post(APP.API + 'delete_company_images', $scope.company
                ).then(function (response) {
                    try {
                        if (response.data.status == "401") {
                            restSessionOut.getRstOut();
                        }
                    } catch (err) { }
                    if(response.data.success==false){
                        
                        notifications.Message('success', 'Success', response.data.message);
                        $scope.company.company_logo='';
                        
                    }else {
                        
                        notifications.Message('error', 'Error', response.data.message);
                    }
                    
                }).catch(function (request, status, errorThrown) {

                });
            } else {

            }
        });
    }
    
    var uploaderImages = $scope.uploaderImages = new FileUploader({
        url: APP.API + 'company_images',
        headers: { 'authtoken': auth_token },
        formData: [{ 'id': 1 }]

    });


    // FILTERS
    uploaderImages.filters.push({
        name: 'imageFilter',
        fn: function (item/*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            if('|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1){
                return true;
            }else{
                notifications.Message('warning','Failed','This is unsupported file !!');
                return false;
            }
        }
    });

    // CALLBACKS
    $scope.imageError=0;
    uploaderImages.onWhenAddingFileFailed = function (item/*{File|FileLikeObject}*/, filter, options) {
        
    };
    uploaderImages.onAfterAddingFile = function (fileItem) {
        
    };
    uploaderImages.onAfterAddingAll = function (addedFileItems) {
        uploaderImages.uploadAll()

    };
    uploaderImages.onBeforeUploadItem = function (item) {
        
    };
    uploaderImages.onProgressItem = function (fileItem, progress) {
        
    };
    uploaderImages.onProgressAll = function (progress) {
        
    };
    uploaderImages.onSuccessItem = function (fileItem, response, status, headers) {
        if(response=='error'){
            $scope.imageError=1;
            notifications.Message('error', 'Error', 'Your image was larger than 2MB in file size.');
        }else{
            $scope.imageError=0;
            $scope.company.company_logo=response;
        }
        
    
    };
    uploaderImages.onErrorItem = function (fileItem, response, status, headers) {
        
    };
    uploaderImages.onCancelItem = function (fileItem, response, status, headers) {
        
    };
    uploaderImages.onCompleteItem = function (fileItem, response, status, headers) {
        
    };
    uploaderImages.onCompleteAll = function () {
        
    };

    $scope.onImageUpload = function () {
        
        uploaderImages.onAfterAddingAll();

    }


}])

