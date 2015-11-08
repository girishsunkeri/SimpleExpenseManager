appModule.controller('ExpenseCtrl', function($scope, UI, Expense) {
  $scope.expenses = [];

  $scope.$on('$ionicView.enter', function(e) {
    //UI.setBackButtonSettings(true, '');
    $scope.updateExpenses();
  });

  $scope.updateExpenses = function() {
    Expense.all().then(function(expenses){
      $scope.expenses = expenses;
    });
  };
});