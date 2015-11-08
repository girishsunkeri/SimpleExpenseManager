appModule.controller('ReportCtrl', function($scope, Report, UI, Expense, $timeout, Settings, $cordovaDatePicker) {
  $scope.reportExpenses = [];

  $scope.startDate = new Date();

  $scope.endDate = new Date();

  $scope.$on('$ionicView.enter', function(e) {
    //UI.setBackButtonSettings(true, '');
    Settings.get('offsetDate').then(function(result){
      if(result){
        $scope.startDate = new Date(result.SettingValue);
      }

      $scope.updateReportExpenses();
    })
  });

  $scope.updateReportExpenses = function() { 
    Report.getReportByDate($scope.startDate, $scope.endDate).then(function(reportExpenses){
      console.log(reportExpenses);
      $scope.reportExpenses = reportExpenses;
    });
  };

  $scope.getTotal = function(){
    var total = 0;
    for(var i = 0; i < $scope.reportExpenses.length; i++){
        total += $scope.reportExpenses[i].totalCost;
    }
    return total;
  }

  $scope.toggleGroup = function(category, index) {
    if ($scope.isCategoryShown(category)) {
      $scope.shownCategory = null;
    } else {
      Expense.allByCategoryId(category.categoryId, $scope.startDate, $scope.endDate).then(function(categoryExpenses){
        $scope.reportExpenses[index].expenses = categoryExpenses;
      })

      $timeout(function(){
        $scope.shownCategory = category;
      }, 100)


    }
  };

  $scope.isCategoryShown = function(category) {
    return $scope.shownCategory === category;
  };

  $scope.startDatePicker = function () {
    $cordovaDatePicker.show({
          date: new Date($scope.startDate),
          mode: 'date'
      }).then(function (date) {
          $scope.startDate = new Date(date);
          $scope.updateReportExpenses();
      }); 
  };

  $scope.endDatePicker = function () {
      $cordovaDatePicker.show({
          date: new Date($scope.endDate),
          mode: 'date'
      }).then(function (date) {
          $scope.endDate = new Date(date);
          $scope.updateReportExpenses();
      }); 
  };

});


appModule.filter('cmdate', [
    '$filter', function($filter) {
        return function(input, format) {
            return $filter('date')(new Date(input), format);
        };
    }
]);