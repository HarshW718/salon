'use strict';
/**
 * controllers for UI Bootstrap components
 */

app.controller('workersDetailviewCtrl', ["$scope","$http","APP","notifications","restSessionOut","$stateParams","$rootScope", function ($scope, $http, APP,notifications,restSessionOut,$stateParams,$rootScope) {
    var auth_token = localStorage.getItem('auth_token');
    $http.defaults.headers.common.authtoken = auth_token;
    if (!localStorage.getItem('auth_token'))
    {
        restSessionOut.getRstOut();
    }
    if (!sessionStorage.getItem('login_time')) {
        restSessionOut.getRstOut();
    }
    
    if($scope.users==undefined){
        $scope.users={};
    }
    
    $scope.roleList=[{'value':1,'name':'The admin'},{'value':2,'name':'Workers'}];
    
    if($scope.usersServices==undefined){
        $scope.usersServices={};
    }
    $scope.user_role = $scope.userdata.menu;
    $scope.v =  {};
    var strongRegularExp = new RegExp("^(?=.[a-z])(?=.[A-Z])(?=.[0-9])(?=.[!@#\$%\^&\*])(?=.{8,})");
    var mediumRegularExp = new RegExp("^(((?=.[a-z])(?=.[A-Z]))|((?=.[a-z])(?=.[0-9]))|((?=.[A-Z])(?=.[0-9])))(?=.{6,})");
    $scope.editUser = function (frm_id) {
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
            

            $http({
                url:APP.API + 'edit_staff',
                method: "post",
                data: $scope.users
            }).then(function (response) {
                try{
                if(response.data.status == "401"){
                       restSessionOut.getRstOut();
                }
                }catch(err){}
                var return_responce = response.data;
                if (response.data.error == false) {
                    notifications.Message('success', 'Success', response.data.message);
                } else {
                    notifications.Message('error', 'Error',response.data.message);
                }
            }).catch(function (request, status, errorThrown) {
                var responce_error = request.data;
                angular.forEach(responce_error.errors, function(error){
                      for (var i=0; i<error.length; i++) {
                     notifications.Message('error', 'Error', error[i]);
                  }
                  });
            });
        }
    }
     $scope.editAuthUser = function (frm_id) {
        if ($scope.users.role!=undefined && $scope.users.role!='' && $scope.users.role!=0) 
        {
            console.log($scope.menu);
            console.log($scope.users);
            console.log($scope.book_app);
            console.log($scope.user_role);
           
           /*  if($scope.menu.book_app == undefined && $scope.menu.agenda == undefined && $scope.menu.casedesk == undefined && $scope.menu.managemanet == undefined && $scope.menu.reports == undefined) {
                notifications.Message('error', 'Error', "Please select atleast one module of these listed modules");
                return false;
            } */
            $http({
                url:APP.API + 'edit_auth_user',
                method: "post",
                data: {'usersdata':$scope.users,'user_role':$scope.user_role},
            }).then(function (response) {
                try{
                if(response.data.status == "401"){
                       restSessionOut.getRstOut();
                }
                }catch(err){}
                var return_responce = response.data;
                if (response.data.error == false) {
                    notifications.Message('success', 'Success', response.data.message);
                } else {
                    notifications.Message('error', 'Error',response.data.message);
                }
            }).catch(function (request, status, errorThrown) {
                var responce_error = request.data;
                angular.forEach(responce_error.errors, function(error){
                      for (var i=0; i<error.length; i++) {
                     notifications.Message('error', 'Error', error[i]);
                  }
                  });
            });
        }else {
            notifications.Message('error', 'Error','Please select role');
        }
    }
    $scope.columns = [];
    

    $scope.h24Settings = {
        timeFormat: 'HH:ii'
    };
        
    $scope.removeSlot=function (key,innerkey){
        
       // alert(Array.isArray($scope.columns[key]['timeSlot']))
        var is_array = Array.isArray($scope.columns[key]['timeSlot']);
        if(is_array){
            $scope.columns[key]['timeSlot'].splice(innerkey, 1);
        }else{
            delete $scope.columns[key]['timeSlot'][innerkey]
        }
    }
   $scope.addSlot=function(key,innerkey){
       var slotlength=Object.keys($scope.columns[key]['timeSlot']).length;
       var newkey=slotlength;
       $scope.columns[key]['timeSlot'][newkey]={'is_check':0,'from_time':new Date(1970, 0, 1, 0, 0, 0),'to_time':new Date(1970, 0, 1, 0, 0, 0)};
   }
   $scope.addWorkingTime=function(){
       
       
        $http.post(APP.API + 'add_working_time', {'data':$scope.columns,'user_id':$scope.users.id}
        ).then(function (response) {
            var return_responce = response.data;
            if (return_responce.success != false) {
                notifications.Message('success', 'Success', response.data.message);
            } else {
               notifications.Message('error', 'Error',return_responce.message);
            }
        }).catch(function (request, status, errorThrown) {
            var responce_error = request.data;
            angular.forEach(responce_error.errors, function(error){
                  for (var i=0; i<error.length; i++) {
                 cb.success('error', 'Error', error[i]);
              }
              });
        });
    }

    $scope.toggleButtonState = function(status,key,newkey) {
        if(status == true) {
            $scope.columns[key]['timeSlot']={};
            $scope.columns[key]['timeSlot'][newkey]={'is_check':status,'from_time':new Date(1970, 0, 1, 0, 0, 0),'to_time':new Date(1970, 0, 1, 0, 0, 0),'to_disable':true,'from_disable':true};
           
        } else {
            $scope.columns[key]['timeSlot'][newkey]={'is_check':status,'from_time':new Date(1970, 0, 1, 0, 0, 0),'to_time':new Date(1970, 0, 1, 0, 0, 0),'to_disable':false,'from_disable':false};
        }
    }

    if($scope.users==undefined){
        $scope.users={};
    }
    
    
    
    $http({
        url:APP.API + 'get_staff_details?id='+$stateParams.id,
        method: "get",
    }).then(function (response) {
        try{
            if(response.data.status == "401"){
                   restSessionOut.getRstOut();
            }
            }catch(err){
                
            }
        if (response.data.error == false) {
           $scope.users=response.data.data[0];
           console.log($scope.users);
            if($scope.users.role==undefined){
                $scope.users.role='';
            }
            if($scope.users.is_sync_google){
                $scope.users.is_sync_google=true;
            }else {
                $scope.users.is_sync_google=false;
            }
            $scope.usersServices=response.data.services;
            angular.forEach($scope.usersServices, function(user_service) {
                $scope.selected_service[user_service.service_id] = true;
            });
            $scope.auth=false;
            if ($rootScope.userdata === undefined && $cookies.get('userdata') !== undefined)
            {
                $rootScope.userdata = JSON.parse($cookies.get('userdata'));
            }
            if($scope.users.id==$rootScope.userdata.id){
                $scope.auth=true;
            }
            $scope.roles=response.data.roles;
            $scope.user_role=response.data.userMenu;
            $scope.time=response.data.time;

            if($scope.time!='' && $scope.time!=undefined){
               $scope.columns=$scope.time;
               for(var i=0;i<$scope.columns.length;i++){
                   for(var j=0;j<$scope.columns[i]['timeSlot'].length;j++){
                       //$scope.columns[i]['timeSlot'][j]={'is_check':$scope.columns[j]['timeSlot'][j].is_check,'from_time':moment($scope.columns[i]['timeSlot'][j].from_time).format('YYYY-MM-DD HH:mm:ss'),'to_time':moment($scope.columns[i]['timeSlot'][j].to_time).format('YYYY-MM-DD HH:mm:ss')}; 
                  
                      var a=moment().format('YYYY MM DD')+' '+$scope.columns[i]['timeSlot'][j].from_time;
                      var b=moment().format('YYYY MM DD')+' '+$scope.columns[i]['timeSlot'][j].to_time;
                       var newfromTime= moment(a).format('hh:mm A');
                       var newtoTime= moment(b).format('hh:mm A');
                       if($scope.columns[i]['timeSlot'][j].is_check==1){
                           var ischeck=true;
                           $scope.columns[i]['timeSlot'][j]={'is_check':ischeck,'from_time':'','to_time':'','to_disable':true,'from_disable':true};
                       }else {
                            var ischeck=false;
                           if($scope.columns[i]['timeSlot'][j].from_time==''){
                               $scope.columns[i]['timeSlot'][j]={'is_check':ischeck,'from_time':'','to_time':'','to_disable':false,'from_disable':false};
                           }else {
                                $scope.columns[i]['timeSlot'][j]={'is_check':ischeck,'from_time':newfromTime,'to_time':newtoTime,'to_disable':false,'from_disable':false};
                           }
                           if($scope.columns[i]['timeSlot'][j].to_time==''){
                               $scope.columns[i]['timeSlot'][j]={'is_check':ischeck,'from_time':'','to_time':'','to_disable':false,'from_disable':false};
                           }else {
                                $scope.columns[i]['timeSlot'][j]={'is_check':ischeck,'from_time':newfromTime,'to_time':newtoTime,'to_disable':false,'from_disable':false};
                           }
                          
                          
                       }
                       
                   }
                   

                }
            }else {
                var daysList=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
                for(var j=0;j<7;j++){
                   $scope.columns[j]= {'dayname':daysList[j],'dayindex':j};    
                }

                for(var i=0;i<$scope.columns.length;i++){
                   
                   $scope.columns[i]['timeSlot']= {0:{'is_check':0,'from_time':new Date(1970, 0, 1, 0, 0, 0),'to_time':new Date(1970, 0, 1, 0, 0, 0)}};

                }
            }
            if($scope.roles!='' && $scope.roles != undefined){
                $scope.users.role=$scope.roles[0]['role_id'];
                if($scope.roles[0]['role_id']==1){
                    $('.cs-options').find('li').eq( 0 ).addClass('cs-selected');
                    $('.cs-placeholder').html('The admin');
                }else if($scope.roles[0]['role_id']==2){
                    $('.cs-options').find('li').eq(1).addClass('cs-selected');
                    $('.cs-placeholder').html('Workers');
                }else if($scope.roles[0]['role_id']==3){
                    $('.cs-options').find('li').eq( 2 ).addClass('cs-selected');
                    $('.cs-placeholder').html('Accountants');
                }else if($scope.roles[0]['role_id']==4){
                    $('.cs-options').find('li').eq( 3 ).addClass('cs-selected');
                    $('.cs-placeholder').html('Receptional');
                }
                
                $scope.users.book_app=0;
                $scope.users.agenda=0;
                $scope.users.casedesk=0;
                $scope.users.managemanet=0;
                $scope.users.reports=0;
                for(var i=0;i<$scope.roles.length;i++){
                    if($scope.roles[i].menu_id==1){
                        $scope.users.book_app=1
                    }else if ($scope.roles[i].menu_id==2){
                        $scope.users.agenda=1;
                    }else if ($scope.roles[i].menu_id==3){
                        $scope.users.casedesk=1;
                    }else if ($scope.roles[i].menu_id==4){
                        $scope.users.managemanet=1;
                    }else if ($scope.roles[i].menu_id==5){
                        $scope.users.reports=1;
                    }
                }
            }
        } else {
            
            notifications.Message('error', 'No user exist',response.data.message);
        }
    })


    $scope.hide_show_1 = false;
    $scope.hide_show_2 = false;
    $scope.list_service_category = function(get__cat_id){
        
        $http.get(APP.API + 'list_service_category'
        ).then(function (response) {
             try{
                if(response.data.status == "401"){
                       restSessionOut.getRstOut();
                }
                }catch(err){}
            $scope.service_categories = response.data.data;
        }).catch(function (request, status, errorThrown) {
    
        });

    }
    
$scope.list_service = function(){

    $http.get(APP.API + 'list_service'
        ).then(function (response) {
             try{
                if(response.data.status == "401"){
                       restSessionOut.getRstOut();
                }
                }catch(err){}
        $scope.services = response.data.data;
        $scope.service_categories_array = response.data.data_array;
        }).catch(function (request, status, errorThrown) {
        });
    }
    
     $scope.list_service_category();
     $scope.list_service();

     if($scope.search==undefined){
        $scope.search={};
     }
     $scope.onSearch = function (){

        $http.post(APP.API + 'search_service_work_detail', $scope.search
    ).then(function (response) {
         try{
                if(response.data.status == "401"){
                       restSessionOut.getRstOut();
                }
                }catch(err){}
               $scope.service_categories = response.data.service_categories;
               $scope.services = response.data.services;
               console.log('responce_data',response.data);
       
            //const peopleArray = Object.keys(peopleObj).map(i => peopleObj[i])
    }).catch(function (request, status, errorThrown) {

    });


     }
     
    $scope.onSelected = function (selectedItem) {
        $scope.list_service_category(selectedItem.category_id);
        $scope.list_service(selectedItem.id);
    }
   
    $scope.category1 = function (index) { 
     
        if($scope['hide_show_' + index] != true){
            $scope['hide_show_' + index] = true;
        }else{
            $scope['hide_show_' + index] = false;
        }
    }
    $scope.selected_service = {};
    $scope.selected_cat = {};
    
    $scope.checkByCategory = function (cate_id){
        
        if($scope.selected_cat[cate_id] == true){
            angular.forEach($scope.services, function(single_service) {
                if(single_service.category_id == cate_id){
                    if($scope.selected_service[single_service.id] == undefined){
                       $scope.selected_service[single_service.id] = true;
                    }else if($scope.selected_service[single_service.id] == false){
                       $scope.selected_service[single_service.id] = true;
                    }
                }
        });
        }else if($scope.selected_cat[cate_id] == undefined){
            angular.forEach($scope.services, function(single_service) {
                if(single_service.category_id == cate_id){
                    if($scope.selected_service[single_service.id] == undefined){
                       $scope.selected_service[single_service.id] = true;
                    }else if($scope.selected_service[single_service.id] == false){
                       $scope.selected_service[single_service.id] = true;
                    }
                }
        });

        }else{
            angular.forEach($scope.services, function(single_service) {
                if(single_service.category_id == cate_id){
                    $scope.selected_service[single_service.id] = false;
                }
        });

        }
    }
    $scope.singleCheck = function (service_data,totalServices,selected_service){
        var catId=service_data.category_id;
        var totalCatServices=0;
        var servicesList=[]
        for(var i=0;i<totalServices.length;i++){
            if(totalServices[i].category_id==catId){
                totalCatServices++;
                servicesList.push(totalServices[i].id);
            }
        }
        var checkFlag=0;
        for(var s=0;s<servicesList.length;s++){
           if(!selected_service[servicesList[s]] && checkFlag==0){
               checkFlag=1;
           } 
        }
        if(checkFlag==0){
            $scope.selected_cat[catId]=true;
        }else {
            $scope.selected_cat[catId]=false;
        }

    }

    $http({
        url:APP.API + 'list_service_category_forselect',
        method: "get",
    }).then(function (response) {
        try{
                if(response.data.status == "401"){
                       restSessionOut.getRstOut();
                }
                }catch(err){}
        if (response.success != false) {
            $scope.service_categories=response.data.data;
        } else {
            $scope.users={};
            notifications.Message('error', 'No user',response.data.message);
        }
    })

$scope.submit_checkedService = function () {
    
var update_data = {user_id:$stateParams.id,selected_services:$scope.selected_service}
        $http.post(APP.API + 'update_user_services', update_data
        ).then(function (response) {
             try{
                if(response.data.status == "401"){
                       restSessionOut.getRstOut();
                }
                }catch(err){}
            var return_responce = response.data;
            if (return_responce.success != false) {
                notifications.Message('success', 'Success',return_responce.message);
                
            } else {
               
            }
        }).catch(function (request, status, errorThrown) {
            var responce_error = request.data;
            angular.forEach(responce_error.errors, function(error){
                for (var i=0; i<error.length; i++) {
                 cb.success('error', 'Error', error[i]);
              }
              });
        });
    
}

        $scope.resetPassword = function (frm_id) {
            
            if ($("#" + frm_id).valid()) {
                
                if($scope.users.new_password!= $scope.users.conf_password){
                    notifications.Message('error', 'Error', "Password doesn't match!");
                    return false;
                    
                }
                    $http({
                        url: APP.API + 'reset_password',
                        method: "post",
                        data: $scope.users,
                    }).then(function (response) {

                        try {
                            if (response.data.status == "401") {
                                restSessionOut.getRstOut();
                            }
                        } catch (err) {
                        }
                        var return_responce = response.data;
                        if (response.data.error == false) {
                            notifications.Message('success', 'Success', response.data.message);
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
    

}]);

