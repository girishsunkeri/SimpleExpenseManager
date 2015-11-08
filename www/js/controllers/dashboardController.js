appModule.controller('DashboardCtrl', function($scope, UI, $state, Category, Expense, $filter, $cordovaToast, $ionicPopup, $ionicModal, Settings, $cordovaDatePicker) {

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

  $scope.addExpense = function(scope){

    this.formScope = scope;
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
          newDate = $filter('date')(newDate, 'MM/dd/yyyy');
          Expense.add($scope.expense.cost, $scope.expense.category.id, newDate, expenseDetails);
          $scope.expense.cost = '';
          $scope.expense.category = {};
          $scope.expense.details = '';
          $scope.expense.date = new Date();

          $scope.updateCategory();

          getTotal();
          
          if(window.cordova){
            $cordovaToast.show('Expense added', 'short', 'center')
          }else{
            alert("Expense added");
          }
          console.log("$scope.addExpenseForm");
          console.log($scope.addExpenseForm);
          $scope.addExpenseForm.$dirty = false;
          $scope.addExpenseForm.$pristine = true;
          $scope.addExpenseForm.$submitted = false;
        }
      });
    }else{
      console.log("else part");
      var newDate2 = $scope.expense.date
      newDate2 = $filter('date')(newDate2, 'MM/dd/yyyy');
      Expense.add($scope.expense.cost, $scope.expense.category.id, newDate2, expenseDetails);
      $scope.expense.cost = '';
      $scope.expense.category = {};
      $scope.expense.details = '';
      $scope.expense.date = new Date();

      $scope.updateCategory();

      getTotal();
      
      if(window.cordova){
        $cordovaToast.show('Expense added', 'short', 'center')
      }else{
        alert("Expense added");
      }

      console.log("$scope.addExpenseForm");
      console.log(this.formScope.addExpenseForm);
      this.formScope.addExpenseForm.$dirty = false;
      this.formScope.addExpenseForm.$pristine = true;
      this.formScope.addExpenseForm.$submitted = false;
    }
  }

  var getTotal = function(){
    var offsetDate = new Date();
    Settings.get('offsetDate').then(function(result){
      if(result){
        offsetDate = new Date(result.SettingValue);
      }
      Expense.getTotalCost(offsetDate).then(function(costObject){
        $scope.totalCost = 0;
        if(costObject.totalCost){
          $scope.totalCost = costObject.totalCost;
        }
      });
    })
  }
});