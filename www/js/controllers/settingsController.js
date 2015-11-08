appModule.controller('SettingsCtrl', function($scope, Settings, $filter, $ionicModal, $timeout, $cordovaDatePicker) {
  
  $scope.noWarningPopup = { checked: true};

  $scope.totalBudget = 99;

  $scope.offsetDate = new Date();
  Settings.get('offsetDate').then(function(result){
    if(result){
      $scope.offsetDate = new Date(result.SettingValue);
    }
  })

  Settings.get('warningPopup').then(function(result){
    if(result){
      $scope.noWarningPopup = { checked: result.SettingValue == "true" ? true : false };
    }
  })

  Settings.get('budget').then(function(result){
    if(result){
      $scope.totalBudget = parseFloat(result.SettingValue);
    }
  })

  $scope.setWarningPopup = function(){
    Settings.set('warningPopup', $scope.noWarningPopup.checked);
  }

  $scope.setBudget = function(totalBudget){
    console.log("totalBudget "+ totalBudget);
    if(totalBudget == "" || totalBudget == null) totalBudget = 0;
    Settings.set('budget', totalBudget);

    $scope.totalBudget = totalBudget;

    $timeout(function(){
      $scope.closeBudgetPopup();
    }, 0);
  }

  $scope.datePicker = function (val) {
    $cordovaDatePicker.show({
          date: new Date($scope.offsetDate),
          mode: 'date'
      }).then(function (date) {
          $scope.offsetDate = new Date(date);
          Settings.set('offsetDate', $scope.offsetDate);
      }); 
  };

  $ionicModal.fromTemplateUrl('templates/addBudget.html', {
    scope: $scope
  }).then(function(modal){
    $scope.modal = modal;
  });

  $scope.closeBudgetPopup = function(){
    $scope.modal.hide();
  };

  $scope.showBudgetPopup = function(){
    $scope.modal.show();
  };
});