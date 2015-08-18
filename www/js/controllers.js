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

  $scope.openNewCategory = function(addCategory, category){

    if(addCategory){
      $scope.addAction = true;
      $scope.category = {};
    }else{
      $scope.addAction = false;
      $scope.category = angular.copy(category);
    }

    $scope.modal.show();
  };

  $scope.addNewCategory = function(){

    if($scope.category.title == undefined || $scope.category.title == ''){
      if(window.cordova){
        $cordovaToast.show('Enter title', 'short', 'top');
      }else{
        alert("Enter title");
      }
      return;
    }

    if($scope.addAction){
      Category.add($scope.category.title);
    }else{
      Category.update($scope.category.title, $scope.category.id);
    }
    
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

.controller('DashboardCtrl', function($scope, UI, Category, Expense, $filter, $cordovaToast, $ionicPopup, $ionicModal) {

  //UI.setBackButtonSettings(false, '');

  $scope.showCategoriesModal = function() {
      $scope.openCategoriesModal();
    }

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

    $scope.$on('categoriesModal.hidden', function() {
      // Execute action
    });

    $scope.$on('categoriesModal.removed', function() {
      // Execute action
    });
    
    $scope.selectCategory = function(category) {
      $scope.activeCategory = category;
      $scope.expense.category = category;
      $scope.additionalCategoryTitle = category.title;
      $scope.closeCategoriesModal();
    }

  $scope.$on('$ionicView.enter', function(e) {
    UI.setBackButtonSettings(false, '');
    $scope.updateCategory();
    $scope.additionalCategoryTitle = "More Categories";
  });

  $scope.categories = [];

  $scope.activeCategory = {};

  $scope.firstFourcategories = [];

  $scope.updateCategory = function() {
    Category.allByFrequency().then(function(categories){
      $scope.categories = categories;
      $scope.firstFourcategories = $filter('limitTo')($scope.categories, 4);
      console.log($scope.firstFourcategories);
      $scope.categories.splice(0, 4);
      $scope.additionalCategoryTitle = "More Categories";
    });
  };

  $scope.expense = {
    cost: '',
    details: '',
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
    $scope.additionalCategoryTitle = "More Categories";
  }

  $scope.addExpense = function(){

    if($scope.expense.cost != parseFloat($scope.expense.cost)){
      if(window.cordova){
        $cordovaToast.show('Enter valid cost', 'short', 'center')
      }else{
        alert("Enter valid cost");
      }
      return;
    }

    if($scope.expense.category.id == undefined || $scope.expense.category.id == 0){
      console.log("if part");
      var confirmPopup = $ionicPopup.confirm({
        title: 'Category Not Selected',
        template: 'This expense will be added to others'
      });
      confirmPopup.then(function(res) {
        if(!res) {
          return;
        } else{
          var newDate = $scope.expense.date
          newDate = $filter('date')(newDate, 'd/M/yy');
          Expense.add($scope.expense.cost, $scope.expense.category.id, newDate, $scope.expense.details);
          $scope.expense.cost = '';
          $scope.expense.category = {};
          $scope.expense.details = '';
          $scope.expense.date = new Date();

          $scope.updateCategory();
          
          if(window.cordova){
            $cordovaToast.show('Expense added', 'short', 'center')
          }else{
            alert("Expense added");
          }
        }
      });
    }else{
      console.log("else part");
      var newDate2 = $scope.expense.date
      newDate2 = $filter('date')(newDate2, 'd/M/yy');
      Expense.add($scope.expense.cost, $scope.expense.category.id, newDate2, $scope.expense.details);
      $scope.expense.cost = '';
      $scope.expense.category = {};
      $scope.expense.details = '';
      $scope.expense.date = new Date();

      $scope.updateCategory();
      
      if(window.cordova){
        $cordovaToast.show('Expense added', 'short', 'center')
      }else{
        alert("Expense added");
      }
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


