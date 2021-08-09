'use strict';
/** 
  * Password-check directive.
*/
app.directive('compareTo', function () {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function (scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function (modelValue) {
                return modelValue == scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function () {
                ngModel.$validate();
            });
        }
    };
});

/** 
  * String to number converter
*/

app.directive('stringToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        return '' + value;
      });
      ngModel.$formatters.push(function(value) {
        return parseFloat(value);
      });
    }
  };
});



/** 
  * only number allow in text box
*/


app.directive('numbersOnly', function () {

  return {
      require: 'ngModel',
      link: function (scope, element, attr, ngModelCtrl) {
          function fromUser(text) {
              if (text) {
                  var transformedInput = text.replace(/[^0-9]/g, '');

                  if (transformedInput !== text) {
                      ngModelCtrl.$setViewValue(transformedInput);
                      ngModelCtrl.$render();
                  }
                  return transformedInput;
              }
              return undefined;
          }            
          ngModelCtrl.$parsers.push(fromUser);
      }
  };
  
});

app.directive('postalCodeValidation', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attr, ngModelCtrl) {
      element.on('keyup', function (e) {
        if (scope.customer.postal_code.length <= 4) {
          if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode == 8) {
          } else {
            scope.customer.postal_code = '';
          }
        } else if (scope.customer.postal_code.length == 5 || scope.customer.postal_code.length == 6) {
          if ((e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode == 20 || e.keyCode == 8 || e.keyCode == 16) {
          } else {
            scope.customer.postal_code = '';
          }
        }
      })

    }
  };

});

app.directive('createBirthdate', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attr, ngModelCtrl) {
      element.on('keyup', function (e) {
        
        if (((e.keyCode >= 48 && e.keyCode <= 57) || e.keyCode == 8 || e.keyCode <= 37 || e.keyCode <= 39 || (e.keyCode >= 96 && e.keyCode <= 105))) {
          var birtdate = $('#birthdate_display').val();
          var ele = $('#birthdate_display').val();
          var dashCount = (ele.match(/-/g) || []).length;
  
          if(ele.length == 2){
              if(ele > 31){
                  //alert(ele)
                  $('#birthdate_display').val('');
                  return false;
              }
          }else if(ele.length == 5){
              var last2 = ele.slice(-2)
              if(parseInt(last2) > 12){
                  //alert(ele)
                  $('#birthdate_display').val('');
                  return false;
              }
  
          }
         
         
          if(e.keyCode !=8){
              if (dashCount < 2) {
                  if(ele.length == 2){
                      ele = ele+'-';
                  }else if(ele.length == 5){
                      ele = ele+'-';
                  }
                  var finalVal = ele;
              } else {
                  var finalVal = ele;
              }
          }else{
              var finalVal = ele;
          }
  
  
  
          $('#birthdate_display').val(finalVal);
          }else{
              $('#birthdate_display').val('');
          }



      })

    }
  };

});


app.directive('replace', function() {
  return {
    require: 'ngModel',
    scope: {
      regex: '@replace',
      with: '@with'
    }, 
    link: function(scope, element, attrs, model) {
      model.$parsers.push(function(val) {
        if (!val) { return; }
        var regex = new RegExp(scope.regex);
        var replaced = val.replace(regex, scope.with); 
        if (replaced !== val) {
          model.$setViewValue(replaced);
          model.$render();
        }         
        return replaced;         
      });
    }
  };
})
