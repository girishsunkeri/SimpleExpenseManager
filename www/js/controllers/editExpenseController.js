appModule.controller('ExpenseDetailsCtrl', function($scope, $state, $stateParams, $filter, $ionicModal, $cordovaToast, $ionicPopup, Expense, Category, $cordovaDatePicker) {
  $stateParams.expenseId;

  $scope.expense = {};

  $scope.selectCategory = function(category) {
      $scope.expense.title = category.title;
      $scope.expense.categoryId = category.id;
      $scope.closeCategoriesModal();
    }

  var updateCategory = function() {
    Category.allByFrequency().then(function(categories){
      $scope.categories = categories;
    });
  };

  $scope.showCategoriesModal = function() {
    $scope.openCategoriesModal();
  }

  $scope.showDatePicker = function () {
      $cordovaDatePicker.show({
          date: new Date($scope.expense.date),
          mode: 'date'
      }).then(function (date) {
          $scope.expense.date = new Date(date);
      });
  };


  $ionicModal.fromTemplateUrl('templates/more_categories.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.categoriesModal = modal;
  });

  $scope.openCategoriesModal = function() {
    $scope.categoriesModal.show();
  };

  $scope.closeCategoriesModal = function() {
    $scope.categoriesModal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.categoriesModal.remove();
  });

  $scope.editExpense = function(){
    $scope.editMode = true;
  }

  $scope.deleteExpense = function(){
    var confirmPopup = $ionicPopup.confirm({
      title: 'Confirm delete',
      template: 'Delete this expense?'
    });
    confirmPopup.then(function(res) {
      if(!res) {
        return;
      } else{
        Expense.remove($stateParams.expenseId).then(function(result){
          if(window.cordova){
            $cordovaToast.show('Expense deleted', 'short', 'top');
          }else{
            alert("Expense deleted");
          }

          $state.go('app.expense');
        })
      }
    });
  }

  $scope.saveExpense = function(){
    var newDate = $scope.expense.date;
    $scope.expense.date = $filter('date')(newDate, 'MM/dd/yyyy');
    console.log("$scope.expense.date "+ $scope.expense.date);
    console.log($scope.expense);
    Expense.update($scope.expense).then(function(result){
      console.log("Expense update result");
      console.log(result);
      $scope.editMode = false;
      $scope.expense.date  = new Date($scope.expense.date);
      console.log("after updating");
      console.log("$scope.expense.date "+ $scope.expense.date);
      console.log($scope.expense);
      $scope.master= angular.copy($scope.expense);
      $scope.master.date = new Date($scope.expense.date);
      console.log($scope.master);
    })
  }

  $scope.cancelEdit = function(){
    angular.copy($scope.master, $scope.expense);
    console.log("cancelling");
    console.log($scope.master);
    console.log($scope.expense);
    $scope.editMode = false;
  }

  var loadExpenseDetails = function(){
    Expense.get($stateParams.expenseId).then(function(result){
      console.log(result);
      $scope.expense = result;
      $scope.expense.date = new Date(result.date);
      $scope.master= angular.copy($scope.expense);
      $scope.master.date = new Date(result.date);
    })
  }

  $scope.$on('$ionicView.enter', function(e) {
      $scope.editMode = false;
      loadExpenseDetails();
      updateCategory();
  })
});