angular.module('sem.controllers', ['sem.services', 'ngCordova'])

.controller('CategoriesCtrl', function($scope, $ionicModal, $timeout, UI, Category) {

  $scope.category = {};

  $scope.categories = [];

  $scope.$on('$ionicView.enter', function(e) {
    //UI.setBackButtonSettings(true, '');
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
    //UI.setBackButtonSettings(true, '');
    $scope.updateExpenses();
  });

  $scope.updateExpenses = function() {
    Expense.all().then(function(expenses){
      $scope.expenses = expenses;
    });
  };
})

.controller('ReportCtrl', function($scope, Report, UI, Expense, $timeout, Settings, $cordovaDatePicker) {
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
          date: new Date(),
          mode: 'date'
      }).then(function (date) {
          $scope.startDate = new Date(date);
          $scope.updateReportExpenses();
      }); 
  };

  $scope.endDatePicker = function () {
      $cordovaDatePicker.show({
          date: new Date(),
          mode: 'date'
      }).then(function (date) {
          $scope.endDate = new Date(date);
          $scope.updateReportExpenses();
      }); 
  };

})

.controller('DashboardCtrl', function($scope, UI, Category, Expense, $filter, $cordovaToast, $ionicPopup, $ionicModal, Settings, $cordovaDatePicker) {

  //UI.setBackButtonSettings(false, '');
  $scope.expense = {
      cost: '',
      details: '',
      date: '',
      category: {}
    };

  $scope.noWarningPopup = { checked: true}
  $scope.budget = 0;
  $scope.expense.date = new Date();

  $scope.showDatePicker = function () {
      $cordovaDatePicker.show({
          date: new Date(),
          mode: 'date'
      }).then(function (date) {
          $scope.expense.date = new Date(date);
      });
  };

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
    //UI.setBackButtonSettings(false, '');
    $scope.updateCategory();
    $scope.additionalCategoryTitle = "More Categories";
    Settings.get('warningPopup').then(function(result){
      if(result){
        console.log("got bones "+result.SettingValue);
        $scope.noWarningPopup = { checked: result.SettingValue == 'true' ? true : false };
        console.log("got "+ $scope.noWarningPopup.checked);
      }
    })

    Settings.get('budget').then(function(result){
    if(result){
      $scope.budget = parseFloat(result.SettingValue);
    }
  })
    getTotal();
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

  $scope.expense.date = new Date();

  var datePickerCallback = function (val) {
      if(val != "undefined"){
        $scope.expense.date = new Date(val);
      }
      if(typeof(val)==='undefined'){      
          console.log('Date not selected');
      }else{
          console.log('Selected date is : ', val);
      }
  };

  $scope.addCategoryToExpense = function(category, index){
    $scope.activeCategory = category;
    $scope.expense.category = category;
    console.log(category);
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

    var expenseDetails = $scope.expense.details;
    if($scope.expense.details == ''){
      expenseDetails = '----';
    }

    console.log("$scope.noWarningPopup.checked: "+$scope.noWarningPopup.checked);

    if(($scope.expense.category.id == undefined || $scope.expense.category.id == 0) && $scope.noWarningPopup.checked == false){
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
          newDate = $filter('date')(newDate, 'dd/MM/yyyy');
          Expense.add($scope.expense.cost, $scope.expense.category.id, newDate, expenseDetails);
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
      newDate2 = $filter('date')(newDate2, 'dd/MM/yyyy');
      Expense.add($scope.expense.cost, $scope.expense.category.id, newDate2, expenseDetails);
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

  var getTotal = function(){
    var offsetDate = new Date();
    Settings.get('offsetDate').then(function(result){
      if(result){
        offsetDate = new Date(result.SettingValue);
      }
      Expense.getTotalCost(offsetDate).then(function(costObject){
        $scope.totalCost = costObject.totalCost;
      });

    })

  }
})

.controller('SettingsCtrl', function($scope, Settings, $filter, $cordovaDatePicker) {
  
  $scope.noWarningPopup = { checked: true};

  $scope.totalBudget = 2;

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
    if(totalBudget == "") totalBudget = 0;
    Settings.set('budget', totalBudget);
  }

  $scope.datePicker = function (val) {
    $cordovaDatePicker.show({
          date: new Date(),
          mode: 'date'
      }).then(function (date) {
          $scope.offsetDate = new Date(date);
          Settings.set('offsetDate', $scope.offsetDate);
      }); 
  };
})

.controller('ChartCtrl', function($scope, Report, Settings, $cordovaToast, $cordovaDatePicker) {
  $scope.labels = [];
  $scope.series = [];
  $scope.data = [
      []
  ];
  $scope.itemcount = 0;

  $scope.startDate = new Date();

  $scope.endDate = new Date();

  $scope.startDatePicker  = function () {
      $cordovaDatePicker.show({
          date: new Date(),
          mode: 'date'
      }).then(function (date) {
          $scope.startDate = new Date(date);
          $scope.updateReportExpenses();
      }); 
  };

  $scope.endDatePicker  = function (val) {
      $cordovaDatePicker.show({
          date: new Date(),
          mode: 'date'
      }).then(function (date) {
          $scope.endDate = new Date(date);
          $scope.updateReportExpenses();
      }); 
  };

  
  $scope.updateReportExpenses = function(){
    Report.getReportByDate($scope.startDate, $scope.endDate).then(function(reportExpenses){
      $scope.labels = [];
      $scope.series = [];
      $scope.data = [
          []
      ];

      $scope.itemcount = 0;

      console.log("reportExpenses " + reportExpenses.length)
      $scope.reportExpenses = reportExpenses;
      if($scope.reportExpenses.length > 0){
        $scope.itemcount = $scope.reportExpenses.length;
        console.log("$scope.itemcount");
        console.log($scope.itemcount);
        var max = parseFloat($scope.reportExpenses[0].totalCost);
      }else{
        if(window.cordova){
          $cordovaToast.show('Records not found', 'short', 'top');
        }else{
          alert("Records not found");
        }
      }
      angular.forEach($scope.reportExpenses, function(value, key){
          var percentage = (parseFloat(value.totalCost)/max) * 100;
          $scope.labels.push(value.title);
          $scope.data[0].push(percentage);
      });
    });
  }



  $scope.$on('$ionicView.enter', function(e) {

    Settings.get('offsetDate').then(function(result){
      console.log(result);
      if(result){
        $scope.startDate = new Date(result.SettingValue);
      }

      $scope.updateReportExpenses();
    })
  });

  
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


