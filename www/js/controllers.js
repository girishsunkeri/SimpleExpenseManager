angular.module('sem.controllers', ['sem.services'])

.controller('CategoriesCtrl', function($scope, $ionicModal, $timeout, UI, Category) {

  $scope.category = {};

  $scope.categories = [];

  $scope.$on('$ionicView.enter', function(e) {
    UI.setBackButtonSettings(true, '');
  });

  $scope.updateCategory = function() {
    Category.all().then(function(categories){
      $scope.categories = categories;
    });
  };

  $scope.updateCategory();


  $ionicModal.fromTemplateUrl('templates/addCategory.html', {
    scope: $scope
  }).then(function(modal){
    $scope.modal = modal;
  });

  $scope.closeNewCategory = function(){
    $scope.modal.hide();
  };

  $scope.openNewCategory = function(){
    $scope.modal.show();
  };

  $scope.addNewCategory = function(){
    Category.add($scope.category.title);
    $scope.updateCategory();

    $timeout(function(){
      $scope.closeNewCategory();
      $scope.category.title = '';
    }, 0);
  };

})

.controller('CategoryCtrl', function($scope, $stateParams, UI, Categories) {

})


.controller('ExpenseCtrl', function($scope, $stateParams, UI, Expense) {
  $scope.expenses = [];

  $scope.$on('$ionicView.enter', function(e) {
    UI.setBackButtonSettings(true, '');
    $scope.updateExpenses();
  });

  $scope.updateExpenses = function() {
    Expense.all().then(function(expenses){
      $scope.expenses = expenses;
    });
  };
})

.controller('ReportCtrl', function($scope, $stateParams, UI, Report) {
  $scope.reportExpenses = [];

  $scope.$on('$ionicView.enter', function(e) {
    UI.setBackButtonSettings(true, '');
    $scope.updateReportExpenses();
  });

  $scope.updateReportExpenses = function() { 
    Report.getReport().then(function(reportExpenses){
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

})

.controller('DashboardCtrl', function($scope, UI, Category, Expense, $filter, $ionicLoading) {

  $scope.categories = [];

  $scope.activeCategory = {};

  $scope.updateCategory = function() {
    Category.all().then(function(categories){
      $scope.categories = categories;
    });
  };

  $scope.expense = {
    cost: '',
    date: '',
    category: {}
  };

  $scope.expense.date = new Date();

  $scope.datePickerCallback = function (val) {
      if(typeof(val)==='undefined'){      
          console.log('Date not selected');
      }else{
          console.log('Selected date is : ', val);
      }
  };

  $scope.$on('$ionicView.enter', function(e) {
    UI.setBackButtonSettings(false, '');
    $scope.updateCategory();
  });

  $scope.addCategoryToExpense = function(category, index){
    $scope.activeCategory = category;
    $scope.expense.category = category;
  }

  $scope.addExpense = function(){
    var newDate = $scope.expense.date
    newDate = $filter('date')(newDate, 'd/M/yy');
    Expense.add($scope.expense.cost, $scope.expense.category.id, newDate);
    $scope.expense.cost = '';
    $scope.expense.category = {};
    $scope.expense.date = new Date();
    $ionicLoading.show({ template: 'Expense Added!', noBackdrop: true, duration: 2000 });
  }
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout, UI, $state) {

  $scope.loginData = {};

  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  $scope.login = function() {
    $scope.modal.show();
  };

  $scope.doLogin = function() {
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  $scope.showBackButton = UI.backButtonStatus;

  $scope.navigateToPreviousScreen = function(){
    $state.go('app.dashboard');
  };
})


