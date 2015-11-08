appModule.controller('CategoriesCtrl', function($scope, $ionicPopup, $ionicModal, $timeout, UI, Category) {

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

  $scope.deleteCategory = function(){
    console.log("sadfasd");
    var confirmPopup = $ionicPopup.confirm({
      title: 'Confirm delete',
      template: 'Deleting this will delete all related expenses. Continue?'
    });
    confirmPopup.then(function(res) {
      if(!res) {
        return;
      } else{
        Category.remove($scope.category.id).then(function(){
          if(window.cordova){
            $cordovaToast.show('Deleted successfully', 'short', 'top');
          }else{
            alert("Deleted successfully");
          }

          $timeout(function(){
          $scope.category= {};
          $scope.closeNewCategory();
        }, 0);
        })
      }
    });
  };

  $scope.addNewCategory = function(){

    console.log("updating my ass");
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
});