angular.module('sem.controllers', ['sem.services'])

.controller('CategoriesCtrl', function($scope, $ionicModal, $timeout, UI, Categories) {

  $scope.category = {};

  $scope.categories = Categories.types;

  $scope.$on('$ionicView.enter', function(e) {
    UI.setBackButtonSettings(true, '');
  });


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

    console.log("$scope.categoryTitle: " + $scope.category.title);
    Categories.addNewCategory($scope.category.title);

    $timeout(function(){
      $scope.closeNewCategory();
      $scope.category.title = '';
    }, 0);
  };

})

.controller('CategoryCtrl', function($scope, $stateParams, UI, Categories) {

})


.controller('ExpenseCtrl', function($scope, $stateParams, UI, User) {
  $scope.expenses = User.expenses;

  $scope.$on('$ionicView.enter', function(e) {
    UI.setBackButtonSettings(true, '');
  });
})



.controller('DashboardCtrl', function($scope, UI, Categories, User) {

  $scope.categories = Categories.types;

  $scope.activeCategory = { };

  $scope.expense = {
    cost: '',
    date: '',
    category: {}
  };

  $scope.$on('$ionicView.enter', function(e) {
    console.log("setting false");
    UI.setBackButtonSettings(false, '');
  });

  $scope.addCategoryToExpense = function(category, index){
    console.log("Added expense to " + category);
    $scope.activeCategory = category;
    $scope.expense.category = category;
  }

  $scope.addExpense = function(){
    console.log("Adding new expense(passing): " + $scope.expense.cost + " " + $scope.expense.category.id + " " + $scope.expense);
    User.addExpense($scope.expense.cost, $scope.expense.category.id, $scope.expense);
  }

})

.controller('AppCtrl', function($scope, $ionicModal, $timeout, UI, $state) {

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  $scope.showBackButton = UI.backButtonStatus;

  $scope.navigateToPreviousScreen = function(){
    $state.go('app.dashboard');
  };
})


