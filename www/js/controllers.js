angular.module('sem.controllers', ['sem.services', 'ngCordova'])

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

    var tempCategory = {};

    $scope.updateCategory();

    $timeout(function(){
      $scope.closeNewCategory();
      $scope.category.title = '';
    }, 0);
  };

})

.controller('CategoryCtrl', function() {

})


.controller('ExpenseCtrl', function($scope, UI, Expense) {
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

.controller('ReportCtrl', function($scope, Report, UI) {
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

.controller('DashboardCtrl', function($scope, UI, Category, Expense, $filter, $cordovaToast) {

  //UI.setBackButtonSettings(false, '');

  $scope.$on('$ionicView.enter', function(e) {
    UI.setBackButtonSettings(false, '');
    $scope.updateCategory();
  });
  
  $scope.categories = [];

  $scope.activeCategory = {};

  $scope.updateCategory = function() {
    Category.allByFrequency().then(function(categories){
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

  $scope.addCategoryToExpense = function(category, index){
    $scope.activeCategory = category;
    $scope.expense.category = category;
  }

  $scope.addExpense = function(){

    if($scope.expense.cost != parseFloat($scope.expense.cost)){
      alert("Please enter valid cost");
      return;
    }


    var newDate = $scope.expense.date
    newDate = $filter('date')(newDate, 'd/M/yy');
    Expense.add($scope.expense.cost, $scope.expense.category.id, newDate);
    $scope.expense.cost = '';
    $scope.expense.category = {};
    $scope.expense.date = new Date();

    $scope.updateCategory();
    
    if(window.cordova){
      $cordovaToast
      .show('Here is a message', 'long', 'center')
      .then(function(success) {
        // success
      }, function (error) {
        // error
      });
    }
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


