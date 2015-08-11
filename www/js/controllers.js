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

    console.log("$scope.categoryTitle: " + $scope.category.title);
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


.controller('ItemCtrl', function($scope, $stateParams, UI, Item) {
  $scope.items = [];

  $scope.$on('$ionicView.enter', function(e) {
    UI.setBackButtonSettings(true, '');
    $scope.updateItems();
  });

  $scope.updateItems = function() {
        console.log("updating items");
        Item.all().then(function(items){
          $scope.items = items;
        });
      };
})



.controller('DashboardCtrl', function($scope, UI, Category, Item, $filter) {

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
    console.log("setting false");
    UI.setBackButtonSettings(false, '');
    $scope.updateCategory();
  });

  $scope.addCategoryToExpense = function(category, index){
    console.log("Added expense to " + category);
    $scope.activeCategory = category;
    $scope.expense.category = category;
  }

  $scope.addExpense = function(){
    console.log("Adding new expense(passing): " + $scope.expense.cost + " " + $scope.expense.category.id + " " + $scope.expense.date);
    var newDate = $scope.expense.date
    newDate = $filter('date')(newDate, 'd/M/yy');
    console.log("newDate");
    console.log(newDate);
    Item.add($scope.expense.cost, $scope.expense.category.id, newDate);
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


